import { NextResponse } from "next/server";
import { getAllPincodes } from "@/app/lib/pincodesStore";

export async function GET() {
  try {
    const { pincodes } = await getAllPincodes();
    const activePincodes = (pincodes || []).filter((p) => p.is_active);
    return NextResponse.json({ pincodes: activePincodes });
  } catch {
    return NextResponse.json({ pincodes: [] });
  }
}
