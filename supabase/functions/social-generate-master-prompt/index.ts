// Social Generate Master Prompt — Synthesize personality data into a master brand voice prompt via Claude
import {
  BRAND_VOICE_SYSTEM_PROMPT,
  checkApiLimits,
  trackApiUsage,
  CORS_HEADERS,
} from "../_shared/brand-voice.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const body = await req.json();

    // Personality data can come from request body or we read from DB
    let personalityData = body.personality_data;
    let contentSamples = body.content_samples;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If no personality data in request, load from DB
    if (!personalityData) {
      const { data: config } = await supabase
        .from("social_command_config")
        .select("personality_answers, existing_content_samples")
        .limit(1)
        .maybeSingle();

      if (config) {
        personalityData = config.personality_answers;
        contentSamples = contentSamples || config.existing_content_samples;
      }
    }

    const userPrompt = `You are an expert brand voice architect. Your task is to synthesize the following personality data, story details, and content samples into a comprehensive SYSTEM PROMPT that will be used to power an AI content engine.

The system prompt you generate should be usable as-is — drop it straight into a Claude system prompt and it should produce content that sounds EXACTLY like this person.

=== CURRENT HARDCODED PROMPT (for reference — improve on this) ===
${BRAND_VOICE_SYSTEM_PROMPT}

=== PERSONALITY DATA FROM INTERVIEW ===
${JSON.stringify(personalityData || {}, null, 2)}

${contentSamples?.length ? `=== REAL CONTENT SAMPLES (match this voice) ===
${contentSamples.map((s: string, i: number) => `Sample ${i + 1}: ${s}`).join("\n\n")}` : ""}

=== YOUR TASK ===
Generate a NEW, IMPROVED master system prompt that:
1. Captures the FULL multi-dimensional personality (not one-dimensional)
2. Includes specific speech patterns, phrases they'd use, and phrases they'd NEVER use
3. Covers: who they are, their real story, voice & language, values, audience, content philosophy, what makes them different, topics/passions, things to never do, platform details, platform-specific notes
4. Feels like it was written BY someone who knows this person deeply, not by a marketer
5. Is comprehensive enough that any AI reading it would produce authentic content
6. Keeps the practical platform/pricing details from the existing prompt
7. Is significantly more detailed and nuanced than the current prompt

Return ONLY the system prompt text. No markdown wrapping, no explanation, no \`\`\` blocks. Just the raw prompt text that will be used directly.`;

    const limits = await checkApiLimits();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: limits.model,
        max_tokens: 8000,
        system: "You are an expert brand voice architect and copywriter. You create detailed, authentic system prompts that capture a person's full personality, voice, and story.",
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    const generatedPrompt = data.content?.[0]?.text;

    // Track usage
    const usage = data.usage;
    if (usage) {
      await trackApiUsage(
        "social-generate-master-prompt",
        limits.model,
        usage.input_tokens || 0,
        usage.output_tokens || 0
      );
    }

    if (!generatedPrompt) {
      throw new Error("No content in Claude response");
    }

    // Store the generated prompt in DB
    // First check if a config row exists
    const { data: existingConfig } = await supabase
      .from("social_command_config")
      .select("id, master_prompt_version")
      .limit(1)
      .maybeSingle();

    if (existingConfig?.id) {
      await supabase
        .from("social_command_config")
        .update({
          generated_master_prompt: generatedPrompt,
          master_prompt_version: (existingConfig.master_prompt_version || 0) + 1,
          master_prompt_generated_at: new Date().toISOString(),
          ...(personalityData ? { personality_answers: personalityData } : {}),
          ...(contentSamples ? { existing_content_samples: contentSamples } : {}),
        })
        .eq("id", existingConfig.id);
    }

    return new Response(
      JSON.stringify({
        generated_prompt: generatedPrompt,
        model_used: limits.model,
        version: (existingConfig?.master_prompt_version || 0) + 1,
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating master prompt:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
