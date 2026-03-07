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

// Allowlist of valid moderation reasons — never accept arbitrary strings from clients
const ALLOWED_REASONS = new Set(["inappropriate_language", "spam_pattern"]);

// Rate limiting: max 5 calls per user per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_CALLS_PER_WINDOW = 5;
interface RateLimitEntry { count: number; windowStart: number; }
const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);
  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(userId, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_CALLS_PER_WINDOW) return false;
  entry.count++;
  return true;
}

interface ModerationAlertRequest {
  blockedContent: string;
  reason: string;
  // userEmail is intentionally NOT read from the request body — sourced from the JWT instead
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validate JWT and extract the caller's identity
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Rate limiting per authenticated user
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse and validate the request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return new Response(
        JSON.stringify({ error: "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { blockedContent, reason } = body as ModerationAlertRequest;

    if (!blockedContent || typeof blockedContent !== "string" || blockedContent.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Validate reason against allowlist — reject arbitrary strings
    if (!reason || !ALLOWED_REASONS.has(reason)) {
      return new Response(
        JSON.stringify({ error: "Invalid reason" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Override userEmail from the validated JWT — never trust the client-supplied value
    const verifiedUserEmail = user.email ?? "Unknown";

    console.log("Processing moderation alert for blocked content");

    // Use service role to read admin records
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all admin users
    const { data: admins, error: adminsError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminsError) {
      console.error("Failed to fetch admins:", adminsError);
      throw adminsError;
    }

    const adminUserIds = admins?.map((admin: any) => admin.user_id) || [];

    if (adminUserIds.length === 0) {
      console.log("No admin users found");
      return new Response(
        JSON.stringify({ message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profiles, error: profilesError } = await supabaseAdmin
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

    const emailPromises = adminEmails.map(async (email: string) => {
      try {
        const html = await renderAsync(
          React.createElement(ModerationAlertEmail, {
            blockedContent,
            reason,
            userEmail: verifiedUserEmail, // Always from the JWT, never from the request body
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
      JSON.stringify({ message: "Moderation alerts sent", successful, failed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-moderation-alert function");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
