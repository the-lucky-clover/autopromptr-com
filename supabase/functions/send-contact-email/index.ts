
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  captcha: number;
}

// Email template that matches your app's branding
const getEmailTemplate = (confirmationUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your signup - AutoPromptr</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px; text-align: center;">
      
      <!-- Logo/Brand Section -->
      <div style="margin-bottom: 32px;">
        <div style="background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 28px; font-weight: bold; margin-bottom: 8px;">
          AutoPromptr
        </div>
        <div style="width: 60px; height: 4px; background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%); margin: 0 auto; border-radius: 2px;"></div>
      </div>

      <!-- Header -->
      <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; line-height: 1.4;">
        Confirm your signup
      </h2>
      
      <!-- Body Text -->
      <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
        Welcome to AutoPromptr! To complete your registration and start automating your prompts, please confirm your email address by clicking the button below.
      </p>
      
      <!-- CTA Button -->
      <div style="margin: 32px 0;">
        <a href="${confirmationUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3); transition: all 0.3s ease;">
          Confirm your email
        </a>
      </div>
      
      <!-- Alternative Link -->
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 8px 0 0 0;">
        <a href="${confirmationUrl}" style="color: #a855f7; text-decoration: none; word-break: break-all; font-size: 14px;">
          ${confirmationUrl}
        </a>
      </p>
      
      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
          This link will expire in 24 hours for security reasons.<br>
          If you didn't create an account with AutoPromptr, you can safely ignore this email.
        </p>
      </div>
      
    </div>
    
    <!-- Bottom Footer -->
    <div style="text-align: center; margin-top: 24px;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        © 2024 AutoPromptr. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, captcha }: ContactEmailRequest = await req.json();
    
    console.log("Received contact form submission:", { name, email, subject });

    // Simple captcha validation (7 + 3 = 10)
    if (captcha !== 10) {
      console.log("Captcha validation failed:", captcha);
      return new Response(
        JSON.stringify({ error: "Captcha validation failed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "AutoPromptr Contact <onboarding@resend.dev>",
      to: ["thepremiumbrand@gmail.com"],
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This message was sent from the AutoPromptr contact form.</em></p>
      `,
      replyTo: email,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
