import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { DEFAULT_DELIVERY_SETTINGS } from "@/app/data/siteDefaults";


export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("delivery_settings")
      .select("free_delivery_threshold, standard_delivery_fee, express_delivery_fee, midnight_delivery_fee, estimated_timeline, dispatch_hub_name, dispatch_hub_address")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({
        success: true,
        settings: {
          free_delivery_threshold: Number(data.free_delivery_threshold) || 999,
          standard_delivery_fee: Number(data.standard_delivery_fee) || 49,
          express_delivery_fee: Number(data.express_delivery_fee) || 99,
          midnight_delivery_fee: Number(data.midnight_delivery_fee) || 149,
          estimated_timeline: data.estimated_timeline || "Within 90 Minutes Express / Same-Day",
          dispatch_hub_name: data.dispatch_hub_name || "Kolkata Central Hub",
          dispatch_hub_address: data.dispatch_hub_address || "Chingrighata Central Hub, Salt Lake Bypass, Kolkata - 700105",
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: DEFAULT_DELIVERY_SETTINGS,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      settings: DEFAULT_DELIVERY_SETTINGS,
    });
  }
}
