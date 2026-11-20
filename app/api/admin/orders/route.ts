import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET() {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin orders from Supabase:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          orders: [],
          stats: {
            totalOrders: 0,
            totalVolume: 0,
            confirmed: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
          },
        },
        { status: 500 }
      );
    }

    const items = (orders || []).map((o: any) => {
      const amt = Number(o.total_amount ?? o.grand_total ?? 0);
      const rawStatus = o.order_status || o.status || "Pending";
      const displayStatus =
        rawStatus === "Pending" ? "Confirmed" : rawStatus;

      return {
        ...o,
        grand_total: amt,
        total_amount: amt,
        items_subtotal: Number(o.items_subtotal ?? amt),
        slot_fee: Number(o.slot_fee ?? 0),
        coupon_discount: Number(o.coupon_discount ?? 0),
        slot_type: o.slot_type || "standard",
        slot_time_window:
          o.slot_time_window || o.slot_label || "Standard Daytime (9 AM - 6 PM)",
        slot_label:
          o.slot_label || o.slot_time_window || "Standard Daytime (9 AM - 6 PM)",
        status: displayStatus,
        order_status: rawStatus,
      };
    });

    let totalVolume = 0;
    let confirmedCount = 0;
    let processingCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    items.forEach((o: any) => {
      const amt = o.grand_total;
      if (o.status !== "Cancelled" && o.order_status !== "Cancelled") {
        totalVolume += amt;
      }

      if (o.status === "Confirmed" || o.order_status === "Pending") confirmedCount += 1;
      else if (o.status === "Processing") processingCount += 1;
      else if (o.status === "Shipped") shippedCount += 1;
      else if (o.status === "Delivered") deliveredCount += 1;
      else if (o.status === "Cancelled") cancelledCount += 1;
    });

    const stats = {
      totalOrders: items.length,
      totalVolume,
      confirmed: confirmedCount,
      processing: processingCount,
      shipped: shippedCount,
      delivered: deliveredCount,
      cancelled: cancelledCount,
    };

    return NextResponse.json({
      success: true,
      orders: items,
      stats,
    });
  } catch (err: any) {
    console.error("GET admin orders exception:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to load orders",
        orders: [],
        stats: {
          totalOrders: 0,
          totalVolume: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Map UI status ('Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')
    // to Supabase check constraint ('Pending', 'Processing', 'Delivered', 'Cancelled')
    let dbStatus = status;
    if (status === "Confirmed") dbStatus = "Pending";
    if (status === "Shipped") dbStatus = "Processing";

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        order_status: dbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalized = {
      ...data,
      grand_total: Number(data.total_amount ?? data.grand_total ?? 0),
      total_amount: Number(data.total_amount ?? data.grand_total ?? 0),
      status: status,
      order_status: dbStatus,
    };

    return NextResponse.json({ success: true, order: normalized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
