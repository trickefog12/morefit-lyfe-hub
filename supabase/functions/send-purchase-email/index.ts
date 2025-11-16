import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { PurchaseConfirmationEmail } from "./_templates/purchase-confirmation.tsx";
import { ReviewRequestEmail } from "./_templates/review-request.tsx";
import { ProgramReminderEmail } from "./_templates/program-reminder.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "purchase_confirmation" | "review_request" | "program_reminder";
  to: string;
  data: {
    customerName: string;
    productName: string;
    amountPaid?: number;
    downloadToken?: string;
    downloadUrl?: string;
    reviewUrl?: string;
    daysIntoProgram?: number;
    motivationalMessage?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();

    console.log("Sending email:", { type, to, customerName: data.customerName });

    let html: string;
    let subject: string;

    switch (type) {
      case "purchase_confirmation":
        if (!data.amountPaid || !data.downloadToken || !data.downloadUrl) {
          throw new Error("Missing required fields for purchase confirmation");
        }
        html = await renderAsync(
          React.createElement(PurchaseConfirmationEmail, {
            customerName: data.customerName,
            productName: data.productName,
            amountPaid: data.amountPaid,
            downloadToken: data.downloadToken,
            downloadUrl: data.downloadUrl,
          })
        );
        subject = `Your ${data.productName} - Download Now! 🎉`;
        break;

      case "review_request":
        if (!data.reviewUrl) {
          throw new Error("Missing review URL");
        }
        html = await renderAsync(
          React.createElement(ReviewRequestEmail, {
            customerName: data.customerName,
            productName: data.productName,
            reviewUrl: data.reviewUrl,
          })
        );
        subject = `How's your experience with ${data.productName}?`;
        break;

      case "program_reminder":
        if (!data.daysIntoProgram || !data.downloadUrl || !data.motivationalMessage) {
          throw new Error("Missing required fields for program reminder");
        }
        html = await renderAsync(
          React.createElement(ProgramReminderEmail, {
            customerName: data.customerName,
            productName: data.productName,
            daysIntoProgram: data.daysIntoProgram,
            downloadUrl: data.downloadUrl,
            motivationalMessage: data.motivationalMessage,
          })
        );
        subject = `Day ${data.daysIntoProgram} - Keep Going Strong! 💪`;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const { data: emailData, error } = await resend.emails.send({
      from: "Transformation Programs <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-purchase-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
