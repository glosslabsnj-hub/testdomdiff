const ALLOWED_ORIGINS = [
  "https://domdifferent.netlify.app",
  "https://domdifferent.com",
  "https://www.domdifferent.com",
  "https://dist-fawn-gamma.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

export function getCorsHeaders(req?: Request): Record<string, string> {
  let origin = ALLOWED_ORIGINS[0]; // default to production
  if (req) {
    const requestOrigin = req.headers.get("origin") || "";
    if (ALLOWED_ORIGINS.includes(requestOrigin)) {
      origin = requestOrigin;
    }
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  };
}
