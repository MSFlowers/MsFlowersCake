import { NextRequest, NextResponse } from "next/server";
import { uploadImageToImageKit } from "@/app/lib/imagekit";
import { isAdminRequest } from "@/app/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "/categories";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImageToImageKit(
      buffer,
      file.name || "upload.jpg",
      folder
    );

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    });
  } catch (error: any) {
    console.error("ImageKit upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image to ImageKit" },
      { status: 500 }
    );
  }
}
