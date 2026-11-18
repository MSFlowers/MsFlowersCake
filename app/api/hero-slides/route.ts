import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { INITIAL_IMAGEKIT_SLIDES } from "@/app/data/siteDefaults";


export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return NextResponse.json({
        success: true,
        slides: data,
      });
    }

    return NextResponse.json({
      success: true,
      slides: INITIAL_IMAGEKIT_SLIDES.filter((s) => s.is_active),
    });
  } catch (err: any) {
    console.error("Storefront hero-slides fetch error:", err);
    return NextResponse.json({
      success: true,
      slides: INITIAL_IMAGEKIT_SLIDES.filter((s) => s.is_active),
    });
  }
}
