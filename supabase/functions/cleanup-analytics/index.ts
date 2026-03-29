import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require CRON_SECRET — fail closed if it is not configured
    const cronSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoff = cutoffDate.toISOString();

    console.log(`Deleting analytics data older than ${cutoff}`);

    // Delete old analytics events
    const { error: eventsError, count: eventsCount } = await supabaseAdmin
      .from("analytics_events")
      .delete({ count: "exact" })
      .lt("created_at", cutoff);

    if (eventsError) {
      console.error("Error deleting analytics_events:", eventsError);
    }

    // Delete old page views
    const { error: viewsError, count: viewsCount } = await supabaseAdmin
      .from("analytics_page_views")
      .delete({ count: "exact" })
      .lt("created_at", cutoff);

    if (viewsError) {
      console.error("Error deleting analytics_page_views:", viewsError);
    }

    const result = {
      success: true,
      deleted: {
        analytics_events: eventsCount ?? 0,
        analytics_page_views: viewsCount ?? 0,
      },
      cutoff_date: cutoff,
    };

    console.log("Cleanup complete:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
