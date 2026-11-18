"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";

export interface DbReview {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title?: string;
  comment: string;
  photo_url?: string;
  is_verified_buyer: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const DEFAULT_REVIEWS: DbReview[] = [
  {
    id: "r1",
    product_id: "fl-01",
    product_name: "Velvet Crimson 12 Red Roses Bouquet",
    product_image: "/flowers/red-roses-12.jpg",
    customer_name: "Sushain Demo",
    customer_email: "sushaindemo@gmail.com",
    rating: 5,
    title: "Fresh and Fragrant Blooms",
    comment: "The Dutch roses arrived fresh and blooming on time for our anniversary in Salt Lake. Amazing packaging!",
    is_verified_buyer: true,
    status: "approved",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "r2",
    product_id: "ck-01",
    product_name: "Signature Belgian Chocolate Truffle Cake",
    product_image: "/cakes/truffle.jpg",
    customer_name: "Priya Roy",
    customer_email: "priya.roy@gmail.com",
    rating: 5,
    title: "Super Moist & Rich Chocolate",
    comment: "Ordered for midnight delivery at Chingrighata. Reached right at 12:00 AM! Taste was divine.",
    is_verified_buyer: true,
    status: "approved",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "r3",
    product_id: "fl-02",
    product_name: "Imperial Pink Lilies & Carnations Bunch",
    product_image: "/flowers/pink-lilies.jpg",
    customer_name: "Ananya Banerjee",
    customer_email: "ananya.banerjee@gmail.com",
    rating: 5,
    title: "Elegant presentation",
    comment: "Beautiful flowers with wonderful scent. Delivered within 60 mins express slot.",
    is_verified_buyer: true,
    status: "approved",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "r4",
    product_id: "cb-01",
    product_name: "Classic Romance Rose Bouquet & Truffle Cake",
    product_image: "/combos/romance.jpg",
    customer_name: "Rahul Mukherjee",
    customer_email: "rahul.m@gmail.com",
    rating: 4,
    title: "Great value combo",
    comment: "The combination of fresh red roses and dark truffle cake was perfect for my sister birthday.",
    is_verified_buyer: true,
    status: "approved",
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: "r5",
    product_id: "fl-01",
    product_name: "Velvet Crimson 12 Red Roses Bouquet",
    product_image: "/flowers/red-roses-12.jpg",
    customer_name: "Dev Sharma",
    customer_email: "dev.sharma@gmail.com",
    rating: 5,
    title: "Pending Review Example",
    comment: "I recently ordered this bouquet and was impressed with the freshness and wrapping.",
    is_verified_buyer: true,
    status: "pending",
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
];

export function ReviewsModerationView() {
  const [reviews, setReviews] = useState<DbReview[]>(DEFAULT_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "approved" | "5star" | "4star" | "withPhotos"
  >("all");
  const [selectedReview, setSelectedReview] = useState<DbReview | null>(null);

  const fetchReviews = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.warn("Using default reviews fallback", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "pending" | "rejected") => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error("Status update error", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    if (selectedReview?.id === id) setSelectedReview(null);

    try {
      await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete review error", err);
    }
  };

  // Stats calculation
  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const avgRating =
    totalCount > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / totalCount).toFixed(1)
      : "5.0";

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.customer_name.toLowerCase().includes(q) ||
        r.customer_email.toLowerCase().includes(q) ||
        r.product_name.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTab === "pending") return r.status === "pending";
      if (activeTab === "approved") return r.status === "approved";
      if (activeTab === "5star") return r.rating === 5;
      if (activeTab === "4star") return r.rating === 4;
      if (activeTab === "withPhotos") return Boolean(r.photo_url);

      return true;
    });
  }, [reviews, search, activeTab]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
            Customer Feedback &amp; Ratings
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Customer Reviews
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Moderation Hub
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Moderate and manage verified customer reviews, ratings, and photo testimonials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchReviews(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 text-gray-500 ${refreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* 2. KPI Stat Cards (Matching Image 2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Reviews
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {totalCount}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Pending Approval
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
                pendingCount > 0 ? "text-amber-600" : "text-gray-900"
              }`}>
                {pendingCount}
              </span>
              {pendingCount > 0 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Needs Action
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        {/* Approved Reviews */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Approved Reviews
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {approvedCount}
              </span>
              <span className="text-xs font-semibold text-emerald-700">Live on Store</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Avg Rating */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Avg Rating
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
                {avgRating}
              </span>
              <span className="text-xs font-semibold text-purple-600">/ 5.0</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="rounded-2xl border border-rose-100 bg-white p-3.5 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search customer, product, comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50/80 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>

        {/* Filter Pills matching Image 2 */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {[
            { id: "all" as const, label: `All Reviews (${totalCount})` },
            { id: "pending" as const, label: `⏳ Pending (${pendingCount})` },
            { id: "approved" as const, label: `✓ Approved (${approvedCount})` },
            { id: "5star" as const, label: "5 ★ Stars" },
            { id: "4star" as const, label: "4 ★ Stars" },
            { id: "withPhotos" as const, label: "📷 With Photos" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Reviews Table matching Image 2 */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-rose-100 bg-rose-50/40 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Photo</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Review Snippet</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                    No customer reviews match your active filter.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => {
                  const isPending = r.status === "pending";
                  const isApproved = r.status === "approved";

                  return (
                    <tr key={r.id} className="hover:bg-rose-50/20 transition-colors">
                      {/* Product */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          {r.product_image ? (
                            <Image
                              src={r.product_image}
                              alt={r.product_name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-xl object-cover border border-rose-100 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 font-bold flex items-center justify-center shrink-0 border border-rose-100">
                              🌸
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate text-xs">
                              {r.product_name}
                            </p>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: {r.product_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{r.customer_name}</div>
                        <div className="text-[11px] text-gray-500">{r.customer_email}</div>
                        {r.is_verified_buyer && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                            ✓ Verified Buyer
                          </span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < r.rating ? "text-amber-400" : "text-gray-200"}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-gray-700">
                          {r.rating} / 5.0
                        </span>
                      </td>

                      {/* Photo */}
                      <td className="py-3.5 px-4">
                        {r.photo_url ? (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                            📷 Photo
                          </span>
                        ) : (
                          <span className="text-gray-300 font-bold">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isPending
                              ? "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {isApproved ? "✓ Approved" : isPending ? "⏳ Pending" : "✗ Rejected"}
                        </span>
                      </td>

                      {/* Review Snippet */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {r.title && (
                          <div className="font-bold text-gray-900 text-xs mb-0.5">
                            &ldquo;{r.title}&rdquo;
                          </div>
                        )}
                        <p className="text-gray-600 line-clamp-2 text-[11px] italic">
                          &ldquo;{r.comment}&rdquo;
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Action */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(r.id, "approved")}
                              title="Approve this review"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                              Approve
                            </button>
                          )}

                          {/* Reject Action if approved */}
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(r.id, "pending")}
                              title="Move back to Pending"
                              className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}

                          {/* View Modal */}
                          <button
                            type="button"
                            onClick={() => setSelectedReview(r)}
                            className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            👁 View
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            title="Delete review"
                            className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. View Full Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-rose-100 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Customer Review Details
                </span>
                <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                  {selectedReview.product_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Customer info */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900">{selectedReview.customer_name}</div>
                  <div className="text-gray-500 text-[11px]">{selectedReview.customer_email}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    ★ {selectedReview.rating}.0 / 5.0
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(selectedReview.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold">Moderation Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedReview.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {selectedReview.status === "approved" ? "✓ Approved (Live on Store)" : "⏳ Pending Approval"}
                </span>
              </div>

              {/* Review Text */}
              <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-1.5">
                {selectedReview.title && (
                  <h4 className="font-extrabold text-gray-900 text-sm">
                    {selectedReview.title}
                  </h4>
                )}
                <p className="text-gray-700 leading-relaxed font-medium">
                  {selectedReview.comment}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                {selectedReview.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedReview.id, "approved");
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Approve Review Now
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedReview.id, "pending");
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Move to Pending
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
