import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  firstName?: string;
  source?: string;
  tags?: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
    const MAILCHIMP_AUDIENCE_ID = Deno.env.get("MAILCHIMP_AUDIENCE_ID");
    const MAILCHIMP_SERVER = Deno.env.get("MAILCHIMP_SERVER"); // e.g., "us21"

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER) {
      console.error("Mailchimp configuration missing");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, firstName, source, tags }: SubscribeRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Subscribing email:", email, "source:", source);

    // Build Mailchimp member data
    const memberData: any = {
      email_address: email,
      status: "subscribed",
      merge_fields: {},
    };

    if (firstName) {
      memberData.merge_fields.FNAME = firstName;
    }

    if (source) {
      memberData.merge_fields.SOURCE = source;
    }

    if (tags && tags.length > 0) {
      memberData.tags = tags;
    }

    // Add to Mailchimp list
    const response = await fetch(
      `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`anystring:${MAILCHIMP_API_KEY}`)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      // Handle "already subscribed" as success
      if (result.title === "Member Exists") {
        console.log("Member already exists:", email);
        return new Response(
          JSON.stringify({ success: true, message: "Already subscribed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.error("Mailchimp error:", result);
      return new Response(
        JSON.stringify({ error: result.detail || "Failed to subscribe" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully subscribed:", email);

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email subscribe error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
