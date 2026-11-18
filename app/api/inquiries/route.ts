import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, inquiry_type, location, message } = body;

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: "Name, email, phone and inquiry message are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        inquiry_type: inquiry_type?.trim() || "Bulk / Wholesale Order",
        location: location?.trim() || "Kolkata Central Hub",
        message: message.trim(),
        status: "unresolved",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your inquiry has been received. Our team will contact you shortly.",
      inquiry: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
