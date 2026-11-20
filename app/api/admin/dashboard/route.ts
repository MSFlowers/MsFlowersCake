import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { getAllPincodes } from "@/app/lib/pincodesStore";

interface DashboardStats {
  ordersToProcess: number;
  reviewsToApprove: number;
  openInquiries: number;
  lowStockAlerts: number;
  totalRevenue: number;
  totalOrders: number;
  registeredCustomers: number;
  totalProducts: number;
  activeProducts: number;
  totalCoupons: number;
  activeCoupons: number;
  totalPincodes: number;
}

const FALLBACK_ORDERS: any[] = [];

function deriveTopProducts(ordersList: any[]) {
  const salesMap: Record<
    string,
    { count: number; name: string; price: number; image?: string; group: string }
  > = {};

  for (const order of ordersList) {
    if (order.items && Array.isArray(order.items)) {
      for (const it of order.items) {
        const key = it.sku || it.name;
        if (!salesMap[key]) {
          const name = it.name || "Special Bloom";
          const lower = name.toLowerCase();
          const group = lower.includes("combo")
            ? "Combos"
            : lower.includes("cake") || lower.includes("truffle")
            ? "Cakes"
            : "Flowers";

          salesMap[key] = {
            count: 0,
            name,
            price: Number(it.price) || 799,
            image: it.image || "/products/flowers/red-roses-bouquet.jpg",
            group,
          };
        }
        salesMap[key].count += Number(it.qty) || 1;
      }
    }
  }

  const sorted = Object.entries(salesMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([key, val]) => ({
      id: key,
      name: val.name,
      group: val.group,
      price: val.price,
      image: val.image,
      soldCount: val.count,
    }));

  return sorted;
}

export async function GET() {
  try {
    // 1. Fetch Customers Count (from Supabase customers table)
    let registeredCustomers = 0;
    try {
      const { data: dbCust, error: custErr } = await supabaseAdmin
        .from("customers")
        .select("id, email");
      if (!custErr && Array.isArray(dbCust)) {
        registeredCustomers = dbCust.length;
      }
    } catch {
      registeredCustomers = 0;
    }

    // 2. Fetch Reviews Data
    let totalReviews = 0;
    let reviewsToApprove = 0;
    try {
      const { data: revData, error: revErr } = await supabaseAdmin
        .from("reviews")
        .select("id, status");
      if (!revErr && Array.isArray(revData) && revData.length > 0) {
        totalReviews = revData.length;
        reviewsToApprove = revData.filter((r) => r.status === "pending").length;
      }
    } catch {
      // fallback
    }

    // 3. Fetch Inquiries Data & Recent List
    let totalInquiries = 0;
    let openInquiries = 0;
    let recentInquiries: any[] = [];
    try {
      const { data: inqData, error: inqErr } = await supabaseAdmin
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!inqErr && Array.isArray(inqData)) {
        totalInquiries = inqData.length;
        openInquiries = inqData.filter(
          (i) => i.status === "unresolved" || i.status === "open"
        ).length;
        recentInquiries = inqData.slice(0, 5).map((i) => ({
          id: i.id,
          name: i.name,
          phone: i.phone || "—",
          email: i.email,
          subject: i.inquiry_type || i.message?.slice(0, 40) || "General Inquiry",
          message: i.message,
          date: i.created_at
            ? new Date(i.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })
            : "Today",
          status: i.status === "unresolved" ? "open" : "resolved",
        }));
      }
    } catch {
      // fallback
    }

    // 4. Fetch Coupons Data
    let totalCoupons = 0;
    let activeCoupons = 0;
    try {
      const { data: coupData, error: coupErr } = await supabaseAdmin
        .from("coupons")
        .select("id, is_active");
      if (!coupErr && Array.isArray(coupData) && coupData.length > 0) {
        totalCoupons = coupData.length;
        activeCoupons = coupData.filter((c) => c.is_active).length;
      }
    } catch {
      // fallback
    }

    // 5. Fetch Orders Data & Calculate Real Cohesive Metrics
    let ordersSource: any[] = [];
    try {
      const { data: ordData, error: ordErr } = await supabaseAdmin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!ordErr && Array.isArray(ordData)) {
        ordersSource = ordData;
      }
    } catch {
      ordersSource = [];
    }

    const totalOrders = ordersSource.length;
    let totalRevenue = 0;
    let ordersToProcess = 0;

    ordersSource.forEach((o) => {
      const amt = Number(o.total_amount || o.grand_total || 0);
      const st = o.order_status || o.status || "Pending";
      // Only count non-cancelled orders towards live revenue
      if (st !== "Cancelled") {
        totalRevenue += amt;
      }
      if (
        st === "Pending" ||
        st === "Processing" ||
        st === "Confirmed"
      ) {
        ordersToProcess += 1;
      }
    });

    const recentOrdersList = ordersSource.slice(0, 5).map((o) => ({
      orderId: o.order_number || `#MS-${o.id?.slice(0, 6)}`,
      customerName: o.customer_name || "Customer",
      totalAmount: Number(o.total_amount || o.grand_total || 0),
      status: o.status || (o.order_status === "Pending" ? "Confirmed" : o.order_status) || "Confirmed",
      area: o.area || o.pincode || "Kolkata",
      slotLabel: o.slot_label || o.slot_time_window || "Express Hub Slot",
      date: o.created_at ? o.created_at.slice(0, 10) : "Today",
    }));

    // Calculate Top Products dynamically strictly from the real orders
    const topProducts = deriveTopProducts(ordersSource);

    // 6. Fetch Products & Low Stock Alerts genuinely from Supabase
    let totalProducts = 0;
    let activeProducts = 0;
    let lowStockAlerts = 0;
    try {
      const { data: prodData, error: prodErr } = await supabaseAdmin
        .from("products")
        .select("id, is_active, stock, threshold");

      if (!prodErr && Array.isArray(prodData)) {
        totalProducts = prodData.length;
        activeProducts = prodData.filter((p) => p.is_active).length;
        lowStockAlerts = prodData.filter((p) => {
          const s = Number(p.stock) || 0;
          const t = Number(p.threshold) || 10;
          return s < t;
        }).length;
      }
    } catch (e) {
      console.error("Error loading products count for dashboard:", e);
    }

    // 7. Fetch Pincodes genuinely from DB / persistent store
    let totalPincodes = 0;
    try {
      const { pincodes } = await getAllPincodes();
      totalPincodes = (pincodes || []).length;
    } catch (e) {
      console.error("Error loading pincodes count for dashboard:", e);
    }

    const metrics: DashboardStats = {
      ordersToProcess,
      reviewsToApprove,
      openInquiries,
      lowStockAlerts,
      totalRevenue,
      totalOrders,
      registeredCustomers,
      totalProducts,
      activeProducts,
      totalCoupons,
      activeCoupons,
      totalPincodes,
    };

    return NextResponse.json({
      success: true,
      metrics,
      recentOrders: recentOrdersList,
      recentInquiries,
      topProducts,
    });
  } catch (err: any) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      {
        error: err.message || "Failed to load dashboard statistics",
        metrics: {
          ordersToProcess: 0,
          reviewsToApprove: 0,
          openInquiries: 0,
          lowStockAlerts: 0,
          totalRevenue: 0,
          totalOrders: 0,
          registeredCustomers: 0,
          totalProducts: 0,
          activeProducts: 0,
          totalCoupons: 0,
          activeCoupons: 0,
          totalPincodes: 0,
        },
        recentOrders: [],
        recentInquiries: [],
        topProducts: [],
      },
      { status: 500 }
    );
  }
}
