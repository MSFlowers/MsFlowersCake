"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import type { Product } from "../data/types";
import { formatDbProduct } from "../lib/db";

const SAME_DAY_TABS = [
  { id: "all", label: "All 90-Min Items" },
  { id: "cakes", label: "Express Cakes" },
  { id: "flowers", label: "Fresh Flowers" },
  { id: "combos", label: "Celebration Combos" },
];

const SORT_OPTIONS = [
  { id: "popularity", label: "Popularity (Bestsellers)" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Customer Rating (Highest)" },
];

const FAQS = [
  {
    q: "How fast is same-day 90-minute delivery in Kolkata?",
    a: "Orders are prepared and dispatched directly from our central bakery and florist hub at Chingrighata, Salt Lake. For nearby areas like Salt Lake, Sector V, New Town, Lake Town, and Central Kolkata, our riders deliver within 45 to 60 minutes. Other major Kolkata locations take up to 90 minutes.",
  },
  {
    q: "Are the 90-minute express cakes baked fresh?",
    a: "Yes! Our bakery operates continuous fresh baking cycles throughout the day. Your cake is freshly frosted and customized with your message piping immediately upon receiving the order.",
  },
  {
    q: "What is the cutoff time for same-day delivery in Kolkata?",
    a: "We accept same-day express orders until 9:30 PM at night for delivery by 11:00 PM. After 9:30 PM, you can select our 12:00 AM Midnight Surprise delivery slot.",
  },
  {
    q: "Which areas in Kolkata are covered under 90-min delivery?",
    a: "We cover Chingrighata, Salt Lake (Sec 1 to 5), New Town & Action Area, Park Street, Ballygunge, Gariahat, Lake Town, Dum Dum, Tollygunge, Jadavpur, Behala, and Howrah.",
  },
];

export default function SameDayPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSort, setSelectedSort] = useState("popularity");
  const [onlyUnder700, setOnlyUnder700] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Combine only 90-min express products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((json) => {
        if (alive) setAllProducts((json.products || []).map(formatDbProduct));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const expressProducts = useMemo(
    () =>
      allProducts
        .filter((p) => p.deliveryTag === "90-Min Delivery")
        .map((p) => ({ ...p, itemType: (p.group || "Cakes").toLowerCase() })),
    [allProducts]
  );

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...expressProducts];

    // Filter by tab
    if (activeTab !== "all") {
      list = list.filter((item) => (item as Product & { itemType: string }).itemType === activeTab);
    }

    // Filter by budget under 700
    if (onlyUnder700) {
      list = list.filter((item) => item.price <= 699);
    }

    // Sort
    if (selectedSort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // Popularity
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return list;
  }, [expressProducts, activeTab, selectedSort, onlyUnder700]);

  function resetFilters() {
    setActiveTab("all");
    setSelectedSort("popularity");
    setOnlyUnder700(false);
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-zinc-50 border-b border-zinc-200/70">
          <div className="max-w-[1680px] mx-auto px-4 sm:px-8 py-2.5 text-xs text-zinc-500 flex items-center gap-2">
            <Link href="/" className="hover:text-zinc-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Same Day Delivery</span>
            {activeTab !== "all" && (
              <>
                <span>/</span>
                <span className="text-[#c8102e] font-semibold capitalize">
                  {SAME_DAY_TABS.find((t) => t.id === activeTab)?.label}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Compact Promotional Hero Banner (Sleek Urgency Focused) */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-4 sm:pt-6">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#881337] via-[#9f1239] to-[#be123c] text-white p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-rose-900/10">
            {/* Left Content */}
            <div className="z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Same-Day 90-Minute Flower &amp; Cake Delivery
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 font-medium mt-1.5 leading-relaxed">
                Dispatched directly from our Chingrighata central florist &amp; bakery hub. Salt Lake, New Town &amp; Central Kolkata delivered in 45–60 mins.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3.5">
                <span className="text-xs font-bold bg-white text-rose-950 px-3 py-1.5 rounded-full shadow-xs">
                  ⚡ 90-Min Guaranteed
                </span>
                <span className="text-xs font-semibold text-rose-100">
                  Cutoff: 9:30 PM for Tonight&apos;s Delivery
                </span>
              </div>
            </div>

            {/* Right Trust Badges */}
            <div className="z-10 flex md:flex-col gap-2 shrink-0 self-start md:self-center">
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-left">
                <p className="text-[10px] uppercase font-bold text-rose-200">Hub Location</p>
                <p className="text-xs font-bold text-white">Chingrighata, Salt Lake</p>
              </div>
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-left">
                <p className="text-[10px] uppercase font-bold text-rose-200">Delivery Status</p>
                <p className="text-xs font-bold text-emerald-300">● Riders Ready on Standby</p>
              </div>
            </div>

            {/* Background Decorative Blur */}
            <div className="absolute right-0 top-0 -bottom-10 w-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>

        {/* Visual Category Sub-Pills */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-6">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {SAME_DAY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count =
                tab.id === "all"
                  ? expressProducts.length
                  : expressProducts.filter(
                      (item) => (item as Product & { itemType: string }).itemType === tab.id
                    ).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#c8102e] text-white shadow-xs font-bold"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-3">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Product count & Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-bold text-zinc-900 mr-1">
                Showing {filteredAndSortedProducts.length} Express Items
              </span>

              <button
                type="button"
                onClick={() => setOnlyUnder700(!onlyUnder700)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  onlyUnder700
                    ? "bg-rose-100 border-rose-300 text-rose-900 font-bold"
                    : "bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400"
                }`}
              >
                💰 Under ₹699
              </button>

              {(onlyUnder700 || activeTab !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-[#c8102e] hover:underline font-semibold ml-1 cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Right: Sort By Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <label
                htmlFor="sameday-sort-select"
                className="text-xs text-zinc-600 font-medium whitespace-nowrap"
              >
                Sort By:
              </label>
              <select
                id="sameday-sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="text-xs font-semibold bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-zinc-800 focus:outline-hidden focus:border-[#c8102e] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid: Same Clean Card from Home Page */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-4">
          {loading ? (
            <div className="text-center py-16 text-sm text-zinc-500 font-medium">Loading express items…</div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 my-4">
              <p className="text-zinc-600 font-medium">
                No express items match your active filter criteria.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 px-4 py-2 bg-[#c8102e] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#9b0b22]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredAndSortedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </div>

        {/* Kolkata Delivery Hub & Assurance Section */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-10 mt-6 border-t border-zinc-200">
          <div className="bg-gradient-to-br from-zinc-50 to-rose-50/40 rounded-2xl p-6 sm:p-8 border border-zinc-200/80">
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-2">
              Kolkata 90-Minute Express Dispatch Hub Areas
            </h2>
            <p className="text-sm text-zinc-600 mb-6 max-w-3xl">
              Riders are stationed at our central Chingrighata hub, providing direct speed delivery across major residential and IT corridors of Kolkata.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-semibold text-zinc-800">
              {[
                "Chingrighata Hub (45 Min)",
                "Salt Lake (Sec 1 to 5)",
                "New Town & Action Area",
                "Park Street & Central",
                "Ballygunge & Gariahat",
                "Lake Town & Dum Dum",
                "Tollygunge & Jadavpur",
                "Behala & New Alipore",
              ].map((area) => (
                <div
                  key={area}
                  className="bg-white border border-zinc-200/80 rounded-lg p-2.5 flex items-center gap-2 shadow-2xs"
                >
                  <span className="text-[#c8102e]">⚡</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-8 pb-16">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-4">
            Frequently Asked Questions about Same-Day Delivery in Kolkata
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div
                  key={faq.q}
                  className="border border-zinc-200 rounded-xl overflow-hidden transition-all bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-zinc-900 hover:text-[#c8102e] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg font-light text-zinc-500">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
