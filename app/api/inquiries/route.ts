import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, inquiry_type, location, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Name, phone and inquiry message are required." },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/\D/g, "") || "customer";
    const safeEmail =
      email && typeof email === "string" && email.trim()
        ? email.trim()
        : `${cleanPhone}@inquiry.msflowers.in`;

    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .insert({
        name: name.trim(),
        email: safeEmail,
        phone: String(phone).trim(),
        inquiry_type: inquiry_type?.trim() || "General Query",
        location: location?.trim() || "Kolkata",
        message: message.trim(),
        status: "unresolved",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase inquiry insert error:", error);
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
