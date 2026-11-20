import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET() {
  try {
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message, reviews: [] }, { status: 500 });
    }

    const items = reviews || [];
    const totalReviews = items.length;
    const pendingApproval = items.filter((r) => r.status === "pending").length;
    const approvedReviews = items.filter((r) => r.status === "approved").length;

    const avgRating =
      totalReviews > 0
        ? Number(
            (items.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
          )
        : 0.0;

    return NextResponse.json({
      success: true,
      reviews: items,
      stats: {
        totalReviews,
        pendingApproval,
        approvedReviews,
        avgRating,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, reviews: [] }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Review ID and status (approved | pending | rejected) are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("reviews")
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

    // Live sync to products table: recalculate avg rating and reviews_count for this product
    if (data?.product_id) {
      const { data: approvedReviews } = await supabaseAdmin
        .from("reviews")
        .select("rating")
        .eq("product_id", data.product_id)
        .eq("status", "approved");

      const approvedCount = approvedReviews?.length || 0;
      const newAvg =
        approvedCount > 0
          ? Number((approvedReviews!.reduce((sum, r) => sum + (r.rating || 5), 0) / approvedCount).toFixed(1))
          : 0.0;

      await supabaseAdmin
        .from("products")
        .update({
          rating: newAvg,
          reviews_count: approvedCount,
        })
        .or(`id.eq.${data.product_id},slug.eq.${data.product_id}`);
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const { data: rev } = await supabaseAdmin
      .from("reviews")
      .select("product_id")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (rev?.product_id) {
      const { data: approvedReviews } = await supabaseAdmin
        .from("reviews")
        .select("rating")
        .eq("product_id", rev.product_id)
        .eq("status", "approved");

      const approvedCount = approvedReviews?.length || 0;
      const newAvg =
        approvedCount > 0
          ? Number((approvedReviews!.reduce((sum, r) => sum + (r.rating || 5), 0) / approvedCount).toFixed(1))
          : 0.0;

      await supabaseAdmin
        .from("products")
        .update({
          rating: newAvg,
          reviews_count: approvedCount,
        })
        .or(`id.eq.${rev.product_id},slug.eq.${rev.product_id}`);
    }

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
