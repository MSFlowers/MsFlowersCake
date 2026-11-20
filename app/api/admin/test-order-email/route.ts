import { NextResponse } from "next/server";
import { sendAdminOrderNotification } from "@/app/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const overrideRecipients =
      typeof body?.email === "string" && body.email.trim()
        ? body.email.trim()
        : undefined;

    const result = await sendAdminOrderNotification(
      {
        order_number: "#MSF-TEST-001",
        customer_name: "Test Customer",
        customer_email: "customer@example.com",
        customer_phone: "+91 9830012345",
        recipient_name: "Test Recipient",
        recipient_phone: "+91 9830012345",
        delivery_address: "Chingrighata, Salt Lake",
        area: "Kolkata, 700105",
        pincode: "700105",
        delivery_date: new Date().toISOString().split("T")[0],
        slot_label: "Standard Daytime (9 AM - 6 PM)",
        payment_method: "Online (Razorpay)",
        payment_status: "Paid",
        order_status: "Confirmed",
        items: [
          {
            name: "Red Roses Bouquet & Chocolate Truffle Cake (Sample)",
            quantity: 1,
            price: 1299,
            weight: "1/2 Kg",
            cakeMessage: "Happy Birthday!",
          },
        ],
        items_subtotal: 1299,
        slot_fee: 0,
        coupon_discount: 0,
        total_amount: 1299,
        cake_message: "Happy Birthday!",
        delivery_note: "This is a test notification from Admin Store Settings.",
      },
      { overrideRecipients, isTest: true }
    );

    return NextResponse.json({
      success: true,
      recipients: result.recipients || [],
      message: `Test order email sent to ${(result.recipients || []).join(", ")}`,
    });
  } catch (err: any) {
    console.error("Test order email error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to send test email" },
      { status: 500 }
    );
  }
}
