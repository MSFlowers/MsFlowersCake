"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Product } from "../data/flowers";
import { NewReviewInput, useProductReviews } from "../data/reviewsState";
import {
  EditorialReviewItem,
  StarRatingDisplay,
  WriteReviewModal,
} from "./ProductReviewsSection";

interface ProductAllReviewsClientProps {
  product: Product;
  categoryPath: "flowers" | "cakes" | "combos";
  categoryLabel: string;
}

type RatingFilter = "all" | "5" | "4";

export default function ProductAllReviewsClient({
  product,
  categoryPath,
  categoryLabel,
}: ProductAllReviewsClientProps) {
  const { reviews, totalCount, addReview } = useProductReviews(product);
  const [filter, setFilter] = useState<RatingFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const productSlug = product.slug || product.id;
  const productHref = `/${categoryPath}/${productSlug}`;

  const filteredReviews = useMemo(() => {
    if (filter === "5") {
      return reviews.filter((r) => Math.round(r.rating) === 5);
    }
    if (filter === "4") {
      return reviews.filter((r) => Math.round(r.rating) === 4);
    }
    return reviews;
  }, [reviews, filter]);

  const breakdown = useMemo(() => {
    const baseFive = product.rating >= 4.95 ? 92 : product.rating >= 4.85 ? 86 : 79;
    const baseFour = product.rating >= 4.95 ? 7 : product.rating >= 4.85 ? 11 : 16;
    const baseThree = 100 - baseFive - baseFour;
    return [
      { stars: 5, percent: baseFive },
      { stars: 4, percent: baseFour },
      { stars: 3, percent: baseThree },
    ];
  }, [product.rating]);

  function handlePublish(input: NewReviewInput) {
    addReview(input);
    setFilter("all");
    setJustPublished(true);
    setTimeout(() => setJustPublished(false), 5000);
  }

  return (
    <div className="min-h-screen bg-[#faf8f7] text-zinc-900 font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1180px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb & Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 font-semibold min-w-0">
            <Link href="/" className="hover:text-[#c8102e] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/${categoryPath}`}
              className="hover:text-[#c8102e] transition-colors"
            >
              {categoryLabel}
            </Link>
            <span>/</span>
            <Link
              href={productHref}
              className="hover:text-[#c8102e] transition-colors truncate max-w-[150px] sm:max-w-[240px]"
            >
              {product.name}
            </Link>
            <span>/</span>
            <span className="text-zinc-950 font-bold shrink-0">Reviews</span>
          </nav>

          <Link
            href={productHref}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#c8102e] hover:underline shrink-0"
          >
            ← Back to {product.name}
          </Link>
        </div>

        {/* Top Product & Rating Summary Card */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 p-5 sm:p-8 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Product Identity */}
            <div className="lg:col-span-5 flex items-center gap-4">
              <Link
                href={productHref}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-zinc-200/80 bg-white shrink-0 group"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="96px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#c8102e]">
                  Customer Reviews
                </span>
                <h1 className="text-base sm:text-xl font-black text-zinc-950 leading-snug mt-0.5 line-clamp-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-black text-zinc-950">
                    ₹{product.price}
                  </span>
                  <Link
                    href={productHref}
                    className="text-xs font-bold text-zinc-600 hover:text-[#c8102e] underline underline-offset-2"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </div>

            {/* Rating Score & Breakdown Bars */}
            <div className="lg:col-span-4 flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-zinc-100 pt-5 lg:pt-0 lg:pl-7">
              <div className="shrink-0">
                <div className="text-4xl font-black text-zinc-950 leading-none">
                  {product.rating.toFixed(1)}
                </div>
                <div className="mt-2">
                  <StarRatingDisplay
                    rating={product.rating}
                    sizeClass="w-4 h-4"
                  />
                </div>
                <p className="text-[11px] font-semibold text-zinc-500 mt-1.5">
                  {totalCount} Kolkata reviews
                </p>
              </div>

              <div className="flex-1 space-y-1.5 min-w-[140px]">
                {breakdown.map((row) => (
                  <div
                    key={row.stars}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-7 font-bold text-zinc-700 shrink-0">
                      {row.stars} ★
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-semibold text-zinc-500 tabular-nums">
                      {row.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write a Review CTA */}
            <div className="lg:col-span-3 flex lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-zinc-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full lg:w-auto px-5 py-3 rounded-xl bg-zinc-900 hover:bg-[#c8102e] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                  />
                </svg>
                Write a Review
              </button>
            </div>
          </div>
        </section>

        {/* Full Editorial Review List */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 p-5 sm:p-8 shadow-2xs mt-6">
          {/* Filter Pills Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-200/80">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-950">
                All Customer Reviews
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Showing {filteredReviews.length} featured verified reviews from{" "}
                {totalCount} Kolkata deliveries
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[
                { id: "all" as const, label: "All Reviews" },
                { id: "5" as const, label: "5 Stars" },
                { id: "4" as const, label: "4 Stars" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setFilter(pill.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    filter === pill.id
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {justPublished && (
            <div className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Thank you! Your review has been added to the top of the list.
            </div>
          )}

          {/* Borderless Luxury Editorial List */}
          <div className="divide-y divide-zinc-100 mt-2">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((rev) => (
                <EditorialReviewItem key={rev.id} review={rev} />
              ))
            ) : (
              <div className="py-10 text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-600">
                  No reviews found for this star rating filter.
                </p>
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="text-xs font-bold text-[#c8102e] hover:underline cursor-pointer"
                >
                  Show All Reviews
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <WriteReviewModal
        isOpen={isModalOpen}
        productName={product.name}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePublish}
      />

      <Footer />
    </div>
  );
}
