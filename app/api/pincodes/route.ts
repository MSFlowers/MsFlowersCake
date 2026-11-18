import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    const { data: pincodes, error } = await supabase
      .from("pincodes")
      .select("pincode, area_name, is_active, delivery_time")
      .eq("is_active", true)
      .order("pincode", { ascending: true });

    if (error) {
      return NextResponse.json({ pincodes: [] });
    }

    return NextResponse.json({ pincodes: pincodes || [] });
  } catch {
    return NextResponse.json({ pincodes: [] });
  }
}
