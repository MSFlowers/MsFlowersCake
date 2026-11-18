import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/app/lib/supabase";
import { verifyJwt } from "@/app/lib/jwt";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    let query = supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data: reviews, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message, reviews: [] }, { status: 500 });
    }

    const items = reviews || [];
    const count = items.length;
    const avgRating =
      count > 0
        ? Number((items.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
        : 5.0;

    return NextResponse.json({
      success: true,
      reviews: items,
      count,
      avgRating,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, reviews: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    let customerSession: any = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      customerSession = verifyJwt(token);
    }

    const body = await req.json();
    const {
      product_id,
      product_name,
      product_image,
      rating,
      title,
      comment,
      photo_url,
      customer_name,
      customer_email,
    } = body;

    // Must be logged in to submit a review
    const verifiedName = customerSession?.name || customer_name;
    const verifiedEmail = customerSession?.email || customer_email;
    const customerId = customerSession?.id || null;

    if (!verifiedName || !verifiedEmail) {
      return NextResponse.json(
        { error: "Sign-in required: You must be logged in to write a verified customer review." },
        { status: 401 }
      );
    }

    if (!product_id || !comment || !rating) {
      return NextResponse.json(
        { error: "Product, rating (1–5) and comment are required." },
        { status: 400 }
      );
    }

    const numRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

    // Save with status = 'pending' for moderation
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .insert({
        product_id: product_id.trim(),
        product_name: product_name?.trim() || "MS Floral Arrangement",
        product_image: product_image || null,
        customer_id: customerId,
        customer_name: verifiedName.trim(),
        customer_email: verifiedEmail.trim(),
        rating: numRating,
        title: title?.trim() || null,
        comment: comment.trim(),
        photo_url: photo_url || null,
        is_verified_buyer: true,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review has been submitted for moderation and will appear once approved by our team.",
      review: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
