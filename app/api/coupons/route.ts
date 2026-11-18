import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("code, description, discount_type, discount_value, min_order, max_discount, expiry_date")
      .eq("is_active", true)
      .order("min_order", { ascending: true });

    if (error) {
      return NextResponse.json({ coupons: [] });
    }

    return NextResponse.json({ coupons: coupons || [] });
  } catch {
    return NextResponse.json({ coupons: [] });
  }
}
