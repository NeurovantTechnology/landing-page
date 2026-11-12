import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "GET") {
    return Response.json({ error: "GET required" }, { status: 405, headers: corsHeaders });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    return Response.json({ error: "Leaderboard unavailable" }, { status: 503, headers: corsHeaders });
  }

  const response = await fetch(`${url}/rest/v1/rpc/waitlist_leaderboard`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!response.ok) {
    return Response.json({ error: "Leaderboard unavailable" }, { status: 503, headers: corsHeaders });
  }

  const rows = await response.json();
  return Response.json(rows, { headers: corsHeaders });
});
