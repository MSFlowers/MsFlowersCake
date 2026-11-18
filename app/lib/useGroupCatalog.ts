"use client";

import { useEffect, useState } from "react";
import type { CategoryTab, Product } from "../data/types";
import { formatDbProduct } from "./db";

/**
 * Loads live products + sub-category tabs for a group (Flowers / Cakes / Combos)
 * from the Supabase-backed API routes.
 */
export function useGroupCatalog(
  group: "Flowers" | "Cakes" | "Combos",
  rootSlug: string
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryTab[]>([
    { id: "all", label: `All ${group}` },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/products?group=${group}`),
        ]);

        if (catRes.ok) {
          const json = await catRes.json();
          const all: any[] = json.categories || [];
          const root = all.find((c) => c.slug === rootSlug && !c.parent_id);
          if (root && alive) {
            const subs = all.filter(
              (c) =>
                c.parent_id === root.id &&
                c.is_active &&
                !c.group_name?.startsWith("drawer:") &&
                c.group_name !== "page_config"
            );
            setCategories([
              { id: "all", label: `All ${group}` },
              ...subs.map((s) => ({
                id: s.slug,
                label: s.name,
                image: s.image_url || null,
                badge: s.badge || null,
              })),
            ]);
          }
        }

        if (prodRes.ok && alive) {
          const json = await prodRes.json();
          setProducts((json.products || []).map(formatDbProduct));
        }
      } catch {
        // leave empty on network failure
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [group, rootSlug]);

  return { products, categories, loading };
}
