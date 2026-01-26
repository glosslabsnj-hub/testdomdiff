import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Video dimensions: 16:9 horizontal for desktop viewing
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;

// Brand colors
const COLORS = {
  background: "#1a1a1a",
  cardBg: "#262626",
  primary: "#d4af37", // Gold
  text: "#ffffff",
  textMuted: "#a0a0a0",
  accent: "#b8860b",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { video_id } = await req.json();

    if (!video_id) {
      return new Response(
        JSON.stringify({ error: "video_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const creatomateKey = Deno.env.get("CREATOMATE_API_KEY");

    if (!creatomateKey) {
      return new Response(
        JSON.stringify({ error: "CREATOMATE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch video record
    const { data: video, error: fetchError } = await supabase
      .from("tier_onboarding_videos")
      .select("*")
      .eq("id", video_id)
      .single();

    if (fetchError || !video) {
      return new Response(
        JSON.stringify({ error: "Video record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!video.audio_url) {
      return new Response(
        JSON.stringify({ error: "Audio not generated yet" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to rendering
    await supabase
      .from("tier_onboarding_videos")
      .update({ status: "rendering_video" })
      .eq("id", video_id);

    console.log("Starting video render for:", video.tier_key, "v", video.tier_config_version);

    // Parse slides and captions
    const slides = video.slides || generateDefaultSlides(video.tier_key);
    const captionLines = video.caption_lines || [];
    const audioDuration = video.duration_seconds || 75;

    // Build Creatomate source JSON
    const creatomateSource = buildCreatomateSource(
      slides,
      captionLines,
      video.audio_url,
      audioDuration,
      video.tier_key
    );

    console.log("Sending render request to Creatomate...");

    // Send render request
    const renderResponse = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${creatomateKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        output_format: "mp4",
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        frame_rate: 30,
        source: creatomateSource,
      }),
    });

    if (!renderResponse.ok) {
      const errorText = await renderResponse.text();
      console.error("Creatomate error:", errorText);
      
      await supabase
        .from("tier_onboarding_videos")
        .update({ status: "failed", error: `Creatomate error: ${errorText}` })
        .eq("id", video_id);

      return new Response(
        JSON.stringify({ error: "Video render failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const renderData = await renderResponse.json();
    console.log("Render initiated:", renderData);

    // Creatomate returns an array of renders
    const render = Array.isArray(renderData) ? renderData[0] : renderData;
    const renderId = render.id;

    // Poll for completion (max 5 minutes)
    let mp4Url: string | null = null;
    let thumbnailUrl: string | null = null;
    const maxAttempts = 60;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
        headers: {
          "Authorization": `Bearer ${creatomateKey}`,
        },
      });

      if (!statusResponse.ok) {
        console.error("Failed to check render status");
        continue;
      }

      const statusData = await statusResponse.json();
      console.log("Render status:", statusData.status);

      if (statusData.status === "succeeded") {
        mp4Url = statusData.url;
        thumbnailUrl = statusData.snapshot_url || null;
        break;
      } else if (statusData.status === "failed") {
        throw new Error(`Render failed: ${statusData.error_message || "Unknown error"}`);
      }
    }

    if (!mp4Url) {
      throw new Error("Render timed out after 5 minutes");
    }

    console.log("Render complete! MP4 URL:", mp4Url);

    // Update the video record with the MP4 URL
    const { error: updateError } = await supabase
      .from("tier_onboarding_videos")
      .update({
        status: "ready",
        mp4_url: mp4Url,
        thumbnail_url: thumbnailUrl,
        error: null,
      })
      .eq("id", video_id);

    if (updateError) {
      console.error("Failed to update video record:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        mp4_url: mp4Url,
        thumbnail_url: thumbnailUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Render error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Build Creatomate source JSON for the video
function buildCreatomateSource(
  slides: any[],
  captionLines: any[],
  audioUrl: string,
  totalDuration: number,
  tierKey: string
) {
  const tierName = getTierDisplayName(tierKey);
  const slideCount = slides.length;
  const slideDuration = totalDuration / slideCount;

  // Build slide elements
  const slideElements = slides.map((slide, index) => {
    const startTime = index * slideDuration;
    
    return {
      type: "composition",
      track: 1,
      time: startTime,
      duration: slideDuration,
      elements: [
        // Background
        {
          type: "shape",
          shape: "rectangle",
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
          fill_color: COLORS.background,
        },
        // Card background
        {
          type: "shape",
          shape: "rectangle",
          x: VIDEO_WIDTH / 2,
          y: VIDEO_HEIGHT / 2,
          width: VIDEO_WIDTH * 0.85,
          height: VIDEO_HEIGHT * 0.7,
          fill_color: COLORS.cardBg,
          border_radius: 24,
          animations: [
            {
              type: "scale",
              time: 0,
              duration: 0.3,
              easing: "quadratic-out",
              start_scale: "95%",
            },
          ],
        },
        // Progress indicator
        {
          type: "text",
          text: `${index + 1} / ${slideCount}`,
          x: VIDEO_WIDTH - 100,
          y: 50,
          width: 150,
          height: 40,
          font_family: "Inter",
          font_size: 18,
          fill_color: COLORS.textMuted,
          x_alignment: "right",
        },
        // Tier badge
        {
          type: "text",
          text: tierName.toUpperCase(),
          x: 100,
          y: 50,
          width: 300,
          height: 40,
          font_family: "Inter",
          font_weight: 700,
          font_size: 14,
          fill_color: COLORS.primary,
          letter_spacing: "0.1em",
        },
        // Slide title
        {
          type: "text",
          text: slide.title || `Step ${index + 1}`,
          x: VIDEO_WIDTH / 2,
          y: VIDEO_HEIGHT * 0.32,
          width: VIDEO_WIDTH * 0.75,
          height: 100,
          font_family: "Inter",
          font_weight: 700,
          font_size: 56,
          fill_color: COLORS.text,
          x_alignment: "center",
          y_alignment: "center",
          animations: [
            {
              type: "text-slide",
              time: 0,
              duration: 0.4,
              easing: "quadratic-out",
              split: "word",
            },
          ],
        },
        // Subtitle (jail theme label)
        ...(slide.subtitle ? [{
          type: "text",
          text: slide.subtitle,
          x: VIDEO_WIDTH / 2,
          y: VIDEO_HEIGHT * 0.42,
          width: VIDEO_WIDTH * 0.6,
          height: 40,
          font_family: "Inter",
          font_weight: 500,
          font_size: 22,
          fill_color: COLORS.primary,
          x_alignment: "center",
        }] : []),
        // Bullets
        ...buildBulletElements(slide.bullets || [], VIDEO_HEIGHT * 0.52),
      ],
    };
  });

  // Build caption elements
  const captionElements = captionLines.map((line: any) => ({
    type: "text",
    track: 2,
    time: line.start,
    duration: line.end - line.start,
    text: line.text,
    x: VIDEO_WIDTH / 2,
    y: VIDEO_HEIGHT - 100,
    width: VIDEO_WIDTH * 0.9,
    height: 80,
    font_family: "Inter",
    font_weight: 600,
    font_size: 32,
    fill_color: COLORS.text,
    background_color: "rgba(0,0,0,0.7)",
    background_x_padding: 24,
    background_y_padding: 12,
    background_border_radius: 8,
    x_alignment: "center",
    y_alignment: "center",
  }));

  return {
    output_format: "mp4",
    duration: totalDuration,
    elements: [
      // Audio track
      {
        type: "audio",
        track: 3,
        source: audioUrl,
      },
      // Slides
      ...slideElements,
      // Captions
      ...captionElements,
    ],
  };
}

function buildBulletElements(bullets: string[], startY: number) {
  return bullets.slice(0, 4).map((bullet, i) => ({
    type: "text",
    text: `• ${bullet}`,
    x: VIDEO_WIDTH / 2,
    y: startY + i * 55,
    width: VIDEO_WIDTH * 0.65,
    height: 50,
    font_family: "Inter",
    font_weight: 400,
    font_size: 28,
    fill_color: COLORS.textMuted,
    x_alignment: "center",
    animations: [
      {
        type: "fade",
        time: 0.2 + i * 0.15,
        duration: 0.3,
        easing: "quadratic-out",
      },
    ],
  }));
}

function getTierDisplayName(tierKey: string): string {
  switch (tierKey) {
    case "membership": return "Solitary Confinement";
    case "transformation": return "General Population";
    case "coaching": return "Free World";
    default: return tierKey;
  }
}

function generateDefaultSlides(tierKey: string) {
  const tierName = getTierDisplayName(tierKey);
  
  return [
    {
      title: `Welcome to ${tierName}`,
      subtitle: "Your Orientation Begins",
      bullets: ["Your training program awaits", "Follow the system", "Trust the process"],
    },
    {
      title: "Your Dashboard",
      subtitle: "Command Center",
      bullets: ["Track your progress", "Access your workouts", "Stay accountable"],
    },
    {
      title: "Start Here",
      subtitle: "First Steps",
      bullets: ["Complete your intake", "Set your schedule", "Begin training"],
    },
  ];
}
