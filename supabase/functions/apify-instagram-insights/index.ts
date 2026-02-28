// Apify Instagram Insights — fetches real IG profile data via Apify scraper
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS_HEADERS } from "../_shared/brand-voice.ts";

const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");

interface ApifyRunInput {
  directUrls: string[];
  resultsType: string;
  resultsLimit: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Validate auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { error: authError } = await supabaseAuth.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { handles = ["domdifferent_"] } = await req.json();

    if (!APIFY_API_TOKEN) {
      throw new Error("APIFY_API_TOKEN not configured. Set it with: npx supabase secrets set APIFY_API_TOKEN=your_token");
    }

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check cache first (24hr TTL)
    const allInsights: Record<string, any> = {};
    const handlesToFetch: string[] = [];

    for (const handle of handles) {
      const { data: cached } = await supabaseService
        .from("instagram_insights")
        .select("*")
        .eq("profile_handle", handle)
        .gt("expires_at", new Date().toISOString())
        .order("fetched_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cached) {
        allInsights[handle] = cached.data;
      } else {
        handlesToFetch.push(handle);
      }
    }

    // Fetch from Apify for uncached handles
    if (handlesToFetch.length > 0) {
      const directUrls = handlesToFetch.map(
        (h) => `https://www.instagram.com/${h.replace(/^@/, "")}/`
      );

      // Run Apify Instagram Profile Scraper
      const runResponse = await fetch(
        `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            directUrls,
            resultsType: "details",
            resultsLimit: 12,
          } as ApifyRunInput),
        }
      );

      if (!runResponse.ok) {
        const errorText = await runResponse.text();
        console.error("Apify API error:", runResponse.status, errorText);
        throw new Error(`Apify API error: ${runResponse.status}`);
      }

      const apifyResults = await runResponse.json();

      // Process each profile result
      for (const profile of apifyResults) {
        const handle = profile.username || profile.ownerUsername || handlesToFetch[0];

        const insights = {
          username: handle,
          full_name: profile.fullName || profile.ownerFullName || "",
          biography: profile.biography || "",
          follower_count: profile.followersCount || profile.subscribersCount || 0,
          following_count: profile.followsCount || 0,
          post_count: profile.postsCount || 0,
          is_verified: profile.verified || false,
          profile_pic_url: profile.profilePicUrl || "",
          external_url: profile.externalUrl || "",
          engagement_rate: 0,
          avg_likes: 0,
          avg_comments: 0,
          posts_per_week: 0,
          top_posts: [] as any[],
          recent_posts: [] as any[],
          growth_trend: "stable",
        };

        // Calculate engagement from recent posts
        const posts = profile.latestPosts || profile.posts || [];
        if (posts.length > 0) {
          let totalLikes = 0;
          let totalComments = 0;

          const topPosts = posts
            .map((p: any) => ({
              url: p.url || p.displayUrl || "",
              caption: (p.caption || "").substring(0, 200),
              likes: p.likesCount || p.likes || 0,
              comments: p.commentsCount || p.comments || 0,
              timestamp: p.timestamp || p.takenAtTimestamp || "",
              type: p.type || "image",
              engagement: (p.likesCount || p.likes || 0) + (p.commentsCount || p.comments || 0),
            }))
            .sort((a: any, b: any) => b.engagement - a.engagement);

          for (const post of topPosts) {
            totalLikes += post.likes;
            totalComments += post.comments;
          }

          insights.avg_likes = Math.round(totalLikes / posts.length);
          insights.avg_comments = Math.round(totalComments / posts.length);
          insights.engagement_rate =
            insights.follower_count > 0
              ? parseFloat(
                  (
                    ((insights.avg_likes + insights.avg_comments) /
                      insights.follower_count) *
                    100
                  ).toFixed(2)
                )
              : 0;

          insights.top_posts = topPosts.slice(0, 5);
          insights.recent_posts = topPosts.slice(0, 12);

          // Estimate posts per week from timestamps
          if (posts.length >= 2) {
            const timestamps = posts
              .map((p: any) => new Date(p.timestamp || p.takenAtTimestamp || 0).getTime())
              .filter((t: number) => t > 0)
              .sort((a: number, b: number) => b - a);

            if (timestamps.length >= 2) {
              const spanDays = (timestamps[0] - timestamps[timestamps.length - 1]) / (1000 * 60 * 60 * 24);
              insights.posts_per_week = spanDays > 0
                ? parseFloat((timestamps.length / (spanDays / 7)).toFixed(1))
                : 0;
            }
          }
        }

        allInsights[handle] = insights;

        // Cache in DB
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await supabaseService.from("instagram_insights").insert({
          profile_handle: handle,
          data: insights,
          fetched_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        });
      }
    }

    return new Response(
      JSON.stringify({ insights: allInsights }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching Instagram insights:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
