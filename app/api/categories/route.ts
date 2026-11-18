import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/app/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentOnly = searchParams.get("parentOnly");
    const parentSlug = searchParams.get("parentSlug");

    let query = supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (parentOnly === "true") {
      query = query.is("parent_id", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase categories fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, categories: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch categories" },
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
      parent_id,
      group_name,
      subtitle,
      image_url,
      banner_image_url,
      badge,
      sort_order,
      is_active,
      is_featured,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert([
        {
          name: name.trim(),
          slug: cleanSlug,
          parent_id: parent_id || null,
          group_name: group_name ? group_name.trim() : null,
          subtitle: subtitle ? subtitle.trim() : null,
          image_url: image_url || null,
          banner_image_url: banner_image_url || null,
          badge: badge ? badge.trim() : null,
          sort_order: typeof sort_order === "number" ? sort_order : 0,
          is_active: is_active !== false,
          is_featured: Boolean(is_featured),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert category error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update category" },
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
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
