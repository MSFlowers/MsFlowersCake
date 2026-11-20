import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET() {
  try {
    // 1. Fetch genuine customers from Supabase customers table
    const { data: dbCustomers, error: custErr } = await supabaseAdmin
      .from("customers")
      .select("id, name, email, phone, role, orders_count, total_spent, created_at")
      .order("created_at", { ascending: false });

    if (custErr) {
      console.error("Error fetching customers from Supabase:", custErr);
      return NextResponse.json(
        {
          success: false,
          error: custErr.message,
          customers: [],
          stats: {
            totalCustomers: 0,
            totalCustomerSpend: 0,
            repeatBuyers: 0,
            newLast30Days: 0,
          },
        },
        { status: 500 }
      );
    }

    const rawCustomers = Array.isArray(dbCustomers) ? dbCustomers : [];

    // 2. Fetch live orders from Supabase to dynamically calculate exact orders count & total spent per customer
    let ordersList: any[] = [];
    try {
      const { data: ordData, error: ordErr } = await supabaseAdmin
        .from("orders")
        .select("customer_email, total_amount, order_status");
      if (!ordErr && Array.isArray(ordData)) {
        ordersList = ordData;
      }
    } catch {
      ordersList = [];
    }

    // 3. Format customer objects with accurate dynamic orders count and spend
    const customers = rawCustomers.map((c: any) => {
      const emailLower = (c.email || "").trim().toLowerCase();
      const customerOrders = ordersList.filter(
        (o: any) =>
          (o.customer_email || "").trim().toLowerCase() === emailLower &&
          o.order_status !== "Cancelled"
      );

      const computedOrdersCount = Math.max(
        customerOrders.length,
        Number(c.orders_count) || 0
      );

      const computedTotalSpend = Math.max(
        customerOrders.reduce(
          (sum: number, o: any) => sum + (Number(o.total_amount) || 0),
          0
        ),
        Number(c.total_spent) || 0
      );

      const roleUpper = (c.role || "CUSTOMER").toUpperCase();

      return {
        id: c.id,
        name: c.name || "Customer",
        email: c.email || "",
        phone: c.phone || "—",
        role: roleUpper,
        orders_count: computedOrdersCount,
        total_spent: computedTotalSpend,
        created_at: c.created_at || new Date().toISOString(),
      };
    });

    // 4. Compute live stats for the KPI cards
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalSpend = 0;
    let repeatBuyersCount = 0;
    let new30DaysCount = 0;

    customers.forEach((c) => {
      const spend = Number(c.total_spent) || 0;
      totalSpend += spend;

      const orders = Number(c.orders_count) || 0;
      if (orders > 1) {
        repeatBuyersCount += 1;
      }

      if (c.created_at) {
        const joinedDate = new Date(c.created_at);
        if (joinedDate >= thirtyDaysAgo) {
          new30DaysCount += 1;
        }
      }
    });

    const stats = {
      totalCustomers: customers.length,
      totalCustomerSpend: totalSpend,
      repeatBuyers: repeatBuyersCount,
      newLast30Days: new30DaysCount,
    };

    return NextResponse.json({
      success: true,
      customers,
      stats,
    });
  } catch (err: any) {
    console.error("Admin customers API exception:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to load customers",
        customers: [],
        stats: {
          totalCustomers: 0,
          totalCustomerSpend: 0,
          repeatBuyers: 0,
          newLast30Days: 0,
        },
      },
      { status: 500 }
    );
  }
}
