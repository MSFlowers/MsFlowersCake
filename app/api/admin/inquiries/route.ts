import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET() {
  try {
    const { data: inquiries, error } = await supabaseAdmin
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message, inquiries: [] }, { status: 500 });
    }

    const items = inquiries || [];
    const totalInquiries = items.length;
    const unresolved = items.filter((i) => i.status === "unresolved" || i.status === "open").length;
    const resolved = items.filter((i) => i.status === "resolved").length;

    return NextResponse.json({
      success: true,
      inquiries: items,
      stats: {
        totalInquiries,
        unresolved,
        resolved,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, inquiries: [] }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Inquiry ID and status (resolved | unresolved) are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, inquiry: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("inquiries").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Inquiry deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
