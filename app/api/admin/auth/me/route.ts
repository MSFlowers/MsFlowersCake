import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";

export async function GET(req: Request) {
  try {
    let token = "";

    // 1. Check Authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      // 2. Check HTTP-only cookie
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/ms_admin_jwt=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, admin: null }, { status: 200 });
    }

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ authenticated: false, admin: null, error: "Invalid or expired admin token" }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: payload.id,
        name: payload.name || "Administrator",
        email: payload.email,
        role: payload.role || "admin",
      },
    });
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_")) {
      throw err;
    }
    console.error("Admin auth check error:", err);
    return NextResponse.json({ authenticated: false, error: err?.message }, { status: 500 });
  }
}
