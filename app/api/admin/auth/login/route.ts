import { NextResponse } from "next/server";
import { signJwt, hashPassword, verifyPassword } from "@/app/lib/jwt";
import { supabaseAdmin } from "@/app/lib/supabase";

const MASTER_ADMIN_EMAIL = "admin@msflowers.in";
const MASTER_ADMIN_PASSWORD = "Msflowers@0302";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail) {
      return NextResponse.json(
        { error: "Admin email is required." },
        { status: 400 }
      );
    }

    if (!trimmedPassword) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    let isMatch = false;

    // 1. Direct master credentials verification
    if (
      trimmedEmail === MASTER_ADMIN_EMAIL.toLowerCase() &&
      trimmedPassword === MASTER_ADMIN_PASSWORD
    ) {
      isMatch = true;

      // Sync/upsert into customers DB table in background
      try {
        const hashedPassword = hashPassword(MASTER_ADMIN_PASSWORD);
        await supabaseAdmin
          .from("customers")
          .upsert(
            {
              email: MASTER_ADMIN_EMAIL,
              name: "MS Flowers Admin",
              phone: "+91 6295233296",
              password: hashedPassword,
              role: "admin",
            },
            { onConflict: "email" }
          );
      } catch (err) {
        // Non-blocking DB sync
        console.warn("Admin DB sync warning:", err);
      }
    } else {
      // 2. Also check if admin exists in database with hashed password
      try {
        const { data: dbAdmin, error: dbErr } = await supabaseAdmin
          .from("customers")
          .select("id, name, email, password, role")
          .eq("email", trimmedEmail)
          .eq("role", "admin")
          .maybeSingle();

        if (!dbErr && dbAdmin && dbAdmin.password) {
          if (verifyPassword(trimmedPassword, dbAdmin.password)) {
            isMatch = true;
          }
        }
      } catch (err) {
        console.warn("DB admin check error:", err);
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid admin email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    // 3. Issue RFC 7519 HMAC-SHA256 JWT
    const token = signJwt(
      {
        id: "admin-root",
        name: "Administrator",
        email: MASTER_ADMIN_EMAIL,
        phone: "+91 6295233296",
        role: "admin",
      },
      7 * 24 * 3600 // 7 days validity
    );

    const adminUser = {
      id: "admin-root",
      name: "Administrator",
      email: MASTER_ADMIN_EMAIL,
      role: "admin",
    };

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully via JWT",
      admin: adminUser,
      token,
    });

    // 4. Set Secure HTTP-only cookie
    response.cookies.set("ms_admin_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process admin login" },
      { status: 500 }
    );
  }
}
