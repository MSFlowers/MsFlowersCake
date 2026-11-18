import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

// 1. GET: Fetch all coupons & statistics
export async function GET() {
  try {
    const { data: coupons, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coupons:", error);
      return NextResponse.json(
        { error: "Failed to fetch coupons: " + error.message, coupons: [], stats: null },
        { status: 500 }
      );
    }

    const items = coupons || [];
    let activeCount = 0;
    let totalRedemptions = 0;

    items.forEach((c) => {
      if (c.is_active) activeCount += 1;
      totalRedemptions += Number(c.usage_count) || 0;
    });

    const stats = {
      totalCoupons: items.length,
      activeCoupons: activeCount,
      totalRedemptions,
    };

    return NextResponse.json({
      success: true,
      coupons: items,
      stats,
    });
  } catch (err: any) {
    console.error("GET coupons exception:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error", coupons: [], stats: null },
      { status: 500 }
    );
  }
}

// 2. POST: Create or Update a Coupon
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      code,
      description,
      discount_type,
      discount_value,
      min_order,
      max_discount,
      expiry_date,
      is_active,
    } = body;

    const trimmedCode = (code || "").trim().toUpperCase();
    if (!trimmedCode) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const val = Number(discount_value);
    if (isNaN(val) || val <= 0) {
      return NextResponse.json({ error: "Valid discount value is required" }, { status: 400 });
    }

    const minOrderVal = Number(min_order) || 0;
    const maxDiscountVal = max_discount ? Number(max_discount) : null;
    const type = discount_type === "flat" ? "flat" : "percentage";
    const active = is_active !== false;

    if (id) {
      // Update existing coupon
      const { data, error } = await supabaseAdmin
        .from("coupons")
        .update({
          code: trimmedCode,
          description: description || "",
          discount_type: type,
          discount_value: val,
          min_order: minOrderVal,
          max_discount: maxDiscountVal,
          expiry_date: expiry_date || null,
          is_active: active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, coupon: data });
    } else {
      // Insert new coupon
      const { data, error } = await supabaseAdmin
        .from("coupons")
        .insert({
          code: trimmedCode,
          description: description || "",
          discount_type: type,
          discount_value: val,
          min_order: minOrderVal,
          max_discount: maxDiscountVal,
          expiry_date: expiry_date || null,
          usage_count: 0,
          is_active: active,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, coupon: data });
    }
  } catch (err: any) {
    console.error("POST coupon error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// 3. PATCH: Quick Toggle Active Status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// 4. DELETE: Delete a Coupon
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
