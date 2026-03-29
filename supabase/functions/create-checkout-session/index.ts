import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

interface CheckoutRequest {
  productSku: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request
    const { productSku }: CheckoutRequest = await req.json();
    
    if (!productSku) {
      console.error("Missing required field: productSku");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construct URLs server-side — validate Origin against allowlist to prevent open redirect
    const ALLOWED_ORIGINS = new Set([
      "https://morefitlyfe.lovable.app",
      "https://morefitlyfe.com",
      "https://www.morefitlyfe.com",
      "http://localhost:5173",
    ]);
    const rawOrigin = req.headers.get("origin") ?? "";
    const origin = ALLOWED_ORIGINS.has(rawOrigin)
      ? rawOrigin
      : (Deno.env.get("SITE_URL") ?? "https://morefitlyfe.lovable.app");
    const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/payment-canceled`;

    // Fetch product details from database (never trust client data)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("sku", productSku)
      .eq("active", true)
      .single();

    if (productError || !product) {
      console.error("Product not found or inactive");
      return new Response(
        JSON.stringify({ error: "Invalid product" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    console.log("Creating checkout session");

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: product.name_en,
              description: product.description_en || undefined,
              images: product.image_url ? [product.image_url] : undefined,
            },
            unit_amount: Math.round(Number(product.price) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: profile?.email || user.email,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        product_sku: product.sku,
        user_email: profile?.email || user.email || "",
        user_name: profile?.full_name || "",
      },
    });

    console.log("Checkout session created successfully");

    // Store pending checkout for validation in webhook
    const { error: pendingCheckoutError } = await supabase
      .from("pending_checkouts")
      .insert({
        stripe_session_id: session.id,
        user_id: user.id,
        product_sku: product.sku,
        expected_amount: product.price,
      });

    if (pendingCheckoutError) {
      console.error("Failed to store pending checkout");
      // Continue anyway - webhook will still work with metadata fallback
    }

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in create-checkout-session");
    
    // Never expose internal errors to clients
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
