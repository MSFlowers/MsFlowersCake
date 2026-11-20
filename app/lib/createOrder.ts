import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { getRazorpay, verifyRazorpaySignature } from "@/app/lib/razorpay";
import { sendAdminOrderNotification } from "@/app/lib/email";

function parseToYyyyMmDd(val: any): string {
  if (!val) return new Date().toISOString().split("T")[0];
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const lower = str.toLowerCase();
  const now = new Date();
  if (lower.includes("today")) {
    return now.toISOString().split("T")[0];
  }
  if (lower.includes("tomorrow")) {
    const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return tmrw.toISOString().split("T")[0];
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return now.toISOString().split("T")[0];
}

export async function createOrder(body: any, trusted = false) {
  try {

    const orderNumber =
      body.order_number ||
      body.orderNumber ||
      body.orderId ||
      `#MSF-${Math.floor(10000 + Math.random() * 90000)}`;

    const customerName = (
      body.customer_name ||
      body.customerName ||
      "Customer"
    ).trim();

    const customerEmail = (
      body.customer_email ||
      body.customerEmail ||
      "customer@msflowers.in"
    ).trim().toLowerCase();

    const customerPhone = (
      body.customer_phone ||
      body.customerPhone ||
      body.recipient_phone ||
      body.recipientPhone ||
      "9830012345"
    ).trim();

    const recipientName = (
      body.recipient_name ||
      body.recipientName ||
      customerName
    ).trim();

    const recipientPhone = (
      body.recipient_phone ||
      body.recipientPhone ||
      customerPhone
    ).trim();

    const deliveryAddress = (
      body.delivery_address ||
      body.deliveryAddress ||
      "Kolkata Delivery Address"
    ).trim();

    const area = (body.area || "").trim();
    const rawPincode = body.pincode ? String(body.pincode).trim() : "700105";
    const trimmedPincode = rawPincode || "700105";

    const slotTimeWindow =
      body.slot_time_window ||
      body.slotTimeWindow ||
      body.slot_label ||
      body.slotLabel ||
      "Standard Daytime (9 AM - 6 PM)";

    const slotLabel = slotTimeWindow;

    const deliveryDateStr = parseToYyyyMmDd(
      body.delivery_date_iso || body.delivery_date || body.deliveryDate
    );

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const cakeMessage = body.cake_message || body.cakeMessage || null;
    const cardMessage = body.card_message || body.cardMessage || null;
    const deliveryNote = body.delivery_note || body.deliveryNote || null;
    const occasion = body.occasion || null;
    const couponCode = body.coupon_code || body.couponCode || null;
    const couponDiscount = Number(body.coupon_discount ?? body.couponDiscount ?? 0);
    const slotFee = Number(body.slot_fee ?? body.slotFee ?? 0);
    const itemsSubtotal = Number(body.items_subtotal ?? body.itemsSubtotal ?? 0);
    const grandTotal = Number(
      body.grand_total ??
      body.grandTotal ??
      body.total_amount ??
      body.totalAmount ??
      0
    );

    const itemCount =
      Number(
        body.item_count ??
        body.itemCount ??
        rawItems.reduce(
          (acc: number, it: any) =>
            acc + (Number(it.quantity || it.qty) || 1),
          0
        )
      ) || 1;

    const paymentMethod =
      body.payment_method ||
      body.paymentMethod ||
      "Cash on Delivery (COD)";

    const enrichedItems = rawItems.map((it: any, idx: number) => ({
      id: it.id || `item-${idx + 1}`,
      name: it.name || "Item",
      sku: it.sku || `MS-${String(it.id || idx + 1).slice(0, 6).toUpperCase()}`,
      price: Number(it.price || it.unitBasePrice) || 0,
      quantity: Number(it.quantity || it.qty) || 1,
      qty: Number(it.quantity || it.qty) || 1,
      image: it.image || "",
      weight: it.weight || undefined,
      cakeMessage: it.cakeMessage || cakeMessage || undefined,
      cardMessage: it.cardMessage || cardMessage || undefined,
    }));

    // Online payment (Razorpay): verify signature + amount on the server
    const rzpOrderId = body.razorpay_order_id || null;
    const rzpPaymentId = body.razorpay_payment_id || null;
    const rzpSignature = body.razorpay_signature || null;
    const isOnline = Boolean(rzpOrderId && rzpPaymentId && (rzpSignature || trusted));

    if (isOnline) {
      if (!trusted && !verifyRazorpaySignature(rzpOrderId, rzpPaymentId, rzpSignature)) {
        return NextResponse.json(
          { error: "Payment verification failed" },
          { status: 400 }
        );
      }
      const rzpOrder: any = await getRazorpay().orders.fetch(rzpOrderId);
      if (Math.round(grandTotal * 100) !== Number(rzpOrder.amount)) {
        return NextResponse.json(
          { error: "Paid amount does not match order total" },
          { status: 400 }
        );
      }
      // Prevent reusing the same payment or Razorpay order for multiple orders
      const { data: dupByPayment } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("razorpay_payment_id", rzpPaymentId)
        .maybeSingle();
      if (dupByPayment) {
        return NextResponse.json(
          { error: "This payment is already linked to an order" },
          { status: 409 }
        );
      }
      const { data: dupByOrder } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("razorpay_order_id", rzpOrderId)
        .maybeSingle();
      if (dupByOrder) {
        return NextResponse.json(
          { error: "This Razorpay order is already linked to an order" },
          { status: 409 }
        );
      }
    }

    const baseRow: Record<string, any> = {
      order_number: orderNumber,
      customer_name: customerName || "Customer",
      customer_email: customerEmail || "customer@msflowers.in",
      customer_phone: customerPhone || "9830012345",
      recipient_name: recipientName || customerName,
      recipient_phone: recipientPhone || customerPhone,
      delivery_address: deliveryAddress || "Kolkata Hub Zone",
      area: area || `Kolkata, ${trimmedPincode}`,
      pincode: trimmedPincode,
      slot_label: slotLabel,
      delivery_date: deliveryDateStr,
      items: enrichedItems,
      item_count: itemCount,
      total_amount: grandTotal,
      payment_method: isOnline ? "Online (Razorpay)" : paymentMethod,
      payment_status: isOnline ? "Paid" : "Pending",
      order_status: isOnline ? "Confirmed" : "Pending",
    };

    let { data: newOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert(
        isOnline
          ? {
              ...baseRow,
              razorpay_order_id: rzpOrderId,
              razorpay_payment_id: rzpPaymentId,
              razorpay_signature: rzpSignature,
            }
          : baseRow
      )
      .select()
      .single();

    // Safety net: if razorpay columns are not added yet, never lose a paid order
    if (orderError && isOnline && orderError.code !== "23505") {
      console.warn("Retrying paid order without razorpay columns:", orderError.message);
      const retry = await supabaseAdmin
        .from("orders")
        .insert({
          ...baseRow,
          payment_method: `Online (Razorpay) - ${rzpPaymentId}`,
        })
        .select()
        .single();
      newOrder = retry.data;
      orderError = retry.error;
    }


    if (orderError && orderError.code === "23505" && isOnline) {
      return NextResponse.json(
        { error: "This payment is already linked to an order" },
        { status: 409 }
      );
    }

    if (orderError) {
      console.error("Order insertion error into Supabase:", orderError);
      return NextResponse.json(
        { error: "Failed to place order: " + orderError.message },
        { status: 500 }
      );
    }

    // Update Customer stats in customers table (if customer registered)
    try {
      if (customerEmail) {
        const { data: customer } = await supabaseAdmin
          .from("customers")
          .select("id, orders_count, total_spent")
          .eq("email", customerEmail)
          .maybeSingle();

        if (customer) {
          await supabaseAdmin
            .from("customers")
            .update({
              orders_count: (customer.orders_count || 0) + 1,
              total_spent:
                (Number(customer.total_spent) || 0) + grandTotal,
            })
            .eq("id", customer.id);
        }
      }
    } catch (custErr) {
      console.warn("Could not update customer stats:", custErr);
    }

    // Update coupon usage count if coupon applied
    try {
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
    } catch (coupErr) {
      console.warn("Could not update coupon stats:", coupErr);
    }

    // Send order alert email to configured admin email(s) — never fail order if email fails
    try {
      await sendAdminOrderNotification({
        order_number: newOrder?.order_number || orderNumber,
        customer_name: customerName || "Customer",
        customer_email: customerEmail || "customer@msflowers.in",
        customer_phone: customerPhone || "9830012345",
        recipient_name: recipientName || customerName,
        recipient_phone: recipientPhone || customerPhone,
        delivery_address: deliveryAddress || "Kolkata Hub Zone",
        area: area || `Kolkata, ${trimmedPincode}`,
        pincode: trimmedPincode,
        delivery_date: deliveryDateStr,
        slot_label: slotLabel,
        payment_method: isOnline ? "Online (Razorpay)" : paymentMethod,
        payment_status: isOnline ? "Paid" : "Pending",
        order_status: isOnline ? "Confirmed" : "Pending",
        items: enrichedItems,
        items_subtotal: itemsSubtotal || grandTotal,
        slot_fee: slotFee,
        coupon_code: couponCode,
        coupon_discount: couponDiscount,
        total_amount: grandTotal,
        cake_message: cakeMessage,
        card_message: cardMessage,
        delivery_note: deliveryNote,
        occasion: occasion,
        razorpay_payment_id: rzpPaymentId,
      });
    } catch (emailErr) {
      console.error("Failed to send admin order notification email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      order: {
        ...newOrder,
        grand_total: grandTotal,
        total_amount: grandTotal,
        items_subtotal: itemsSubtotal || grandTotal,
        slot_fee: slotFee,
        coupon_discount: couponDiscount,
        coupon_code: couponCode,
        cake_message: cakeMessage,
        card_message: cardMessage,
        delivery_note: deliveryNote,
        occasion: occasion,
        status: "Confirmed",
        order_status: "Pending",
        slot_time_window: slotLabel,
      },
    });
  } catch (err: any) {
    console.error("Place order exception:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

