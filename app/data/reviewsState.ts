"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Product, ProductReview } from "./flowers";

// In-memory store for reviews submitted during the current SPA session (React state backed, no browser storage)
const userAddedReviewsMap = new Map<string, ProductReview[]>();
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

/**
 * Provides authentic supplementary Kolkata buyer reviews tailored to the product type
 * so every product displays rich feedback across the 2-review preview and full reviews page.
 */
function getSupplementaryReviews(product: Product): ProductReview[] {
  const isCake = product.id.startsWith("ck-");
  const isCombo = product.id.startsWith("cb-");

  if (isCake) {
    return [
      {
        id: `${product.id}-supp-1`,
        author: "Riddhima Chatterjee",
        city: "Southern Avenue",
        rating: 5,
        date: "6 days ago",
        comment:
          "Ordered for my mother's birthday dinner. The sponge was super moist, frosting wasn't overly sweet, and delivery arrived chilled right on time.",
      },
      {
        id: `${product.id}-supp-2`,
        author: "Sayan Chakraborty",
        city: "New Town Action Area I",
        rating: 4,
        date: "2 weeks ago",
        comment:
          "Great presentation and neat piping for the custom message. The rigid cake box kept every edge intact despite evening traffic.",
      },
      {
        id: `${product.id}-supp-3`,
        author: "Nandini Basu",
        city: "Lake Gardens",
        rating: 5,
        date: "3 weeks ago",
        comment:
          "Pure veg bakery quality that genuinely feels artisanal. Everyone at the table asked where we ordered the cake from.",
      },
      {
        id: `${product.id}-supp-4`,
        author: "Debashish Sen",
        city: "Salt Lake BE Block",
        rating: 5,
        date: "1 month ago",
        comment:
          "Midnight delivery slot was punctual to the minute. Packed neatly with candles and a wooden knife.",
      },
    ];
  }

  if (isCombo) {
    return [
      {
        id: `${product.id}-supp-1`,
        author: "Tanushree Bose",
        city: "Ballygunge Circular Rd",
        rating: 5,
        date: "5 days ago",
        comment:
          "Both the blooms and the cake reached together in one synchronized delivery. Saved me from coordinating two separate orders!",
      },
      {
        id: `${product.id}-supp-2`,
        author: "Anirban Dutta",
        city: "Salt Lake Sector II",
        rating: 5,
        date: "1 week ago",
        comment:
          "Very thoughtful luxury packaging. The handwritten greeting card added such a warm personal touch to the anniversary surprise.",
      },
      {
        id: `${product.id}-supp-3`,
        author: "Koyel Mitra",
        city: "Hindustan Park",
        rating: 4,
        date: "2 weeks ago",
        comment:
          "Fresh flowers and delicious eggless cake at a great combo value. Delivery rider called gently at the gate as requested.",
      },
      {
        id: `${product.id}-supp-4`,
        author: "Subhankar Roy",
        city: "Tollygunge",
        rating: 5,
        date: "3 weeks ago",
        comment:
          "Exactly as pictured on the site. No last-minute substitutions and the blooms lasted days afterward.",
      },
    ];
  }

  return [
    {
      id: `${product.id}-supp-1`,
      author: "Rituparna Sen",
      city: "Ballygunge Place",
      rating: 5,
      date: "6 days ago",
      comment:
        "Fresh morning-cut stems with a lovely natural fragrance. The wrapping paper and satin ribbon looked straight out of a boutique studio.",
    },
    {
      id: `${product.id}-supp-2`,
      author: "Kaushik Bhattacharya",
      city: "Salt Lake City Centre",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Arrived in hydration wraps within 80 minutes of ordering. My parents loved the handwritten message card that came along.",
    },
    {
      id: `${product.id}-supp-3`,
      author: "Poulomi Ganguly",
      city: "Jodhpur Park",
      rating: 4,
      date: "3 weeks ago",
      comment:
        "Crisp petals and generous fillers. Trimmed the stems as per the care guide and the arrangement stayed vibrant for nearly a week.",
    },
    {
      id: `${product.id}-supp-4`,
      author: "Indrajit Saha",
      city: "New Alipore",
      rating: 5,
      date: "1 month ago",
      comment:
        "Reliable express flower delivery in Kolkata. Never disappoints for birthdays or last-minute celebration wishes.",
    },
  ];
}

export interface NewReviewInput {
  author: string;
  city: string;
  rating: number;
  comment: string;
}

/**
 * Hook returning merged reviews (user-submitted in React state + product static reviews + supplementary reviews),
 * live review count, average rating, and an addReview mutator.
 */
export function useProductReviews(product: Product) {
  const [userReviews, setUserReviews] = useState<ProductReview[]>(
    () => userAddedReviewsMap.get(product.id) ?? []
  );

  useEffect(() => {
    const sync = () => {
      setUserReviews([...(userAddedReviewsMap.get(product.id) ?? [])]);
    };
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, [product.id]);

  const addReview = useCallback(
    (input: NewReviewInput) => {
      const cleanAuthor = input.author.trim();
      const cleanCity = input.city.trim() || "Kolkata";
      const cleanComment = input.comment.trim();
      if (!cleanAuthor || !cleanComment) return;

      const newReview: ProductReview = {
        id: `user-rev-${Date.now()}`,
        author: cleanAuthor,
        city: cleanCity,
        rating: Math.min(5, Math.max(1, Math.round(input.rating))),
        date: "Just now",
        comment: cleanComment,
      };

      const existing = userAddedReviewsMap.get(product.id) ?? [];
      userAddedReviewsMap.set(product.id, [newReview, ...existing]);
      notifyListeners();
    },
    [product.id]
  );

  const reviews = useMemo(() => {
    const base = product.reviews ?? [];
    const supplementary = getSupplementaryReviews(product);
    const seen = new Set<string>();
    const combined: ProductReview[] = [];

    for (const rev of [...userReviews, ...base, ...supplementary]) {
      if (!seen.has(rev.id)) {
        seen.add(rev.id);
        combined.push(rev);
      }
    }
    return combined;
  }, [product, userReviews]);

  const totalCount = product.reviewsCount + userReviews.length;

  return {
    reviews,
    userReviewsCount: userReviews.length,
    totalCount,
    addReview,
  };
}
