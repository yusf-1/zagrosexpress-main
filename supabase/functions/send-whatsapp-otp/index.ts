import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendOTPRequest {
  phoneNumber: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TWILIO_ACCOUNT_SID) {
      throw new Error("TWILIO_ACCOUNT_SID is not configured");
    }
    if (!TWILIO_AUTH_TOKEN) {
      throw new Error("TWILIO_AUTH_TOKEN is not configured");
    }
    if (!TWILIO_WHATSAPP_NUMBER) {
      throw new Error("TWILIO_WHATSAPP_NUMBER is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    const { phoneNumber }: SendOTPRequest = await req.json();

    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    // Normalize phone number - remove all non-digits except leading +
    const normalizedPhone = phoneNumber.startsWith('+') 
      ? '+' + phoneNumber.slice(1).replace(/\D/g, '')
      : phoneNumber.replace(/\D/g, '');

    console.log(`Sending OTP to: ${normalizedPhone}`);

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Delete any existing OTPs for this phone number
    await supabase
      .from("otp_verifications")
      .delete()
      .eq("phone_number", normalizedPhone);

    // Store OTP in database
    const { error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        phone_number: normalizedPhone,
        otp_code: otpCode,
        expires_at: expiresAt,
        verified: false,
        attempts: 0,
      });

    if (insertError) {
      console.error("Failed to store OTP:", insertError);
      throw new Error("Failed to generate OTP");
    }

    // Send OTP via Twilio WhatsApp
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append("From", `whatsapp:${TWILIO_WHATSAPP_NUMBER}`);
    formData.append("To", `whatsapp:${normalizedPhone}`);
    formData.append("Body", `Your ZAGROSS EXPRESS verification code is: ${otpCode}\n\nThis code expires in 5 minutes.`);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioResult);
      
      // Clean up the OTP we just created since we couldn't send it
      await supabase
        .from("otp_verifications")
        .delete()
        .eq("phone_number", normalizedPhone);
        
      throw new Error(twilioResult.message || "Failed to send WhatsApp message");
    }

    console.log("OTP sent successfully:", twilioResult.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully",
        // Don't return the OTP in production!
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-whatsapp-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
})
