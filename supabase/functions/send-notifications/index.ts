import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "check_in_reminder" | "streak_alert" | "weekly_update" | "milestone" | "welcome" | "photo_reminder";
  userId?: string;
  metadata?: Record<string, unknown>;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { type, userId, metadata }: NotificationRequest = await req.json();

    console.log(`Processing notification: ${type} for user: ${userId || "all"}`);

    // Get users who need notifications based on type
    let usersToNotify: { id: string; email: string; first_name: string | null }[] = [];

    if (userId) {
      // Single user notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, email, first_name")
        .eq("user_id", userId)
        .single();

      if (profile) {
        usersToNotify = [{ id: profile.user_id, email: profile.email, first_name: profile.first_name }];
      }
    } else {
      // Batch notification based on type
      switch (type) {
        case "check_in_reminder": {
          // Get users with active subscriptions who haven't checked in this week
          const { data: activeUsers } = await supabase
            .from("subscriptions")
            .select("user_id, profiles!inner(user_id, email, first_name)")
            .eq("status", "active");

          if (activeUsers) {
            // Check who has NOT submitted a check-in this week
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const weekStart = startOfWeek.toISOString();

            const { data: recentCheckIns } = await supabase
              .from("check_ins")
              .select("user_id")
              .gte("submitted_at", weekStart);

            const checkedInUserIds = new Set((recentCheckIns || []).map((c) => c.user_id));

            usersToNotify = activeUsers
              .filter((u) => !checkedInUserIds.has(u.user_id))
              .map((u) => ({
                id: u.user_id,
                email: (u.profiles as any).email,
                first_name: (u.profiles as any).first_name,
              }));
          }
          break;
        }

        case "streak_alert": {
          // Get users who had a streak but haven't logged today
          const today = new Date().toISOString().split("T")[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

          // Users who logged yesterday but not today
          const { data: yesterdayLogs } = await supabase
            .from("habit_logs")
            .select("user_id")
            .eq("log_date", yesterday)
            .like("habit_name", "routine_%");

          const { data: todayLogs } = await supabase
            .from("habit_logs")
            .select("user_id")
            .eq("log_date", today)
            .like("habit_name", "routine_%");

          const yesterdayUsers = new Set((yesterdayLogs || []).map((l) => l.user_id));
          const todayUsers = new Set((todayLogs || []).map((l) => l.user_id));

          const atRiskUserIds = [...yesterdayUsers].filter((id) => !todayUsers.has(id));

          if (atRiskUserIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("user_id, email, first_name")
              .in("user_id", atRiskUserIds);

            usersToNotify = (profiles || []).map((p) => ({
              id: p.user_id,
              email: p.email,
              first_name: p.first_name,
            }));
          }
          break;
        }

        case "weekly_update": {
          // Get all active subscription users
          const { data: activeUsers } = await supabase
            .from("subscriptions")
            .select("user_id, profiles!inner(user_id, email, first_name)")
            .eq("status", "active");

          if (activeUsers) {
            usersToNotify = activeUsers.map((u) => ({
              id: u.user_id,
              email: (u.profiles as any).email,
              first_name: (u.profiles as any).first_name,
            }));
          }
          break;
        }

        case "photo_reminder": {
          // Get users with active subscriptions who haven't uploaded a photo in 7 days
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

          const { data: activeUsers } = await supabase
            .from("subscriptions")
            .select("user_id, profiles!inner(user_id, email, first_name)")
            .eq("status", "active");

          if (activeUsers) {
            // Get users with recent photo uploads
            const { data: recentPhotos } = await supabase
              .from("progress_photos")
              .select("user_id")
              .gte("created_at", sevenDaysAgo);

            const usersWithRecentPhotos = new Set((recentPhotos || []).map((p) => p.user_id));

            // Filter to users who need a reminder (no photo in 7 days)
            usersToNotify = activeUsers
              .filter((u) => !usersWithRecentPhotos.has(u.user_id))
              .map((u) => ({
                id: u.user_id,
                email: (u.profiles as any).email,
                first_name: (u.profiles as any).first_name,
              }));
          }
          break;
        }
      }
    }

    console.log(`Found ${usersToNotify.length} users to notify`);

    // Generate email content based on type
    const getEmailContent = (
      notificationType: string,
      firstName: string | null
    ): { subject: string; html: string } => {
      const name = firstName || "Warrior";

      switch (notificationType) {
        case "check_in_reminder":
          return {
            subject: "📋 Time for Your Weekly Check-In | Redeemed Strength",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 40px;">
                <h1 style="color: #d4af37; margin-bottom: 20px;">Hey ${name},</h1>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  It's time for your weekly check-in. The check-in is how we track your progress and make sure you're staying on track.
                </p>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  Don't let the week slip by without documenting your wins and lessons.
                </p>
                <a href="https://testdomdiff.lovable.app/dashboard/check-in" style="display: inline-block; background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                  Submit Check-In →
                </a>
                <p style="color: #666; font-size: 12px; margin-top: 40px;">Iron sharpens iron. - Dom</p>
              </div>
            `,
          };

        case "streak_alert":
          return {
            subject: "🔥 Don't Break Your Streak! | Redeemed Strength",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 40px;">
                <h1 style="color: #d4af37; margin-bottom: 20px;">${name}, Your Streak is at Risk!</h1>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  You were on a roll with your daily discipline. Don't let today slip away.
                </p>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  Get back in and complete your routines. Every day matters.
                </p>
                <a href="https://testdomdiff.lovable.app/dashboard/discipline" style="display: inline-block; background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                  Complete Today's Routines →
                </a>
                <p style="color: #666; font-size: 12px; margin-top: 40px;">No excuses. - Dom</p>
              </div>
            `,
          };

        case "weekly_update":
          return {
            subject: "📊 Your Weekly Program Update | Redeemed Strength",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 40px;">
                <h1 style="color: #d4af37; margin-bottom: 20px;">Weekly Update, ${name}</h1>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  A new week means new opportunities to grow stronger - physically, mentally, and spiritually.
                </p>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  Check your dashboard for this week's workouts, faith lesson, and nutrition plan.
                </p>
                <a href="https://testdomdiff.lovable.app/dashboard" style="display: inline-block; background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                  View This Week's Plan →
                </a>
                <p style="color: #666; font-size: 12px; margin-top: 40px;">Stay locked in. - Dom</p>
              </div>
            `,
          };

        case "milestone":
          return {
            subject: "🏆 Achievement Unlocked! | Redeemed Strength",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 40px;">
                <h1 style="color: #d4af37; margin-bottom: 20px;">Congratulations, ${name}! 🎉</h1>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  You just earned a new milestone badge! Your dedication is paying off.
                </p>
                <a href="https://testdomdiff.lovable.app/dashboard/settings" style="display: inline-block; background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                  View Your Achievements →
                </a>
                <p style="color: #666; font-size: 12px; margin-top: 40px;">Proud of you. - Dom</p>
              </div>
            `,
          };

        case "welcome":
          return {
            subject: "🔓 Welcome to Redeemed Strength | Your Journey Starts Now",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 40px;">
                <h1 style="color: #d4af37; margin-bottom: 20px;">Welcome to the Block, ${name}</h1>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  You just made a decision that's going to change your life. I'm proud of you for taking the first step.
                </p>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  Head to your dashboard and complete the "Start Here" checklist to get oriented.
                </p>
                <a href="https://testdomdiff.lovable.app/dashboard/start-here" style="display: inline-block; background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                  Start Your Transformation →
                </a>
                <p style="color: #666; font-size: 12px; margin-top: 40px;">Let's get after it. - Dom</p>
              </div>
            `,
          };

        case "photo_reminder":
          return {
            subject: "📸 Time for Your Weekly Progress Photo | Redeemed Strength",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 40px;">
                <h1 style="color: #d4af37; margin-bottom: 20px;">Hey ${name},</h1>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  It's been a week since your last progress photo. Your transformation is happening — make sure you're documenting it.
                </p>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                  Every photo is proof of the work you're putting in. Don't skip this.
                </p>
                <a href="https://testdomdiff.lovable.app/dashboard/photos" style="display: inline-block; background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                  Upload Progress Photo →
                </a>
                <p style="color: #666; font-size: 12px; margin-top: 40px;">Stay consistent. - Dom</p>
              </div>
            `,
          };

        default:
          return {
            subject: "Update from Redeemed Strength",
            html: `<p>You have a new notification from Redeemed Strength.</p>`,
          };
      }
    };

    // Log notifications (actual sending would require Resend API key)
    const logs = [];
    for (const user of usersToNotify) {
      const emailContent = getEmailContent(type, user.first_name);

      // Log the notification attempt
      const { data: logData, error: logError } = await supabase
        .from("email_notification_logs")
        .insert({
          user_id: user.id,
          notification_type: type,
          email_to: user.email,
          subject: emailContent.subject,
          status: "pending",
          metadata: metadata || {},
        })
        .select()
        .single();

      if (logError) {
        console.error("Failed to log notification:", logError);
        continue;
      }

      logs.push(logData);

      // Note: Actual email sending requires RESEND_API_KEY
      // When configured, uncomment and use:
      /*
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Redeemed Strength <notifications@yourdomain.com>",
            to: [user.email],
            subject: emailContent.subject,
            html: emailContent.html,
          }),
        });

        if (response.ok) {
          await supabase
            .from("email_notification_logs")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", logData.id);
        } else {
          const error = await response.text();
          await supabase
            .from("email_notification_logs")
            .update({ status: "failed", error_message: error })
            .eq("id", logData.id);
        }
      }
      */
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${usersToNotify.length} notification(s) of type: ${type}`,
        logs: logs.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
