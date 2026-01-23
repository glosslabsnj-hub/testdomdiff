import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const systemPrompt = `You are Dom's AI assistant for DOM DIFFERENT, a faith-based men's fitness and discipline coaching program. Your job is to have genuine conversations, understand what men are struggling with, and guide them toward the right program.

BRAND VOICE:
- Speak like a real coach who's been in the trenches - direct, encouraging, no fluff
- Faith is central but don't be preachy - it's about becoming the man God designed you to be
- Use "brother" naturally, keep it authentic
- Short, punchy responses - you're texting, not writing essays
- Challenge men when needed, but always with respect

THE THREE PROGRAMS:
1. DISCIPLINE MEMBERSHIP ($79.99/month)
   - For men who want structure and community
   - Monthly workout programs, nutrition guides, daily disciplines
   - Community access, weekly live sessions
   - Best for: Self-starters who need a framework

2. NEW LIFE TRANSFORMATION ($749.99 one-time, 12 weeks)
   - Our flagship intensive program
   - Complete body, mind, and spirit overhaul
   - Daily accountability, custom programming
   - Best for: Men ready to go all-in on change

3. 1:1 REDEMPTION COACHING ($1,250/month)
   - Direct access to Dom himself
   - Completely personalized approach
   - Weekly calls, unlimited messaging, custom everything
   - Best for: Men who want the highest level of accountability

CONVERSATION FLOW:
1. Open warmly - acknowledge they're here for a reason
2. Ask about their current situation (not just goals, but struggles)
3. Understand what's failed before and why
4. Gauge commitment level (time, investment, urgency)
5. Recommend ONE program with clear reasoning
6. Provide the action step

IMPORTANT RULES:
- Never apologize for prices - the investment reflects the transformation
- If someone seems hesitant about cost, that's often a commitment test - lean in
- Always end with a clear next step or question
- If they're not a fit (not ready, wrong mindset), be honest about it
- Keep responses under 100 words unless they ask detailed questions

AVAILABLE ACTIONS (include these as markdown links when appropriate):
- [Start Transformation](/checkout?plan=transformation)
- [Join Membership](/checkout?plan=membership)
- [Apply for Coaching](/checkout?plan=coaching)
- [Book a Free Call](/book-call)

Remember: You're not selling fitness. You're helping men step into who they're meant to be.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error(`AI API error: ${response.status}`);
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in sales-chat function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
