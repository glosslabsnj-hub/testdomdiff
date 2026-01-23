import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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

// Extract insights from the conversation using AI
async function extractInsights(messages: Array<{role: string, content: string}>): Promise<{
  goal: string | null;
  experience_level: string | null;
  pain_points: string[];
  interested_program: string | null;
  recommended_program: string | null;
}> {
  if (!LOVABLE_API_KEY || messages.length < 2) {
    return { goal: null, experience_level: null, pain_points: [], interested_program: null, recommended_program: null };
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze this fitness coaching conversation and extract insights. Return a JSON object with:
- goal: The user's primary fitness goal (e.g., "lose weight", "build muscle", "get disciplined", "transform lifestyle")
- experience_level: Their fitness experience ("beginner", "intermediate", "advanced", or null)
- pain_points: Array of struggles they mentioned (e.g., ["consistency", "motivation", "time management"])
- interested_program: Which program they seem interested in ("membership", "transformation", "coaching", or null)
- recommended_program: Which program the assistant recommended ("membership", "transformation", "coaching", or null)

Only return the JSON object, nothing else.`
          },
          {
            role: 'user',
            content: `Conversation:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`
          }
        ],
      }),
    });

    if (!response.ok) return { goal: null, experience_level: null, pain_points: [], interested_program: null, recommended_program: null };

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Error extracting insights:', e);
  }

  return { goal: null, experience_level: null, pain_points: [], interested_program: null, recommended_program: null };
}

// Track or update lead in database
async function trackLead(
  sessionId: string,
  messages: Array<{role: string, content: string}>,
  userId?: string
) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials for analytics');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Check if lead exists
    const { data: existingLead } = await supabase
      .from('chat_leads')
      .select('id, message_count')
      .eq('session_id', sessionId)
      .single();

    const userMessages = messages.filter(m => m.role === 'user');
    const firstMessage = userMessages[0]?.content || null;
    const messageCount = messages.length;

    // Extract insights every 4 messages or on first message
    let insights: {
      goal: string | null;
      experience_level: string | null;
      pain_points: string[];
      interested_program: string | null;
      recommended_program: string | null;
    } = { goal: null, experience_level: null, pain_points: [], interested_program: null, recommended_program: null };
    
    if (messageCount === 2 || messageCount % 4 === 0) {
      insights = await extractInsights(messages);
    }

    if (existingLead) {
      // Update existing lead
      const updateData: Record<string, unknown> = {
        message_count: messageCount,
      };

      // Only update insights if we have new ones
      if (insights.goal) updateData.goal = insights.goal;
      if (insights.experience_level) updateData.experience_level = insights.experience_level;
      if (insights.pain_points?.length) updateData.pain_points = insights.pain_points;
      if (insights.interested_program) updateData.interested_program = insights.interested_program;
      if (insights.recommended_program) updateData.recommended_program = insights.recommended_program;
      if (userId) updateData.user_id = userId;

      await supabase
        .from('chat_leads')
        .update(updateData)
        .eq('id', existingLead.id);
    } else {
      // Create new lead
      await supabase
        .from('chat_leads')
        .insert({
          session_id: sessionId,
          user_id: userId || null,
          first_message: firstMessage,
          message_count: messageCount,
          goal: insights.goal,
          experience_level: insights.experience_level,
          pain_points: insights.pain_points,
          interested_program: insights.interested_program,
          recommended_program: insights.recommended_program,
        });
    }
  } catch (e) {
    console.error('Error tracking lead:', e);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId, userId } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Track lead analytics (don't await - fire and forget)
    if (sessionId) {
      trackLead(sessionId, messages, userId).catch(e => console.error('Lead tracking error:', e));
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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
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
