import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { sendVerificationEmail } from "@/app/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const trimmed = (email || "").trim().toLowerCase();
    if (!trimmed.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const { data: c } = await supabaseAdmin
      .from("customers")
      .select("id, name, email, email_verified, verification_expires_at")
      .eq("email", trimmed)
      .maybeSingle();

    // Generic response to avoid leaking which emails are registered
    const generic = NextResponse.json({
      success: true,
      message: "If this account needs verification, a new email has been sent.",
    });

    if (!c || c.email_verified) return generic;

    // Simple throttle: token issued < 60s ago (expiry is issued+24h)
    if (c.verification_expires_at) {
      const issuedAt = new Date(c.verification_expires_at).getTime() - 24 * 3600 * 1000;
      if (Date.now() - issuedAt < 60 * 1000) {
        return NextResponse.json(
          { error: "Please wait a minute before requesting another email." },
          { status: 429 }
        );
      }
    }

    await sendVerificationEmail(c, req);
    return generic;
  } catch (e: any) {
    console.error("Resend error:", e);
    return NextResponse.json({ error: "Could not send email. Try again later." }, { status: 500 });
  }
}
