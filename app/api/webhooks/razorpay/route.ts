import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/app/lib/supabase";
import { createOrder } from "@/app/lib/createOrder";

function isValidSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Creates the order from the checkout data saved at create-order time,
 * in case the customer paid but closed the tab before the browser could save it.
 */
async function finalizePaidOrder(razorpayOrderId: string, razorpayPaymentId: string) {
  const { data: pending, error } = await supabaseAdmin
    .from("razorpay_pending_orders")
    .select("razorpay_order_id, order_data, status")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (error) {
    console.error("[Razorpay Webhook] pending lookup failed:", error.message);
    return;
  }
  if (!pending) {
    console.warn("[Razorpay Webhook] No pending checkout data for", razorpayOrderId);
    return;
  }

  // Already saved by the browser? (payment id unique) -> nothing to do
  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("razorpay_payment_id", razorpayPaymentId)
    .maybeSingle();
  if (existing) {
    await supabaseAdmin
      .from("razorpay_pending_orders")
      .update({ status: "completed" })
      .eq("razorpay_order_id", razorpayOrderId);
    return;
  }

  const res = await createOrder(
    {
      ...pending.order_data,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
    },
    true // signature already verified at webhook level
  );

  if (res.ok || res.status === 409) {
    await supabaseAdmin
      .from("razorpay_pending_orders")
      .update({ status: "completed" })
      .eq("razorpay_order_id", razorpayOrderId);
    console.log("[Razorpay Webhook] Order finalized for", razorpayOrderId);
  } else {
    console.error("[Razorpay Webhook] createOrder failed:", res.status, await res.text());
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ success: false, error: "Webhook not configured" }, { status: 500 });
    }
    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing signature" }, { status: 400 });
    }
    if (!isValidSignature(rawBody, signature, secret)) {
      console.error("[Razorpay Webhook] Invalid signature");
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    const evt = JSON.parse(rawBody);
    const event: string = evt.event;
    const payment = evt.payload?.payment?.entity;

    switch (event) {
      case "payment.captured":
      case "order.paid": {
        const paymentId = payment?.id;
        const rzpOrderId = payment?.order_id || evt.payload?.order?.entity?.id;
        if (paymentId && rzpOrderId) {
          await finalizePaidOrder(rzpOrderId, paymentId);
        }
        break;
      }
      case "payment.failed": {
        console.log(
          "[Razorpay Webhook] payment.failed",
          payment?.id,
          payment?.error_description || ""
        );
        break;
      }
      default:
        console.log("[Razorpay Webhook] Ignored event:", event);
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error("[Razorpay Webhook] Error:", err);
    // 500 makes Razorpay retry the webhook
    return NextResponse.json({ success: false, error: err?.message || "Server error" }, { status: 500 });
  }
}
