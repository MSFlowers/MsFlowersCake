import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/app/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");
    const categorySlug = searchParams.get("categorySlug");
    const slug = searchParams.get("slug");

    const includeInactive = searchParams.get("includeInactive") === "true";

    // Admin listing (includeInactive) must bypass the public RLS policy that hides inactive rows
    const client = includeInactive ? supabaseAdmin : supabase;
    let query = client
      .from("products")
      .select("*, categories:category_id(slug,name), sub_categories:sub_category_id(slug,name)")
      .order("created_at", { ascending: false });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    if (group) {
      query = query.eq("group_type", group);
    }

    if (categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .limit(1)
        .maybeSingle();
      if (cat?.id) {
        query = query.or(`category_id.eq.${cat.id},sub_category_id.eq.${cat.id}`);
      }
    }

    if (slug) {
      query = query.eq("slug", slug);
      const { data, error } = await query.single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ success: true, product: data });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, products: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      group_type,
      category_id,
      sub_category_id,
      price,
      original_price,
      delivery_tag,
      badge,
      tagline,
      description,
      image,
      images,
      is_eggless,
      weight,
      specs,
      care_tips,
      delivery_info,
      stock,
      threshold,
      is_active,
      is_midnight,
      reviews,
      sort_order,
      variants,
      color_galleries,
    } = body;

    if (!name || !price || !group_type || !image) {
      return NextResponse.json(
        { error: "Name, price, group_type, and image are required" },
        { status: 400 }
      );
    }

    const cleanSlug = (slug || name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert([
        {
          name: name.trim(),
          slug: cleanSlug,
          group_type,
          category_id: category_id || null,
          sub_category_id: sub_category_id || null,
          price: Number(price),
          original_price: original_price ? Number(original_price) : null,
          delivery_tag: delivery_tag || "90-Min Delivery",
          badge: badge || null,
          tagline: tagline || null,
          description: description || null,
          image,
          images: Array.isArray(images) && images.length > 0 ? images : [image],
          is_eggless: Boolean(is_eggless),
          weight: weight || null,
          specs: specs || {},
          care_tips: Array.isArray(care_tips) ? care_tips : [],
          delivery_info: Array.isArray(delivery_info) ? delivery_info : [],
          stock: typeof stock === "number" ? stock : 25,
          threshold: typeof threshold === "number" ? threshold : 5,
          is_active: is_active !== false,
          is_midnight: Boolean(is_midnight),
          reviews: Array.isArray(reviews) ? reviews : [],
          variants: Array.isArray(variants) ? variants : [],
          color_galleries: Array.isArray(color_galleries) ? color_galleries : [],
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert product error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, categories: _c, sub_categories: _s, created_at: _ca, updated_at: _ua, sort_order: _so, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
