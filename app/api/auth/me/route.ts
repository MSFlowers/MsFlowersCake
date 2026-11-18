import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET(req: Request) {
  try {
    // 1. Check Bearer token from header or cookie
    let token = "";
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/ms_customer_jwt=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 2. Verify JWT
    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ user: null, error: "Invalid token" }, { status: 200 });
    }

    // 3. Fetch latest user data from DB
    const { data: user, error } = await supabaseAdmin
      .from("customers")
      .select("id, name, email, phone, role, orders_count, total_spent, created_at")
      .eq("id", payload.id)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_")) {
      throw err;
    }
    return NextResponse.json({ user: null, error: err?.message }, { status: 500 });
  }
}
