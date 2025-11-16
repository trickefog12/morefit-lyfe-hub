import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.pathname.split("/").pop();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Download token is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("User authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Download request from user:", user.id, "for token:", token);

    // Validate the download token and check if user owns this purchase
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from("purchases")
      .select(`
        *,
        products!inner(name_en, sku)
      `)
      .eq("download_token", token)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .single();

    if (purchaseError || !purchase) {
      console.error("Purchase validation error:", purchaseError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired download token" }),
        { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Valid purchase found:", purchase.id, "for product:", purchase.products.sku);

    // Get the file from storage
    // Files are stored as: {token}/{product_sku}.pdf
    const filePath = `${token}/${purchase.products.sku}.pdf`;
    
    const { data: fileData, error: storageError } = await supabaseClient
      .storage
      .from("product-files")
      .download(filePath);

    if (storageError || !fileData) {
      console.error("Storage error:", storageError);
      
      // If file doesn't exist, provide helpful message
      return new Response(
        JSON.stringify({ 
          error: "File not found",
          message: "The program file is not yet available. Please contact support.",
          token: token,
          sku: purchase.products.sku
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("File found, serving download for:", filePath);

    // Log the download event
    await supabaseClient
      .from("analytics_events")
      .insert({
        user_id: user.id,
        event_type: "download",
        event_name: "file_download",
        properties: {
          product_sku: purchase.products.sku,
          purchase_id: purchase.id,
          download_token: token,
        },
      });

    // Return the file with appropriate headers
    return new Response(fileData, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${purchase.products.name_en}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Error in download-file function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
