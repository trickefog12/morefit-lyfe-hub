import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { WelcomeEmail } from "../send-welcome-email/_templates/welcome-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

interface AdminResendRequest {
  targetUserId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("admin-resend-welcome-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify admin user
    const authHeader = req.headers.get("Authorization");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } }
    });
    
    const { data: { user: adminUser }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !adminUser) {
      console.log("Unauthorized: No valid admin session");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin
    const { data: adminRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !adminRole) {
      console.log("Forbidden: User is not an admin");
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { targetUserId }: AdminResendRequest = await req.json();

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: "targetUserId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get target user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", targetUserId)
      .single();

    if (profileError || !profile) {
      console.log("Target user profile not found");
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const origin = req.headers.get("origin") || "https://morefitlyfe.com";
    const programsUrl = `${origin}/programs`;

    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        customerName: profile.full_name || "Fitness Enthusiast",
        programsUrl,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "MoreFitLyfe <onboarding@resend.dev>",
      to: [profile.email],
      subject: "Welcome to MoreFitLyfe! 🎉",
      html,
    });

    // Update profile to mark welcome email as sent
    await supabase
      .from("profiles")
      .update({ 
        welcome_email_sent: true, 
        welcome_email_sent_at: new Date().toISOString() 
      })
      .eq("id", targetUserId);

    // Log admin action
    await supabase.from("audit_logs").insert({
      admin_id: adminUser.id,
      admin_email: adminUser.email || "unknown",
      action_type: "resend_welcome_email",
      target_user_id: targetUserId,
      details: { email_sent_to: profile.email }
    });

    console.log("Welcome email resent by admin successfully");

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error resending welcome email:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to resend welcome email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
