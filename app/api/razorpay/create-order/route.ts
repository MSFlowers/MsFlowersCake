import { NextResponse } from "next/server";
import { getRazorpay } from "@/app/lib/razorpay";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amountRupees = Number(body.amount);
    if (!Number.isFinite(amountRupees) || amountRupees < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const rzp = getRazorpay();
    const order = await rzp.orders.create({
      amount: Math.round(amountRupees * 100), // paise
      currency: "INR",
      receipt: String(body.receipt || `msf_${Date.now()}`).slice(0, 40),
    });

    // Save checkout data so the webhook can create the order if the browser never returns
    if (body.order && typeof body.order === "object") {
      const { error } = await supabaseAdmin.from("razorpay_pending_orders").insert({
        razorpay_order_id: order.id,
        order_data: body.order,
        status: "pending",
      });
      if (error) {
        console.warn("Could not save pending checkout data:", error.message);
      }
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json(
      { error: err?.error?.description || err?.message || "Could not start payment" },
      { status: 500 }
    );
  }
}
