"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import type { Product } from "../data/types";
import { formatDbProduct } from "../lib/db";

const MIDNIGHT_TABS = [
  { id: "all", label: "All Midnight Specials" },
  { id: "cakes", label: "Midnight Cakes" },
  { id: "flowers", label: "Midnight Flowers" },
  { id: "combos", label: "Midnight Combos" },
];

const SORT_OPTIONS = [
  { id: "popularity", label: "Popularity (Bestsellers)" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Customer Rating (Highest)" },
];

const FAQS = [
  {
    q: "How does 12:00 AM midnight delivery work in Kolkata?",
    a: "Our delivery rider arrives at the receiver's address between 11:30 PM to 11:55 PM and rings the bell or calls privately at exact midnight (12:00 AM). We ensure the surprise remains completely secret until delivery.",
  },
  {
    q: "Do you call before ringing the doorbell at midnight?",
    a: "Yes! If you request a surprise without waking up the rest of the household, our rider can call the receiver directly on their phone rather than ringing the bell.",
  },
  {
    q: "Are midnight cakes fresh or baked hours in advance?",
    a: "All midnight cakes are baked and frosted in our evening baking shift between 7:00 PM to 9:00 PM and kept in temperature-controlled chillers before being dispatched at 10:30 PM, ensuring perfect taste and shape.",
  },
  {
    q: "What if the receiver does not pick up the call at midnight?",
    a: "Our riders wait up to 20 minutes at the location and attempt to contact alternate numbers provided by the sender. We recommend providing a secondary phone number or security gate contact for apartment complexes.",
  },
];

export default function MidnightPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSort, setSelectedSort] = useState("popularity");
  const [onlyUnder1000, setOnlyUnder1000] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Curated list of midnight special products
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

  const midnightProducts = useMemo(
    () =>
      allProducts
        .filter((p) => p.isMidnight)
        .map((p) => ({ ...p, itemType: (p.group || "Cakes").toLowerCase() })),
    [allProducts]
  );

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...midnightProducts];

    // Filter by tab
    if (activeTab !== "all") {
      list = list.filter((item) => (item as Product & { itemType: string }).itemType === activeTab);
    }

    // Filter by budget under 1000
    if (onlyUnder1000) {
      list = list.filter((item) => item.price <= 999);
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
  }, [midnightProducts, activeTab, selectedSort, onlyUnder1000]);

  function resetFilters() {
    setActiveTab("all");
    setSelectedSort("popularity");
    setOnlyUnder1000(false);
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
            <span className="text-zinc-900 font-semibold">Midnight Delivery</span>
            {activeTab !== "all" && (
              <>
                <span>/</span>
                <span className="text-[#c8102e] font-semibold capitalize">
                  {MIDNIGHT_TABS.find((t) => t.id === activeTab)?.label}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Compact Promotional Hero Banner (Midnight Theme) */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-4 sm:pt-6">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-indigo-950/20">
            {/* Left Content */}
            <div className="z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                12:00 AM Midnight Cake &amp; Flower Delivery
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 font-medium mt-1.5 leading-relaxed">
                Make birthdays and anniversaries memorable! Our riders deliver between 11:30 PM to 12:00 AM with complimentary sparkler candle &amp; message card.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3.5">
                <span className="text-xs font-bold bg-white text-indigo-950 px-3 py-1.5 rounded-full shadow-xs">
                  🌙 11:30 PM – 12:00 AM Slot
                </span>
                <span className="text-xs font-semibold text-indigo-200">
                  Cutoff: Book by 9:45 PM for Tonight
                </span>
              </div>
            </div>

            {/* Right Trust Badges */}
            <div className="z-10 flex md:flex-col gap-2 shrink-0 self-start md:self-center">
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-left">
                <p className="text-[10px] uppercase font-bold text-indigo-200">Surprise Call</p>
                <p className="text-xs font-bold text-white">Private Call on Arrival</p>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-left">
                <p className="text-[10px] uppercase font-bold text-indigo-200">Complimentary Kit</p>
                <p className="text-xs font-bold text-white">Candle, Knife &amp; Card</p>
              </div>
            </div>

            {/* Background Decorative Blur */}
            <div className="absolute right-0 top-0 -bottom-10 w-96 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>

        {/* Visual Category Sub-Pills */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-6">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {MIDNIGHT_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count =
                tab.id === "all"
                  ? midnightProducts.length
                  : midnightProducts.filter(
                      (item) => (item as Product & { itemType: string }).itemType === tab.id
                    ).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#4338ca] text-white shadow-xs font-bold"
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
                Showing {filteredAndSortedProducts.length} Midnight Specials
              </span>

              <button
                type="button"
                onClick={() => setOnlyUnder1000(!onlyUnder1000)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  onlyUnder1000
                    ? "bg-indigo-100 border-indigo-300 text-indigo-900 font-bold"
                    : "bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400"
                }`}
              >
                💰 Under ₹999
              </button>

              {(onlyUnder1000 || activeTab !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-[#4338ca] hover:underline font-semibold ml-1 cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Right: Sort By Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <label
                htmlFor="midnight-sort-select"
                className="text-xs text-zinc-600 font-medium whitespace-nowrap"
              >
                Sort By:
              </label>
              <select
                id="midnight-sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="text-xs font-semibold bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-zinc-800 focus:outline-hidden focus:border-[#4338ca] cursor-pointer"
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
            <div className="text-center py-16 text-sm text-zinc-500 font-medium">Loading midnight specials…</div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 my-4">
              <p className="text-zinc-600 font-medium">
                No midnight items match your active filter criteria.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 px-4 py-2 bg-[#4338ca] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#312e81]"
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
          <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-2xl p-6 sm:p-8 border border-indigo-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-2">
              Kolkata 12:00 AM Midnight Delivery Coverage Areas
            </h2>
            <p className="text-sm text-zinc-600 mb-6 max-w-3xl">
              Midnight delivery riders are dispatched simultaneously at 10:45 PM across all major Kolkata zones to ensure punctual 11:30 PM to 12:00 AM arrival.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-semibold text-zinc-800">
              {[
                "Salt Lake (Sec 1 to 5)",
                "New Town & Action Area",
                "Chingrighata Hub (Central)",
                "Park Street & Central",
                "Ballygunge & Gariahat",
                "Lake Town & Dum Dum",
                "Tollygunge & Jadavpur",
                "Behala & New Alipore",
              ].map((area) => (
                <div
                  key={area}
                  className="bg-white border border-indigo-100 rounded-lg p-2.5 flex items-center gap-2 shadow-2xs"
                >
                  <span className="text-[#4338ca]">🌙</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-8 pb-16">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-4">
            Frequently Asked Questions about 12 AM Midnight Delivery
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
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-zinc-900 hover:text-[#4338ca] transition-colors cursor-pointer"
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
