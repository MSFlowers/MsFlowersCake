import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { verifyJwt } from "@/app/lib/jwt";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");

    let userEmail = queryEmail ? queryEmail.trim().toLowerCase() : "";

    // Also check JWT token if available
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = verifyJwt(token);
      if (payload && payload.email) {
        userEmail = payload.email.toLowerCase();
      }
    } else {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/ms_customer_jwt=([^;]+)/);
      if (match) {
        const payload = verifyJwt(match[1]);
        if (payload && payload.email) {
          userEmail = payload.email.toLowerCase();
        }
      }
    }

    if (!userEmail) {
      return NextResponse.json({ orders: [] });
    }

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("customer_email", userEmail)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customer orders:", error);
      return NextResponse.json({ orders: [] });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ orders: [], error: err.message }, { status: 500 });
  }
}
