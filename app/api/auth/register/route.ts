import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { hashPassword } from "@/app/lib/jwt";
import { sendVerificationEmail } from "@/app/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    const trimmedName = (name || "").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPhone = (phone || "").trim();
    const trimmedPassword = (password || "").trim();

    if (!trimmedName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!trimmedPassword || trimmedPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 1. Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (checkError) {
      console.error("Database lookup error:", checkError);
      return NextResponse.json(
        { error: "Database error checking email: " + checkError.message },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please Sign In." },
        { status: 409 }
      );
    }

    // 2. Hash password
    const hashedPassword = hashPassword(trimmedPassword);

    // 3. Insert customer into database
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("customers")
      .insert({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone || null,
        password: hashedPassword,
        role: "customer",
        orders_count: 0,
        total_spent: 0,
      })
      .select("id, name, email, phone, role, created_at")
      .single();

    if (insertError) {
      console.error("Insert customer error:", insertError);
      return NextResponse.json(
        { error: "Failed to register customer: " + insertError.message },
        { status: 500 }
      );
    }

    // 4. Send verification email (no auto-login until verified)
    try {
      await sendVerificationEmail(newUser, req);
    } catch (mailErr: any) {
      console.error("Verification mail failed:", mailErr);
      return NextResponse.json({
        success: true,
        verificationRequired: true,
        emailSent: false,
        message:
          "Account created, but we couldn't send the verification email. Please use 'Resend verification email' on the Sign In tab.",
      });
    }

    return NextResponse.json({
      success: true,
      verificationRequired: true,
      emailSent: true,
      message: "Account created! Please check your email and click the verification link.",
    });
  } catch (err: any) {
    console.error("Register exception:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
