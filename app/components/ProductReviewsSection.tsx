"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Product, ProductReview } from "../data/flowers";
import { NewReviewInput, useProductReviews } from "../data/reviewsState";

const QUICK_LOCALITIES = [
  "Salt Lake",
  "New Town",
  "Ballygunge",
  "Dum Dum",
  "Park Street",
  "Alipore",
];

const RATING_LABELS: Record<number, string> = {
  1: "Disappointed",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatKolkataCity(city: string): string {
  const trimmed = city.trim();
  if (!trimmed) return "Kolkata";
  return trimmed.toLowerCase().includes("kolkata")
    ? trimmed
    : `${trimmed}, Kolkata`;
}

export function StarRatingDisplay({
  rating,
  sizeClass = "w-3.5 h-3.5",
}: {
  rating: number;
  sizeClass?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${sizeClass} ${
            i < rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-200 text-zinc-200"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Borderless luxury editorial review row for PDP and All Reviews lists.
 */
export function EditorialReviewItem({ review }: { review: ProductReview }) {
  const initials = getInitials(review.author);
  const locationLabel = formatKolkataCity(review.city);
  const isNew = review.id.startsWith("user-rev-");

  return (
    <article className="py-5 first:pt-4 last:pb-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Buyer Profile Header */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 text-[#c8102e] text-xs font-extrabold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-zinc-950 truncate">
                {review.author}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                <svg
                  className="w-3 h-3 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified Buyer
              </span>
              {isNew && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[#c8102e] text-[10px] font-bold">
                  New
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5 truncate">
              {locationLabel}
            </p>
          </div>
        </div>

        {/* Right: Stars + Relative Time */}
        <div className="flex items-center gap-2.5 pl-12 sm:pl-0 shrink-0">
          <StarRatingDisplay rating={review.rating} />
          <span className="text-xs text-zinc-400 font-medium">
            {review.date}
          </span>
        </div>
      </div>

      {/* Review Body */}
      <p className="mt-2.5 pl-12 text-xs sm:text-sm text-zinc-700 leading-relaxed">
        {review.comment}
      </p>
    </article>
  );
}

/**
 * Interactive Write-a-Review bottom-sheet (mobile) / centered modal (desktop).
 */
export function WriteReviewModal({
  isOpen,
  productName,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  onSubmit: (input: NewReviewInput) => void;
}) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [author, setAuthor] = useState("");
  const [city, setCity] = useState("Salt Lake");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeStars = hoverRating || rating;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!author.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (comment.trim().length < 5) {
      setError("Please write a short review (at least 5 characters).");
      return;
    }

    onSubmit({
      author,
      city,
      rating,
      comment,
    });

    setAuthor("");
    setCity("Salt Lake");
    setComment("");
    setRating(5);
    setHoverRating(0);
    setError("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-5 sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c8102e]">
              Share Your Experience
            </span>
            <h3
              id="write-review-title"
              className="text-lg font-extrabold text-zinc-950 mt-0.5 line-clamp-1"
            >
              {productName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review form"
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pt-5 space-y-5">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-2">
              Your Rating <span className="text-[#c8102e]">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} stars`}
                    className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                  >
                    <svg
                      className={`w-7 h-7 transition-colors ${
                        star <= activeStars
                          ? "fill-amber-400 text-amber-400"
                          : "fill-zinc-200 text-zinc-200"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                {RATING_LABELS[activeStars]}
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="review-author-name"
              className="block text-xs font-bold text-zinc-800 mb-1.5"
            >
              Your Name <span className="text-[#c8102e]">*</span>
            </label>
            <input
              id="review-author-name"
              type="text"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g., Priya Chatterjee"
              maxLength={60}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          {/* Kolkata Locality */}
          <div>
            <label
              htmlFor="review-city"
              className="block text-xs font-bold text-zinc-800 mb-1.5"
            >
              Kolkata Locality / Area
            </label>
            <input
              id="review-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Salt Lake, Ballygunge"
              maxLength={50}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_LOCALITIES.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setCity(loc)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                    city.trim().toLowerCase() === loc.toLowerCase()
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Review Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="review-comment"
                className="block text-xs font-bold text-zinc-800"
              >
                Your Review <span className="text-[#c8102e]">*</span>
              </label>
              <span className="text-[11px] font-medium text-zinc-400">
                {comment.length}/400
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError("");
              }}
              maxLength={400}
              placeholder="How was the freshness, presentation, and delivery experience?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-[#c8102e] bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-[#c8102e] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              Publish Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ProductReviewsSectionProps {
  product: Product;
  categoryPath: "flowers" | "cakes" | "combos";
}

/**
 * PDP Customer Reviews Tab: Borderless Luxury Editorial Feed displaying the 2 latest reviews,
 * an interactive Write-a-Review modal backed by React state, and a View All Reviews redirect.
 */
export default function ProductReviewsSection({
  product,
  categoryPath,
}: ProductReviewsSectionProps) {
  const { reviews, totalCount, addReview } = useProductReviews(product);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const latestReviews = reviews.slice(0, 2);
  const productSlug = product.slug || product.id;

  function handlePublish(input: NewReviewInput) {
    addReview(input);
    setJustPublished(true);
    setTimeout(() => setJustPublished(false), 5000);
  }

  return (
    <div className="pt-6 space-y-4">
      {/* Summary Header Bar */}
      <div className="pb-5 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-3xl font-black text-zinc-950">
            {product.rating.toFixed(1)}
            <svg
              className="w-6 h-6 fill-amber-400 text-amber-400"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <p className="text-xs text-zinc-500 font-semibold mt-0.5">
            Based on {totalCount} verified customer reviews in Kolkata
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 border border-zinc-300 hover:border-zinc-900 rounded-xl text-xs sm:text-sm font-bold text-zinc-900 hover:bg-zinc-50 transition-all cursor-pointer flex items-center gap-2"
        >
          <svg
            className="w-4 h-4 text-[#c8102e]"
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

      {/* Confirmation Banner */}
      {justPublished && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Thank you! Your review has been published.
        </div>
      )}

      {/* Borderless Luxury Editorial Feed (2 Latest Reviews Only) */}
      <div className="divide-y divide-zinc-100">
        {latestReviews.length > 0 ? (
          latestReviews.map((rev) => (
            <EditorialReviewItem key={rev.id} review={rev} />
          ))
        ) : (
          <p className="py-6 text-sm text-zinc-500">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>

      {/* View All Reviews Redirect Footer */}
      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-medium text-zinc-500">
          Showing {latestReviews.length} latest of {totalCount} verified reviews
        </span>
        <Link
          href={`/${categoryPath}/${productSlug}/reviews`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-[#c8102e] text-white text-xs sm:text-sm font-bold transition-colors"
        >
          View All {totalCount} Reviews →
        </Link>
      </div>

      <WriteReviewModal
        isOpen={isModalOpen}
        productName={product.name}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePublish}
      />
    </div>
  );
}
