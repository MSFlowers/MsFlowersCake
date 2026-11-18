"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Product, ProductReview } from "./types";
import { getStoredCustomer, getStoredToken } from "../lib/customerAuth";

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
  const [avgRating, setAvgRating] = useState<number>(product.rating || 5.0);

  const fetchApprovedReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        const mapped: ProductReview[] = data.reviews.map((r: any) => ({
          id: r.id,
          author: r.customer_name || "Verified Customer",
          city: "Kolkata Hub",
          rating: r.rating || 5,
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
        if (typeof data.avgRating === "number") {
          setAvgRating(data.avgRating);
        }
      }
    } catch (err) {
      console.warn("Could not load dynamic reviews", err);
    } finally {
      setLoading(false);
    }
  }, [product.id, product.rating]);

  useEffect(() => {
    fetchApprovedReviews();
  }, [fetchApprovedReviews]);

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

      return {
        success: true,
        pending: true,
        message: data.message || "Thank you! Your review has been submitted for moderation and will appear once approved by our team.",
      };
    },
    [product]
  );

  const reviews = useMemo(() => {
    return dbReviews;
  }, [dbReviews]);

  const totalCount = dbReviews.length;

  return {
    reviews,
    totalCount,
    avgRating,
    loading,
    addReview,
    refreshReviews: fetchApprovedReviews,
  };
}
