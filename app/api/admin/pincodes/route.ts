import { NextResponse } from "next/server";
import {
  getAllPincodes,
  addPincode,
  updatePincodeStatus,
  removePincode,
} from "@/app/lib/pincodesStore";

export async function GET() {
  try {
    const { pincodes, stats } = await getAllPincodes();
    return NextResponse.json({
      success: true,
      pincodes,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load pincodes", pincodes: [], stats: null },
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
        { error: "A valid 6-digit pincode is required." },
        { status: 400 }
      );
    }

    const savedRecord = await addPincode({
      pincode: trimmedPincode,
      area_name: (area_name || "").trim() || "Kolkata Delivery Hub",
      delivery_time: delivery_time || "45–60 Mins Express",
      is_active: is_active !== false,
    });

    return NextResponse.json({ success: true, pincode: savedRecord });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save pincode" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "Pincode ID is required" }, { status: 400 });
    }

    await updatePincodeStatus(id, Boolean(is_active));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update pincode status" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Pincode ID is required" }, { status: 400 });
    }

    await removePincode(id);
    return NextResponse.json({ success: true, message: "Pincode deleted" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete pincode" },
      { status: 500 }
    );
  }
}
