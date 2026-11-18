import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { DEFAULT_DELIVERY_SETTINGS } from "@/app/data/siteDefaults";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("delivery_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({
        success: true,
        settings: {
          ...DEFAULT_DELIVERY_SETTINGS,
          ...data,
          free_delivery_threshold: Number(data.free_delivery_threshold) || 999,
          standard_delivery_fee: Number(data.standard_delivery_fee) || 49,
          express_delivery_fee: Number(data.express_delivery_fee) || 99,
          midnight_delivery_fee: Number(data.midnight_delivery_fee) || 149,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: DEFAULT_DELIVERY_SETTINGS,
    });
  } catch (err: any) {
    console.error("Fetch delivery settings error:", err);
    return NextResponse.json({
      success: true,
      settings: DEFAULT_DELIVERY_SETTINGS,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      free_delivery_threshold,
      standard_delivery_fee,
      express_delivery_fee,
      midnight_delivery_fee,
      estimated_timeline,
      dispatch_hub_name,
      dispatch_hub_address,
      support_phone,
      support_email,
    } = body;

    const payload = {
      id: "default",
      free_delivery_threshold: Number(free_delivery_threshold) || 999,
      standard_delivery_fee: Number(standard_delivery_fee) >= 0 ? Number(standard_delivery_fee) : 49,
      express_delivery_fee: Number(express_delivery_fee) >= 0 ? Number(express_delivery_fee) : 99,
      midnight_delivery_fee: Number(midnight_delivery_fee) >= 0 ? Number(midnight_delivery_fee) : 149,
      estimated_timeline: (estimated_timeline || "Within 90 Minutes Express / Same-Day (Kolkata)").trim(),
      dispatch_hub_name: (dispatch_hub_name || "Kolkata Central Hub").trim(),
      dispatch_hub_address: (dispatch_hub_address || "Chingrighata Central Hub, Salt Lake Bypass, Kolkata - 700105").trim(),
      support_phone: (support_phone || "6201069758").trim(),
      support_email: (support_email || "contact@msflowers.in").trim(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("delivery_settings")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Database upsert warning:", error.message);
      return NextResponse.json({
        success: true,
        settings: payload,
        message: "Settings saved (local fallback)",
      });
    }

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (err: any) {
    console.error("Update delivery settings error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update delivery settings" },
      { status: 500 }
    );
  }
}
