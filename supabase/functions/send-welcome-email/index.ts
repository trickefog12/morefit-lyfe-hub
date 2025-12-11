import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { WelcomeEmail } from "./_templates/welcome-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

interface WelcomeEmailRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-welcome-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Create client with anon key to verify the authenticated user
    const authHeader = req.headers.get("Authorization");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } }
    });
    
    // Verify the authenticated user
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !authUser) {
      console.log("Unauthorized: No valid user session");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { userId }: WelcomeEmailRequest = await req.json();

    if (!userId) {
      console.log("Missing userId in request");
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify that the authenticated user matches the requested userId
    if (authUser.id !== userId) {
      console.log("Forbidden: User ID mismatch");
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.log("Profile not found for user");
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the origin from the request headers or use a default
    const origin = req.headers.get("origin") || "https://morefitlyfe.com";
    const programsUrl = `${origin}/programs`;

    // Render the email template
    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        customerName: profile.full_name || "Fitness Enthusiast",
        programsUrl,
      })
    );

    // Send the welcome email
    const emailResponse = await resend.emails.send({
      from: "MoreFitLyfe <onboarding@resend.dev>",
      to: [profile.email],
      subject: "Welcome to MoreFitLyfe! 🎉",
      html,
    });

    console.log("Welcome email sent successfully");

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending welcome email:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to send welcome email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
