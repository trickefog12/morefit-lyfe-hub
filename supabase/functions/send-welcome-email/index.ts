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

// Rate limit: 3 requests per hour per user (welcome email should only be sent once)
const RATE_LIMIT = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const checkRateLimit = async (
  supabase: any,
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; retryAfter?: number }> => {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  
  // Count recent requests for this user
  const { data: logs, error } = await supabase
    .from("rate_limit_logs")
    .select("request_count, window_start")
    .eq("ip_address", userId) // Using ip_address field to store userId for user-based limiting
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart)
    .order("window_start", { ascending: false })
    .limit(1);

  if (error) {
    console.log("Rate limit check error, allowing request");
    return { allowed: true };
  }

  const currentCount = logs?.[0]?.request_count || 0;

  if (currentCount >= RATE_LIMIT) {
    const windowStartTime = new Date(logs[0].window_start).getTime();
    const retryAfter = Math.ceil((windowStartTime + RATE_LIMIT_WINDOW_MS - Date.now()) / 1000);
    return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
  }

  // Update or insert rate limit log
  if (logs && logs.length > 0) {
    await supabase
      .from("rate_limit_logs")
      .update({ request_count: currentCount + 1 })
      .eq("ip_address", userId)
      .eq("endpoint", endpoint)
      .gte("window_start", windowStart);
  } else {
    await supabase.from("rate_limit_logs").insert({
      ip_address: userId,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString(),
    });
  }

  return { allowed: true };
};

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
    
    // Use service role client for database operations (needed for rate limiting)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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

    // Check rate limit before processing
    const rateLimitResult = await checkRateLimit(supabase, authUser.id, "send-welcome-email");
    if (!rateLimitResult.allowed) {
      console.log("Rate limit exceeded for user");
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": String(rateLimitResult.retryAfter),
            ...corsHeaders 
          } 
        }
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
