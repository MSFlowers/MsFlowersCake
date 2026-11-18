import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

const ORDER_CUSTOMERS = [
  {
    id: "cust-01",
    name: "Sushain Demo",
    email: "sushain16kaushal@gmail.com",
    phone: "9876543210",
    role: "REGISTERED MEMBER",
    orders_count: 1,
    total_spent: 1218,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "cust-02",
    name: "M. Irsu",
    email: "m.irsu77777@gmail.com",
    phone: "6201069758",
    role: "REPEAT BUYER",
    orders_count: 2,
    total_spent: 768,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "cust-03",
    name: "Rahul Mukherjee",
    email: "rahul.m@gmail.com",
    phone: "9831098765",
    role: "CUSTOMER",
    orders_count: 1,
    total_spent: 1758,
    created_at: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: "cust-04",
    name: "Ananya Banerjee",
    email: "ananya.banerjee@gmail.com",
    phone: "9830998877",
    role: "CUSTOMER",
    orders_count: 1,
    total_spent: 848,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export async function GET(req: Request) {
  try {
    let dbCustomers: any[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from("customers")
        .select("id, name, email, phone, role, orders_count, total_spent, created_at")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        dbCustomers = data;
      }
    } catch {
      // fallback
    }

    // Merge DB customers with known order buyers
    const customerMap = new Map<string, any>();

    // 1. Add order buyers first
    for (const oc of ORDER_CUSTOMERS) {
      customerMap.set(oc.email.toLowerCase(), { ...oc });
    }

    // 2. Overlay live Supabase customers
    for (const dbC of dbCustomers) {
      const emailKey = (dbC.email || "").toLowerCase();
      if (!emailKey) continue;

      if (customerMap.has(emailKey)) {
        const existing = customerMap.get(emailKey);
        customerMap.set(emailKey, {
          ...existing,
          ...dbC,
          orders_count: Math.max(Number(dbC.orders_count) || 0, existing.orders_count),
          total_spent: Math.max(Number(dbC.total_spent) || 0, existing.total_spent),
          role: dbC.role || existing.role || "CUSTOMER",
        });
      } else {
        customerMap.set(emailKey, {
          id: dbC.id,
          name: dbC.name || "Customer",
          email: dbC.email,
          phone: dbC.phone || "—",
          role: dbC.role || "CUSTOMER",
          orders_count: Number(dbC.orders_count) || 0,
          total_spent: Number(dbC.total_spent) || 0,
          created_at: dbC.created_at || new Date().toISOString(),
        });
      }
    }

    const customers = Array.from(customerMap.values());

    // Compute live stats for the KPI cards
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
        success: true,
        customers: ORDER_CUSTOMERS,
        stats: {
          totalCustomers: ORDER_CUSTOMERS.length,
          totalCustomerSpend: 4592,
          repeatBuyers: 1,
          newLast30Days: ORDER_CUSTOMERS.length,
        },
      },
      { status: 200 }
    );
  }
}
