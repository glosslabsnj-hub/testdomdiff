import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tier-based voice selection
// - Onboarding Voice: For Solitary & Gen Pop tier walkthroughs
// - P.O. Voice: For Free World / Coaching tier (professional mentor)
// - Warden Voice: For weekly briefs, tips (unchanged)
const VOICE_MAP = {
  membership: "YtCzf4XXIC5vu5YfIjoP",     // Onboarding voice for Solitary
  transformation: "YtCzf4XXIC5vu5YfIjoP", // Onboarding voice for Gen Pop
  coaching: "4bOoBAdJb8z9qH6OY0IA",       // P.O. voice for Free World
};

// Voice settings per persona
// - Solitary (membership): Normal pace for basic walkthrough
// - Gen Pop (transformation): Slower pace (0.85) so user can follow screen recording
// - Free World (coaching): Slower pace (0.85) so user can follow screen recording
const VOICE_SETTINGS = {
  membership: { 
    stability: 0.7, 
    similarity_boost: 0.75, 
    style: 0.4, 
    use_speaker_boost: true, 
    speed: 0.95 
  },
  transformation: { 
    stability: 0.7, 
    similarity_boost: 0.75, 
    style: 0.4, 
    use_speaker_boost: true, 
    speed: 0.85 // Slower for screen recording sync
  },
  coaching: { 
    stability: 0.65, 
    similarity_boost: 0.8, 
    style: 0.3, 
    use_speaker_boost: true, 
    speed: 0.85 // Slower for screen recording sync
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { video_id, script_text, tier_key } = await req.json();

    if (!script_text || !video_id || !tier_key) {
      return new Response(
        JSON.stringify({ error: "video_id, script_text, and tier_key are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Select voice based on tier
    const voiceId = VOICE_MAP[tier_key as keyof typeof VOICE_MAP] || VOICE_MAP.membership;
    const voiceSettings = VOICE_SETTINGS[tier_key as keyof typeof VOICE_SETTINGS] || VOICE_SETTINGS.membership;

    console.log(`Generating audio for tier: ${tier_key}, voice: ${voiceId}, script length: ${script_text.length}`);

    // Call ElevenLabs TTS API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script_text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      
      // Update video record with error
      await supabase
        .from("tier_onboarding_videos")
        .update({
          status: "failed",
          error: `ElevenLabs error: ${response.status} - ${errorText}`,
        })
        .eq("id", video_id);

      return new Response(
        JSON.stringify({ error: "Failed to generate audio", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("Audio generated, size:", audioBuffer.byteLength, "bytes");

    // Get the current config version for the filename
    const { data: versionData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "tier_config_version")
      .single();

    const configVersion = versionData?.value || "1";
    const audioPath = `${tier_key}/audio-v${configVersion}.mp3`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("onboarding-assets")
      .upload(audioPath, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      await supabase
        .from("tier_onboarding_videos")
        .update({
          status: "failed",
          error: `Storage upload error: ${uploadError.message}`,
        })
        .eq("id", video_id);

      return new Response(
        JSON.stringify({ error: "Failed to upload audio", details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("onboarding-assets")
      .getPublicUrl(audioPath);

    const audioUrl = urlData.publicUrl;
    console.log("Audio uploaded to:", audioUrl);

    // Update the video record with voice_id
    await supabase
      .from("tier_onboarding_videos")
      .update({
        audio_url: audioUrl,
        voice_id: voiceId,
        status: "generating_captions",
      })
      .eq("id", video_id);

    return new Response(
      JSON.stringify({ audio_url: audioUrl, voice_id: voiceId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Audio generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
