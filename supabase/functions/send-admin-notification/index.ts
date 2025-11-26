import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { AdminNotificationEmail } from "./_templates/admin-notification.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationRequest {
  actionType: string;
  actionLabel: string;
  performedBy: string;
  target: string;
  details: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create authenticated Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: isAdmin } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { actionType, actionLabel, performedBy, target, details }: NotificationRequest = await req.json();

    console.log("Processing notification for action:", actionType);

    // Create service role client for admin operations
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all admins who have notifications enabled for this action type
    const { data: preferences, error: prefsError } = await supabaseServiceClient
      .from("admin_notification_preferences")
      .select(`
        admin_id,
        email_enabled,
        profiles:admin_id (
          email
        )
      `)
      .eq("action_type", actionType)
      .eq("email_enabled", true);

    if (prefsError) {
      console.error("Failed to fetch notification preferences");
      throw prefsError;
    }

    // If no specific preferences exist, get all admins (default behavior)
    let adminsToNotify: { email: string }[] = [];

    if (!preferences || preferences.length === 0) {
      console.log("No specific preferences found, checking for all admins");
      
      const { data: allAdmins, error: adminsError } = await supabaseServiceClient
        .from("user_roles")
        .select(`
          user_id,
          profiles:user_id (
            email
          )
        `)
        .eq("role", "admin");

      if (adminsError) {
        console.error("Failed to fetch admins");
        throw adminsError;
      }

      adminsToNotify = allAdmins
        ?.map((admin: any) => ({ email: admin.profiles?.email }))
        .filter((admin: any) => admin.email) || [];
    } else {
      adminsToNotify = preferences
        .map((pref: any) => ({ email: pref.profiles?.email }))
        .filter((admin: any) => admin.email);
    }

    if (adminsToNotify.length === 0) {
      console.log("No admins to notify");
      return new Response(
        JSON.stringify({ message: "No admins to notify" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Sending notifications to ${adminsToNotify.length} admin(s)`);

    const appUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || "";
    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Send email to each admin
    const emailPromises = adminsToNotify.map(async (admin) => {
      try {
        const html = await renderAsync(
          React.createElement(AdminNotificationEmail, {
            adminEmail: admin.email,
            actionType,
            actionLabel,
            performedBy,
            target,
            details,
            timestamp,
            appUrl,
          })
        );

        const { error: sendError } = await resend.emails.send({
          from: "Admin Notifications <onboarding@resend.dev>",
          to: [admin.email],
          subject: `Admin Action: ${actionLabel}`,
          html,
        });

        if (sendError) {
          console.error("Failed to send notification email");
          return { email: admin.email, success: false, error: sendError };
        }

        console.log("Notification email sent successfully");
        return { email: admin.email, success: true };
      } catch (error) {
        console.error("Failed to process notification email");
        return { email: admin.email, success: false, error };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Notification results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        message: "Notifications processed",
        successful,
        failed,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
