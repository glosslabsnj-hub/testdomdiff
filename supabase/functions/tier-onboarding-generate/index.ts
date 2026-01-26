import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tier_key, force_regenerate } = await req.json();

    if (!tier_key || !["membership", "transformation", "coaching"].includes(tier_key)) {
      return new Response(
        JSON.stringify({ error: "Invalid tier_key. Must be membership, transformation, or coaching" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current tier config version
    const { data: versionData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "tier_config_version")
      .single();

    const configVersion = parseInt(versionData?.value || "1", 10);
    console.log("Current tier_config_version:", configVersion);

    // Check if a ready video already exists for this tier + version
    const { data: existingVideo } = await supabase
      .from("tier_onboarding_videos")
      .select("*")
      .eq("tier_key", tier_key)
      .eq("tier_config_version", configVersion)
      .single();

    if (existingVideo && existingVideo.status === "ready" && !force_regenerate) {
      console.log("Ready video already exists for", tier_key, "v", configVersion);
      return new Response(
        JSON.stringify({ video: existingVideo, message: "Video already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If currently generating, return that status
    if (existingVideo && ["queued", "generating_script", "generating_audio", "generating_captions"].includes(existingVideo.status) && !force_regenerate) {
      console.log("Video generation in progress for", tier_key);
      return new Response(
        JSON.stringify({ video: existingVideo, message: "Generation in progress" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create or update the video record
    let videoId: string;
    if (existingVideo) {
      const { data: updated, error: updateError } = await supabase
        .from("tier_onboarding_videos")
        .update({
          status: "generating_script",
          error: null,
          script_text: null,
          caption_lines: null,
          audio_url: null,
          captions_srt_url: null,
        })
        .eq("id", existingVideo.id)
        .select()
        .single();

      if (updateError) throw updateError;
      videoId = updated.id;
    } else {
      const { data: created, error: createError } = await supabase
        .from("tier_onboarding_videos")
        .insert({
          tier_key,
          tier_config_version: configVersion,
          status: "generating_script",
        })
        .select()
        .single();

      if (createError) throw createError;
      videoId = created.id;
    }

    console.log("Starting generation pipeline for video:", videoId);

    // Step 1: Generate script
    console.log("Step 1: Generating script...");
    const scriptResponse = await fetch(`${supabaseUrl}/functions/v1/generate-onboarding-script`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ tier_key, video_id: videoId }),
    });

    if (!scriptResponse.ok) {
      const scriptError = await scriptResponse.text();
      console.error("Script generation failed:", scriptError);
      await supabase
        .from("tier_onboarding_videos")
        .update({ status: "failed", error: `Script generation failed: ${scriptError}` })
        .eq("id", videoId);
      
      return new Response(
        JSON.stringify({ error: "Script generation failed", details: scriptError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scriptData = await scriptResponse.json();
    console.log("Script generated successfully");

    // Step 2: Generate audio
    console.log("Step 2: Generating audio...");
    const audioResponse = await fetch(`${supabaseUrl}/functions/v1/generate-onboarding-audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        video_id: videoId,
        script_text: scriptData.script_text,
        tier_key,
      }),
    });

    if (!audioResponse.ok) {
      const audioError = await audioResponse.text();
      console.error("Audio generation failed:", audioError);
      await supabase
        .from("tier_onboarding_videos")
        .update({ status: "failed", error: `Audio generation failed: ${audioError}` })
        .eq("id", videoId);
      
      return new Response(
        JSON.stringify({ error: "Audio generation failed", details: audioError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioData = await audioResponse.json();
    console.log("Audio generated successfully:", audioData.audio_url);

    // Step 3: Generate SRT captions
    console.log("Step 3: Generating captions...");
    const captionLines = scriptData.caption_lines || [];
    let srtContent = "";
    
    captionLines.forEach((line: { text: string; start: number; end: number }, index: number) => {
      const startTime = formatSrtTime(line.start);
      const endTime = formatSrtTime(line.end);
      srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${line.text}\n\n`;
    });

    // Upload SRT file
    const srtPath = `${tier_key}/captions-v${configVersion}.srt`;
    const { error: srtUploadError } = await supabase.storage
      .from("onboarding-assets")
      .upload(srtPath, new TextEncoder().encode(srtContent), {
        contentType: "text/plain",
        upsert: true,
      });

    if (srtUploadError) {
      console.error("SRT upload error:", srtUploadError);
    }

    const { data: srtUrlData } = supabase.storage
      .from("onboarding-assets")
      .getPublicUrl(srtPath);

    // Step 4: Generate simple thumbnail (placeholder for now)
    const thumbnailUrl = null; // Can add image generation later

    // Mark as ready
    const { data: finalVideo, error: finalError } = await supabase
      .from("tier_onboarding_videos")
      .update({
        status: "ready",
        captions_srt_url: srtUrlData.publicUrl,
        thumbnail_url: thumbnailUrl,
      })
      .eq("id", videoId)
      .select()
      .single();

    if (finalError) throw finalError;

    console.log("Generation complete! Video ready:", videoId);

    return new Response(
      JSON.stringify({ video: finalVideo, message: "Generation complete" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pipeline error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper to format seconds to SRT timestamp (HH:MM:SS,mmm)
function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.round((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}
