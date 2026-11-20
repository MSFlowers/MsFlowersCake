"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Product, ProductReview } from "./types";
import { getStoredCustomer, getStoredToken } from "../lib/customerAuth";
import { supabase } from "../lib/supabase";

export interface NewReviewInput {
  author?: string;
  city?: string;
  rating: number;
  comment: string;
  title?: string;
  photo_url?: string;
}

export function useProductReviews(product: Product) {
  const [dbReviews, setDbReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovedReviews = useCallback(async () => {
    try {
      const q = `/api/reviews?productId=${encodeURIComponent(product.id)}${
        product.slug ? `&productSlug=${encodeURIComponent(product.slug)}` : ""
      }`;
      const res = await fetch(q, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        const mapped: ProductReview[] = data.reviews.map((r: any) => ({
          id: r.id,
          author: r.customer_name || "Verified Customer",
          city: "Kolkata Hub",
          rating: Number(r.rating) || 5,
          date: r.created_at
            ? new Date(r.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recently",
          comment: r.comment,
        }));
        setDbReviews(mapped);
      }
    } catch (err) {
      console.warn("Could not load dynamic reviews", err);
    } finally {
      setLoading(false);
    }
  }, [product.id, product.slug]);

  useEffect(() => {
    fetchApprovedReviews();

    // 1. Supabase Realtime channel for live sync when reviews are created/approved/deleted
    let channel: any = null;
    try {
      // Unique channel topic name prevents Supabase channel reuse conflict during React StrictMode re-mounts
      const channelId = `live-reviews-${product.id}-${Math.random().toString(36).slice(2, 8)}`;
      channel = supabase
        .channel(channelId)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reviews",
          },
          (payload: any) => {
            // If the changed review belongs to this product (by id or slug), refresh live
            const row = payload.new || payload.old;
            if (
              row &&
              (row.product_id === product.id || (product.slug && row.product_id === product.slug))
            ) {
              fetchApprovedReviews();
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("Realtime subscription note:", e);
    }

    // 2. Window focus & visibility listeners so switching tabs (e.g. from Admin Moderation) live-syncs instantly
    const handleSync = () => {
      fetchApprovedReviews();
    };
    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, [fetchApprovedReviews, product.id, product.slug]);

  const addReview = useCallback(
    async (input: NewReviewInput) => {
      const customer = getStoredCustomer();
      const token = getStoredToken();

      if (!customer) {
        throw new Error("You must be logged in to submit a verified review.");
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          product_image: product.images?.[0] || "",
          rating: input.rating,
          title: input.title || "",
          comment: input.comment,
          photo_url: input.photo_url || null,
          customer_name: customer.name,
          customer_email: customer.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Trigger immediate fetch to check if auto-approved
      fetchApprovedReviews();

      return {
        success: true,
        pending: true,
        message:
          data.message ||
          "Thank you! Your review has been submitted for moderation and will appear once approved by our team.",
      };
    },
    [product, fetchApprovedReviews]
  );

  const reviews = useMemo(() => dbReviews, [dbReviews]);
  const totalCount = dbReviews.length;

  // Mathematically compute exact live average rating
  const avgRating = useMemo(() => {
    if (totalCount === 0) return 0.0;
    const sum = dbReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return Number((sum / totalCount).toFixed(1));
  }, [dbReviews, totalCount]);

  return {
    reviews,
    totalCount,
    avgRating,
    loading,
    addReview,
    refreshReviews: fetchApprovedReviews,
  };
}
