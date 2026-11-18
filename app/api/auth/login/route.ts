import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { signJwt, verifyPassword } from "@/app/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    if (!trimmedPassword) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    // 1. Fetch customer by email
    const { data: customer, error: dbError } = await supabaseAdmin
      .from("customers")
      .select("id, name, email, phone, password, role")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (dbError) {
      console.error("Database query error:", dbError);
      return NextResponse.json(
        { error: "Database error: " + dbError.message },
        { status: 500 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { error: "No account found with this email. Please create an account." },
        { status: 401 }
      );
    }

    // 2. Verify password hash
    const isValid = verifyPassword(trimmedPassword, customer.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password. Please check your credentials." },
        { status: 401 }
      );
    }

    // 3. Generate JWT
    const token = signJwt({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: customer.role,
    });

    // 4. Return user info and set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
      },
      token,
    });

    response.cookies.set("ms_customer_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
