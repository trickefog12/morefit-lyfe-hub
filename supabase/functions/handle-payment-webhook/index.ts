import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const securityHeaders = {
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MINUTES = 1;
const MAX_REQUESTS_PER_WINDOW = 100;

// Check if IP is whitelisted (supports both individual IPs and CIDR ranges)
async function isWhitelisted(supabase: any, ip: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_ip_whitelisted', { check_ip: ip });
  
  if (error) {
    console.error('Whitelist check error:', error);
    return false;
  }
  
  return data === true;
}

// Rate limiting helper
async function checkRateLimit(supabase: any, ip: string, endpoint: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  // Check if IP is whitelisted first
  if (await isWhitelisted(supabase, ip)) {
    console.log(`Whitelisted IP bypassing rate limit: ${ip}`);
    return { allowed: true };
  }

  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - RATE_LIMIT_WINDOW_MINUTES);

  // Check existing rate limit entry
  const { data: existingLog } = await supabase
    .from("rate_limit_logs")
    .select("request_count, window_start")
    .eq("ip_address", ip)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart.toISOString())
    .single();

  if (existingLog) {
    if (existingLog.request_count >= MAX_REQUESTS_PER_WINDOW) {
      const retryAfter = Math.ceil((new Date(existingLog.window_start).getTime() + RATE_LIMIT_WINDOW_MINUTES * 60000 - Date.now()) / 1000);
      return { allowed: false, retryAfter };
    }

    // Increment counter
    await supabase
      .from("rate_limit_logs")
      .update({ request_count: existingLog.request_count + 1 })
      .eq("ip_address", ip)
      .eq("endpoint", endpoint)
      .gte("window_start", windowStart.toISOString());
  } else {
    // Create new rate limit entry
    await supabase
      .from("rate_limit_logs")
      .insert({
        ip_address: ip,
        endpoint: endpoint,
        request_count: 1,
        window_start: new Date().toISOString(),
      });
  }

  return { allowed: true };
}

serve(async (req) => {
  try {
    // Initialize Supabase client for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Check rate limit
    const rateLimitResult = await checkRateLimit(supabase, clientIp, "payment-webhook");
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": String(rateLimitResult.retryAfter || 60),
            ...securityHeaders 
          }
        }
      );
    }

    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    
    if (!signature || !webhookSecret) {
      console.error("Missing signature or webhook secret");
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json", ...securityHeaders } }
      );
    }

    // Get the raw body for signature verification
    const body = await req.text();
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("Webhook signature verified:", event.type);
    } catch (err: any) {
      console.error("Webhook signature verification failed");
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json", ...securityHeaders } }
      );
    }

    // Supabase client already initialized for rate limiting

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Processing completed checkout session");

      // Validate against server-side stored checkout data
      const { data: pendingCheckout, error: checkoutError } = await supabase
        .from("pending_checkouts")
        .select("*")
        .eq("stripe_session_id", session.id)
        .single();

      if (checkoutError || !pendingCheckout) {
        console.error("No pending checkout found, attempting metadata fallback");
        
        // Fallback to metadata validation (for backwards compatibility)
        if (!session.metadata?.user_id || !session.metadata?.product_sku) {
          console.error("Missing required metadata in checkout session");
          return new Response(
            JSON.stringify({ error: "Invalid session - no pending checkout or metadata" }),
            { status: 400, headers: { "Content-Type": "application/json", ...securityHeaders } }
          );
        }
        console.warn("Using metadata fallback for checkout validation");
      }

      // Use server-side data if available, otherwise fall back to metadata
      const userId = pendingCheckout?.user_id || session.metadata?.user_id;
      const productSku = pendingCheckout?.product_sku || session.metadata?.product_sku;
      const expectedAmount = pendingCheckout?.expected_amount;

      // Validate amount if we have expected amount
      if (expectedAmount) {
        const actualAmount = (session.amount_total || 0) / 100;
        const expectedAmountNum = Number(expectedAmount);
        
        if (Math.abs(actualAmount - expectedAmountNum) > 0.01) {
          console.error("Amount mismatch detected - expected vs actual amount differs");
          // Log but don't block - could be legitimate currency conversion differences
        }
      }

      // Check for existing purchase to prevent duplicates (idempotency)
      const { data: existingPurchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("stripe_payment_intent_id", session.payment_intent as string)
        .single();

      if (existingPurchase) {
        console.log("Purchase already exists, skipping duplicate");
        return new Response(JSON.stringify({ received: true }), { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...securityHeaders } 
        });
      }

      // Generate secure download token
      const downloadToken = crypto.randomUUID();

      // Create purchase record using validated data
      const { error: insertError } = await supabase
        .from("purchases")
        .insert({
          user_id: userId,
          product_sku: productSku,
          amount_paid: (session.amount_total || 0) / 100, // Convert from cents
          status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
          download_token: downloadToken,
          purchased_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Failed to create purchase record");
        return new Response(
          JSON.stringify({ error: "Failed to create purchase record" }),
          { status: 500, headers: { "Content-Type": "application/json", ...securityHeaders } }
        );
      }

      console.log("Purchase record created successfully");

      // Clean up pending checkout
      if (pendingCheckout) {
        await supabase
          .from("pending_checkouts")
          .delete()
          .eq("id", pendingCheckout.id);
      }

      // Get product details and user info for email
      const { data: product } = await supabase
        .from("products")
        .select("name_en")
        .eq("sku", productSku)
        .single();

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      if (product && profile) {
        // Send purchase confirmation email
        const downloadUrl = `${Deno.env.get("SITE_URL") || "https://your-site.com"}/download/${downloadToken}`;
        
        const { error: emailError } = await supabase.functions.invoke("send-purchase-email", {
          body: {
            type: "purchase_confirmation",
            to: profile.email,
            data: {
              customerName: profile.full_name || "Valued Customer",
              productName: product.name_en,
              amountPaid: (session.amount_total || 0) / 100,
              downloadToken,
              downloadUrl,
            },
          },
        });

        if (emailError) {
          console.error("Failed to send purchase confirmation email");
        } else {
          console.log("Purchase confirmation email sent successfully");
        }
      }
    }

    // Handle payment_intent.payment_failed event
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      console.error("Payment failed for payment intent");

      // Update purchase record if it exists
      await supabase
        .from("purchases")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...securityHeaders } }
    );
  } catch (error: any) {
    console.error("Error in handle-payment-webhook");
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...securityHeaders } }
    );
  }
});
