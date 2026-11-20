import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { DEFAULT_STORE_SETTINGS } from "@/app/data/siteDefaults";
import { parseEmailList } from "@/app/lib/email";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("store_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({
        success: true,
        settings: {
          ...DEFAULT_STORE_SETTINGS,
          ...data,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: DEFAULT_STORE_SETTINGS,
    });
  } catch (err: any) {
    console.error("Fetch store settings error:", err);
    return NextResponse.json({
      success: true,
      settings: DEFAULT_STORE_SETTINGS,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      store_name,
      tagline,
      support_phone,
      support_email,
      order_notification_email,
      order_email_notifications_enabled,
      address,
      operating_hours,
      midnight_hours,
      whatsapp_number,
      whatsapp_url,
      facebook_url,
      instagram_url,
      copyright_text,
      handcrafted_text,
    } = body;

    const rawNotificationEmail =
      order_notification_email !== undefined
        ? String(order_notification_email).trim()
        : DEFAULT_STORE_SETTINGS.order_notification_email;

    const parsedNotificationEmails = parseEmailList(rawNotificationEmail);
    if (rawNotificationEmail && parsedNotificationEmails.length === 0) {
      return NextResponse.json(
        { error: "Please enter a valid order notification email address (or comma-separated emails)." },
        { status: 400 }
      );
    }

    const payload = {
      id: "default",
      store_name: (store_name || DEFAULT_STORE_SETTINGS.store_name).trim(),
      tagline: (tagline || DEFAULT_STORE_SETTINGS.tagline).trim(),
      support_phone: (support_phone || DEFAULT_STORE_SETTINGS.support_phone).trim(),
      support_email: (support_email || DEFAULT_STORE_SETTINGS.support_email).trim(),
      order_notification_email:
        parsedNotificationEmails.length > 0
          ? parsedNotificationEmails.join(", ")
          : DEFAULT_STORE_SETTINGS.order_notification_email,
      order_email_notifications_enabled:
        order_email_notifications_enabled !== undefined
          ? Boolean(order_email_notifications_enabled)
          : DEFAULT_STORE_SETTINGS.order_email_notifications_enabled,
      address: (address || DEFAULT_STORE_SETTINGS.address).trim(),
      operating_hours: (operating_hours || DEFAULT_STORE_SETTINGS.operating_hours).trim(),
      midnight_hours: (midnight_hours || DEFAULT_STORE_SETTINGS.midnight_hours).trim(),
      whatsapp_number: (whatsapp_number || DEFAULT_STORE_SETTINGS.whatsapp_number).trim(),
      whatsapp_url: (whatsapp_url || DEFAULT_STORE_SETTINGS.whatsapp_url).trim(),
      facebook_url: (facebook_url || DEFAULT_STORE_SETTINGS.facebook_url).trim(),
      instagram_url: (instagram_url || DEFAULT_STORE_SETTINGS.instagram_url).trim(),
      copyright_text: (copyright_text || DEFAULT_STORE_SETTINGS.copyright_text).trim(),
      handcrafted_text: (handcrafted_text || DEFAULT_STORE_SETTINGS.handcrafted_text).trim(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("store_settings")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error("Database upsert error for store_settings:", error.message);
      return NextResponse.json(
        { error: "Database save failed: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (err: any) {
    console.error("Store settings update error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update store settings" },
      { status: 500 }
    );
  }
}
