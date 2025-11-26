import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

// Motivational messages for program reminders
const motivationalMessages = [
  "Every rep, every set, every day is a step closer to becoming the best version of yourself.",
  "Progress isn't always visible, but consistency always pays off. Keep showing up!",
  "The only bad workout is the one that didn't happen. You've got this!",
  "Your future self will thank you for not giving up today.",
  "Champions aren't made in the gym. They're made from something deep inside—a desire, a dream, a vision.",
];

interface Purchase {
  id: string;
  user_id: string;
  product_sku: string;
  purchased_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
  products: {
    name_en: string;
  };
}

interface PurchaseWithToken extends Purchase {
  download_token: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date();
    
    console.log("Running scheduled email checks...");

    // Send review requests for purchases 7 days old
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const { data: purchasesForReview, error: reviewError } = await supabase
      .from("purchases")
      .select(`
        id,
        user_id,
        product_sku,
        purchased_at,
        profiles!inner(email, full_name),
        products!inner(name_en)
      `)
      .eq("status", "completed")
      .gte("purchased_at", sevenDaysAgo.toISOString())
      .lt("purchased_at", new Date(sevenDaysAgo.getTime() + 86400000).toISOString())
      .returns<Purchase[]>();

    if (reviewError) {
      console.error("Failed to fetch purchases for review");
    } else if (purchasesForReview && purchasesForReview.length > 0) {
      console.log(`Sending ${purchasesForReview.length} review request emails...`);
      
      for (const purchase of purchasesForReview) {
        const { error: emailError } = await supabase.functions.invoke("send-purchase-email", {
          body: {
            type: "review_request",
            to: purchase.profiles.email,
            data: {
              customerName: purchase.profiles.full_name || "Valued Customer",
              productName: purchase.products.name_en,
              reviewUrl: `${Deno.env.get("SITE_URL") || "https://your-site.com"}/#review`,
            },
          },
        });

        if (emailError) {
          console.error("Failed to send review request email");
        }
      }
    }

    // Send program reminders for purchases at days 3, 14, 30
    const reminderDays = [3, 14, 30];
    
    for (const days of reminderDays) {
      const reminderDate = new Date(today);
      reminderDate.setDate(today.getDate() - days);

      const { data: purchasesForReminder, error: reminderError } = await supabase
        .from("purchases")
        .select(`
          id,
          user_id,
          product_sku,
          download_token,
          purchased_at,
          profiles!inner(email, full_name),
          products!inner(name_en)
        `)
        .eq("status", "completed")
        .gte("purchased_at", reminderDate.toISOString())
        .lt("purchased_at", new Date(reminderDate.getTime() + 86400000).toISOString())
        .returns<PurchaseWithToken[]>();

      if (reminderError) {
        console.error(`Failed to fetch purchases for day ${days} reminder`);
        continue;
      }

      if (purchasesForReminder && purchasesForReminder.length > 0) {
        console.log(`Sending ${purchasesForReminder.length} day-${days} reminder emails...`);
        
        for (const purchase of purchasesForReminder) {
          const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
          
          const { error: emailError } = await supabase.functions.invoke("send-purchase-email", {
            body: {
              type: "program_reminder",
              to: purchase.profiles.email,
              data: {
                customerName: purchase.profiles.full_name || "Valued Customer",
                productName: purchase.products.name_en,
                daysIntoProgram: days,
                downloadUrl: `${Deno.env.get("SITE_URL") || "https://your-site.com"}/download/${purchase.download_token}`,
                motivationalMessage: randomMessage,
              },
            },
          });

          if (emailError) {
            console.error("Failed to send program reminder email");
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Scheduled emails processed" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-scheduled-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
