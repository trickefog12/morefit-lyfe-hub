import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  try {
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    
    if (!signature || !webhookSecret) {
      console.error("Missing signature or webhook secret");
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400 }
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
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role key for database writes
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Processing completed checkout session:", {
        sessionId: session.id,
        paymentIntent: session.payment_intent,
        userId: session.metadata?.user_id,
        productSku: session.metadata?.product_sku,
      });

      // Validate required metadata
      if (!session.metadata?.user_id || !session.metadata?.product_sku) {
        console.error("Missing required metadata in session:", session.id);
        return new Response(
          JSON.stringify({ error: "Invalid session metadata" }),
          { status: 400 }
        );
      }

      // Check for existing purchase to prevent duplicates (idempotency)
      const { data: existingPurchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("stripe_payment_intent_id", session.payment_intent as string)
        .single();

      if (existingPurchase) {
        console.log("Purchase already exists, skipping duplicate:", session.payment_intent);
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Generate secure download token
      const downloadToken = crypto.randomUUID();

      // Create purchase record
      const { error: insertError } = await supabase
        .from("purchases")
        .insert({
          user_id: session.metadata.user_id,
          product_sku: session.metadata.product_sku,
          amount_paid: (session.amount_total || 0) / 100, // Convert from cents
          status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
          download_token: downloadToken,
          purchased_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Failed to create purchase record:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create purchase record" }),
          { status: 500 }
        );
      }

      console.log("Purchase record created successfully for session:", session.id);

      // Get product details and user info for email
      const { data: product } = await supabase
        .from("products")
        .select("name_en")
        .eq("sku", session.metadata.product_sku)
        .single();

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", session.metadata.user_id)
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
          console.error("Failed to send purchase confirmation email:", emailError);
        } else {
          console.log("Purchase confirmation email sent successfully");
        }
      }
    }

    // Handle payment_intent.payment_failed event
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      console.error("Payment failed:", {
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message,
      });

      // Update purchase record if it exists
      await supabase
        .from("purchases")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in handle-payment-webhook:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
