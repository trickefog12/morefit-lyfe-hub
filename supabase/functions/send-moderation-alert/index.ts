import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { ModerationAlertEmail } from "./_templates/moderation-alert.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ModerationAlertRequest {
  blockedContent: string;
  reason: string;
  userEmail: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blockedContent, reason, userEmail }: ModerationAlertRequest = await req.json();

    if (!blockedContent || !reason) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing moderation alert for blocked content");

    // Create service role client to get admin emails
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all admin users
    const { data: admins, error: adminsError } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminsError) {
      console.error("Failed to fetch admins:", adminsError);
      throw adminsError;
    }

    // Get emails for admin users
    const adminUserIds = admins?.map((admin: any) => admin.user_id) || [];
    
    if (adminUserIds.length === 0) {
      console.log("No admin users found");
      return new Response(
        JSON.stringify({ message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("email")
      .in("id", adminUserIds);

    if (profilesError) {
      console.error("Failed to fetch admin profiles:", profilesError);
      throw profilesError;
    }

    const adminEmails = profiles
      ?.map((profile: any) => profile.email)
      .filter((email: string | null) => email) || [];

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending moderation alerts to ${adminEmails.length} admin(s)`);

    const appUrl = "https://morefitlyfe.lovable.app";
    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Send email to each admin
    const emailPromises = adminEmails.map(async (email: string) => {
      try {
        const html = await renderAsync(
          React.createElement(ModerationAlertEmail, {
            blockedContent,
            reason,
            userEmail: userEmail || "Anonymous",
            timestamp,
            appUrl,
          })
        );

        const { error: sendError } = await resend.emails.send({
          from: "MoreFitLyfe <onboarding@resend.dev>",
          to: [email],
          subject: "⚠️ Review Blocked: Content Moderation Alert",
          html,
        });

        if (sendError) {
          console.error("Failed to send alert email:", sendError);
          return { email, success: false, error: sendError };
        }

        console.log("Alert email sent successfully to:", email);
        return { email, success: true };
      } catch (error) {
        console.error("Error sending alert to:", email, error);
        return { email, success: false, error };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Alert results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        message: "Moderation alerts sent",
        successful,
        failed,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-moderation-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
