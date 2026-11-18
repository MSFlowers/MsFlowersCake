import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      recipientName,
      recipientPhone,
      deliveryAddress,
      area,
      pincode,
      slotType,
      slotTimeWindow,
      deliveryDate,
      items,
      itemCount,
      itemsSubtotal,
      couponCode,
      couponDiscount,
      slotFee,
      grandTotal,
      paymentMethod,
      cakeMessage,
      cardMessage,
      deliveryNote,
      occasion,
      customerId,
    } = body;

    const trimmedPincode = (pincode || "").trim();
    if (!trimmedPincode) {
      return NextResponse.json({ error: "Delivery pincode is required." }, { status: 400 });
    }

    // 1. Validate Serviceable Pincode
    const { data: validPin } = await supabaseAdmin
      .from("pincodes")
      .select("pincode, is_active")
      .eq("pincode", trimmedPincode)
      .eq("is_active", true)
      .maybeSingle();

    if (!validPin) {
      return NextResponse.json(
        {
          error: `Sorry, delivery is currently not available to pincode ${trimmedPincode}. We currently serve select Kolkata hub zones only.`,
        },
        { status: 400 }
      );
    }

    // 2. Generate unique Order Number like #MS-XXXXXX
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `#MS-${randomNum}`;

    // 3. Insert order into public.orders
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId || null,
        customer_name: (customerName || "").trim(),
        customer_email: (customerEmail || "").trim().toLowerCase(),
        customer_phone: (customerPhone || "").trim(),
        recipient_name: (recipientName || customerName || "").trim(),
        recipient_phone: (recipientPhone || customerPhone || "").trim(),
        delivery_address: (deliveryAddress || "").trim(),
        area: (area || "").trim(),
        pincode: trimmedPincode,
        slot_type: slotType || "standard",
        slot_time_window: slotTimeWindow || "Standard Daytime",
        delivery_date: deliveryDate || new Date().toISOString().split("T")[0],
        items: items || [],
        item_count: Number(itemCount) || 1,
        items_subtotal: Number(itemsSubtotal) || 0,
        coupon_code: couponCode || null,
        coupon_discount: Number(couponDiscount) || 0,
        slot_fee: Number(slotFee) || 0,
        grand_total: Number(grandTotal) || 0,
        payment_method: paymentMethod || "Cash on Delivery (COD)",
        payment_status: "Pending",
        status: "Confirmed",
        cake_message: cakeMessage || null,
        card_message: cardMessage || null,
        delivery_note: deliveryNote || null,
        occasion: occasion || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order insertion error:", orderError);
      return NextResponse.json(
        { error: "Failed to place order: " + orderError.message },
        { status: 500 }
      );
    }

    // 4. Update Customer stats in customers table (if customer registered)
    const emailToMatch = (customerEmail || "").trim().toLowerCase();
    if (emailToMatch) {
      const { data: customer } = await supabaseAdmin
        .from("customers")
        .select("id, orders_count, total_spent")
        .eq("email", emailToMatch)
        .maybeSingle();

      if (customer) {
        await supabaseAdmin
          .from("customers")
          .update({
            orders_count: (customer.orders_count || 0) + 1,
            total_spent: (Number(customer.total_spent) || 0) + Number(grandTotal || 0),
          })
          .eq("id", customer.id);
      }
    }

    // 5. Update coupon usage count if coupon applied
    if (couponCode) {
      const { data: cp } = await supabaseAdmin
        .from("coupons")
        .select("id, usage_count")
        .eq("code", couponCode.trim().toUpperCase())
        .maybeSingle();

      if (cp) {
        await supabaseAdmin
          .from("coupons")
          .update({ usage_count: (cp.usage_count || 0) + 1 })
          .eq("id", cp.id);
      }
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (err: any) {
    console.error("Place order exception:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
