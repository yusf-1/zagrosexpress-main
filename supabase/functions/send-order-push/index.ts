// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendOrderPushRequest {
  order_id: string;
  status?: string;
}

const STATUS_TEXT: Record<string, Record<string, string>> = {
  en: {
    pending: "Pending",
    quoted: "Quoted",
    buying: "Buying",
    received_china: "Received in China",
    on_the_way: "On the Way",
    ready_pickup: "Ready for Pickup",
    completed: "Completed",
  },
  ar: {
    pending: "قيد المراجعة",
    quoted: "تم تسعير الطلب",
    buying: "جاري الشراء",
    received_china: "وصل إلى الصين",
    on_the_way: "في الطريق",
    ready_pickup: "جاهز للاستلام",
    completed: "مكتمل",
  },
  ku: {
    pending: "لە چاوەڕوانیدا",
    quoted: "نرخ دانرا",
    buying: "لە قۆناغی کڕین",
    received_china: "گەیشتووە چین",
    on_the_way: "لە ڕێگادایە",
    ready_pickup: "ئامادەیە بۆ وەرگرتن",
    completed: "تەواوبوو",
  },
};

const TITLE_TEXT: Record<string, string> = {
  en: "Order Update",
  ar: "تحديث الطلب",
  ku: "نوێکاری داواکاری",
};

const BODY_TEMPLATE: Record<string, string> = {
  en: "Order #{order} is now {status}",
  ar: "طلبك #{order} الآن {status}",
  ku: "داواکاری #{order} ئێستا {status}",
};

function formatBody(lang: string, orderShort: string, status: string) {
  const langKey = STATUS_TEXT[lang] ? lang : "en";
  const statusLabel = STATUS_TEXT[langKey][status] || status;
  return BODY_TEMPLATE[langKey]
    .replace("{order}", orderShort)
    .replace("{status}", statusLabel);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const FCM_SERVER_KEY = Deno.env.get("FCM_SERVER_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }
    if (!FCM_SERVER_KEY) {
      throw new Error("FCM_SERVER_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin");

    if (roleError || !roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: SendOrderPushRequest = await req.json();
    if (!body.order_id) {
      throw new Error("order_id is required");
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,user_id,status")
      .eq("id", body.order_id)
      .maybeSingle();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    const status = body.status || order.status;
    const orderShort = order.id.slice(0, 8);

    const { data: profile } = await supabase
      .from("profiles")
      .select("language_preference")
      .eq("user_id", order.user_id)
      .maybeSingle();

    const lang = profile?.language_preference || "en";
    const title = TITLE_TEXT[lang] || TITLE_TEXT.en;
    const bodyText = formatBody(lang, orderShort, status);

    const { data: tokens } = await supabase
      .from("push_tokens")
      .select("token")
      .eq("user_id", order.user_id);

    const registrationIds = (tokens || [])
      .map((t: { token: string }) => t.token)
      .filter((t: string) => !!t);

    if (registrationIds.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No tokens" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const fcmPayload = {
      registration_ids: registrationIds,
      notification: {
        title,
        body: bodyText,
      },
      data: {
        order_id: order.id,
        status,
      },
    };

    const fcmRes = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${FCM_SERVER_KEY}`,
      },
      body: JSON.stringify(fcmPayload),
    });

    const fcmJson = await fcmRes.json();

    if (!fcmRes.ok) {
      console.error("FCM error:", fcmJson);
      return new Response(JSON.stringify({ success: false, error: "FCM error", details: fcmJson }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true, result: fcmJson }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-order-push:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
