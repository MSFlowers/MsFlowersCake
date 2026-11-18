import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET() {
  try {
    const { data: pincodes, error } = await supabaseAdmin
      .from("pincodes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message, pincodes: [], stats: null },
        { status: 500 }
      );
    }

    const items = pincodes || [];
    const activeCount = items.filter((p) => p.is_active).length;

    return NextResponse.json({
      success: true,
      pincodes: items,
      stats: {
        total: items.length,
        active: activeCount,
        paused: items.length - activeCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, pincodes: [], stats: null },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pincode, area_name, delivery_time, is_active } = body;

    const trimmedPincode = (pincode || "").trim();
    if (!trimmedPincode || trimmedPincode.length !== 6) {
      return NextResponse.json(
        { error: "A valid 6-digit Kolkata pincode is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("pincodes")
      .insert({
        pincode: trimmedPincode,
        area_name: (area_name || "").trim() || "Kolkata Delivery Hub",
        delivery_time: delivery_time || "45–90 Mins",
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, pincode: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "Pincode ID is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("pincodes")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, pincode: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("pincodes").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Pincode deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
