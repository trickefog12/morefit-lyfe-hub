import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("User authentication failed");
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (adminError || !isAdmin) {
      console.error("Admin check failed");
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse request body
    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: "Target user ID is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Admin resetting download limit for user");

    // Delete all download analytics events for the target user
    const { error: deleteError } = await supabaseClient
      .from("analytics_events")
      .delete()
      .eq("user_id", targetUserId)
      .eq("event_type", "download");

    if (deleteError) {
      console.error("Failed to delete download events");
      return new Response(
        JSON.stringify({ error: "Failed to reset download limit" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Download limit reset successfully");

    // Get target user email
    const { data: targetProfile } = await supabaseClient
      .from("profiles")
      .select("email")
      .eq("id", targetUserId)
      .single();

    // Log the admin action to audit_logs
    await supabaseClient
      .from("audit_logs")
      .insert({
        admin_id: user.id,
        admin_email: user.email || "unknown",
        action_type: "reset_download_limit",
        target_user_id: targetUserId,
        details: {
          target_email: targetProfile?.email || "unknown",
        },
      });

    // Send notification email in the background (don't await)
    supabaseClient.functions.invoke('send-admin-notification', {
      body: {
        actionType: 'reset_download_limit',
        actionLabel: 'Reset Download Limit',
        performedBy: user.email || 'Unknown Admin',
        target: `User: ${targetProfile?.email || 'Unknown'}`,
        details: 'Download limit has been reset to 0',
      }
    }).then(({ error: notifError }) => {
      if (notifError) {
        console.error('Failed to send notification:', notifError);
      } else {
        console.log('Notification sent successfully');
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Download limit reset successfully"
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error: any) {
    console.error("Error in reset-download-limit function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
