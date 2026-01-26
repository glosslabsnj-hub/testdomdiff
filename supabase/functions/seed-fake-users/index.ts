import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common first names
const FIRST_NAMES = [
  "James", "John", "Robert", "Michael", "David", "William", "Richard", "Joseph", "Thomas", "Charles",
  "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua",
  "Kenneth", "Kevin", "Brian", "George", "Timothy", "Ronald", "Edward", "Jason", "Jeffrey", "Ryan",
  "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon",
  "Benjamin", "Samuel", "Raymond", "Gregory", "Frank", "Alexander", "Patrick", "Jack", "Dennis", "Jerry",
  "Tyler", "Aaron", "Jose", "Adam", "Nathan", "Henry", "Douglas", "Zachary", "Peter", "Kyle",
  "Noah", "Ethan", "Jeremy", "Walter", "Christian", "Keith", "Roger", "Terry", "Austin", "Sean",
  "Gerald", "Carl", "Harold", "Dylan", "Arthur", "Lawrence", "Jordan", "Jesse", "Bryan", "Billy",
  "Bruce", "Gabriel", "Joe", "Logan", "Albert", "Willie", "Alan", "Eugene", "Russell", "Vincent",
  "Philip", "Bobby", "Johnny", "Bradley", "Roy", "Ralph", "Randy", "Louis", "Howard", "Martin"
];

// Common last names
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
  "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes",
  "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper",
  "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
  "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes",
  "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez"
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmail(firstName: string, lastName: string, index: number): string {
  const randomNum = Math.floor(Math.random() * 9999);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${randomNum}.${index}@test.redeemed.com`;
}

function getRandomDate(daysAgoMin: number, daysAgoMax: number): string {
  const daysAgo = Math.floor(Math.random() * (daysAgoMax - daysAgoMin + 1)) + daysAgoMin;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Distribution: 10 Free World, 245 Gen Pop, 245 Solitary = 500 total
    const distribution = [
      { planType: "coaching", count: 10 },        // Free World
      { planType: "transformation", count: 245 }, // Gen Pop
      { planType: "membership", count: 245 },     // Solitary
    ];

    const results = {
      created: 0,
      failed: 0,
      byPlan: { coaching: 0, transformation: 0, membership: 0 } as Record<string, number>,
      errors: [] as string[],
    };

    let userIndex = 0;

    for (const { planType, count } of distribution) {
      console.log(`Creating ${count} users for plan: ${planType}`);
      
      for (let i = 0; i < count; i++) {
        userIndex++;
        const firstName = getRandomItem(FIRST_NAMES);
        const lastName = getRandomItem(LAST_NAMES);
        const email = generateEmail(firstName, lastName, userIndex);
        const password = `TestPass123!${userIndex}`;

        try {
          // Create auth user
          const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });

          if (userError) {
            results.failed++;
            results.errors.push(`User ${email}: ${userError.message}`);
            continue;
          }

          const userId = userData.user.id;

          // Create profile
          const { error: profileError } = await supabase.from("profiles").insert({
            user_id: userId,
            email: email,
            first_name: firstName,
            last_name: lastName,
            intake_completed_at: getRandomDate(30, 90),
            onboarding_video_watched: true,
          });

          if (profileError) {
            console.error(`Profile error for ${email}:`, profileError);
          }

          // Create subscription with randomized start dates
          const startedAt = getRandomDate(30, 90);
          const expiresAt = planType === "transformation" 
            ? new Date(new Date(startedAt).getTime() + 98 * 24 * 60 * 60 * 1000).toISOString() 
            : null;

          const { error: subError } = await supabase.from("subscriptions").insert({
            user_id: userId,
            plan_type: planType,
            status: "active",
            started_at: startedAt,
            expires_at: expiresAt,
          });

          if (subError) {
            console.error(`Subscription error for ${email}:`, subError);
          }

          results.created++;
          results.byPlan[planType]++;

          // Log progress every 50 users
          if (results.created % 50 === 0) {
            console.log(`Progress: ${results.created} users created...`);
          }

        } catch (err) {
          results.failed++;
          results.errors.push(`User ${email}: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }
    }

    console.log("Seeding complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${results.created} fake users (${results.failed} failed)`,
        breakdown: {
          freeWorld: results.byPlan.coaching,
          genPop: results.byPlan.transformation,
          solitary: results.byPlan.membership,
        },
        errors: results.errors.slice(0, 10), // Only return first 10 errors
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
