import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { DEFAULT_STORE_SETTINGS } from "@/app/data/siteDefaults";


function toPublicStoreSettings(raw: Record<string, any>) {
  const {
    order_notification_email: _privateEmail,
    order_email_notifications_enabled: _privateToggle,
    ...publicFields
  } = raw;
  return publicFields;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({
        success: true,
        settings: toPublicStoreSettings({
          ...DEFAULT_STORE_SETTINGS,
          ...data,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      settings: toPublicStoreSettings(DEFAULT_STORE_SETTINGS),
    });
  } catch (err: any) {
    console.error("Public store-settings error:", err);
    return NextResponse.json({
      success: true,
      settings: toPublicStoreSettings(DEFAULT_STORE_SETTINGS),
    });
  }
}
