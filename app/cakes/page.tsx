"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { CAKE_CATEGORIES, CAKE_PRODUCTS } from "../data/cakes";

const SORT_OPTIONS = [
  { id: "popularity", label: "Popularity (Bestsellers)" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Customer Rating (Highest)" },
];

const CAKE_OCCASIONS = [
  {
    id: "birthday",
    title: "Birthday Celebrations",
    subtitle: "Rainbow Confetti & Theme Cakes",
    tag: "BESTSELLER",
    image: "/categories/birthday-cake.jpg",
    categoryTab: "birthday",
  },
  {
    id: "anniversary",
    title: "Anniversary Romance",
    subtitle: "Heart-Shaped Red Velvet",
    tag: "LOVE & HEART",
    image: "/products/cakes/red-velvet-heart-cake.jpg",
    categoryTab: "red-velvet",
  },
  {
    id: "midnight",
    title: "Midnight 12 AM Surprise",
    subtitle: "Dark Chocolate Truffle Ganache",
    tag: "12 AM EXPRESS",
    image: "/products/cakes/chocolate-truffle-cake.jpg",
    categoryTab: "chocolate",
  },
  {
    id: "bento",
    title: "Korean Bento Mini Cakes",
    subtitle: "Cute Lunchbox Birthday Cakes",
    tag: "TRENDING",
    image: "/trust/freshly-baked-cakes.jpg",
    categoryTab: "bento",
  },
];

const FAQS = [
  {
    q: "Can I get midnight cake delivery at 12:00 AM in Kolkata?",
    a: "Yes! We specialize in 12 AM midnight cake deliveries across Kolkata including Salt Lake, New Town, Park Street, Ballygunge, Lake Town, and surrounding areas. Our riders deliver fresh cakes right at your doorstep between 11:30 PM to 12:00 AM.",
  },
  {
    q: "Are the cakes 100% eggless?",
    a: "Yes! All our celebration cakes can be prepared 100% eggless with pure vegetarian ingredients. You can also mention your preference while confirming on WhatsApp or in your order note.",
  },
  {
    q: "Can I customize the message or name on the cake?",
    a: "Absolutely! Free personalized message piping (e.g. 'Happy Birthday Rahul', 'Happy 10th Anniversary') plus complimentary candle and knife are provided with every order.",
  },
  {
    q: "How fast is express cake delivery in Kolkata?",
    a: "Our central bakery & florist hub is at Chingrighata (Salt Lake bypass). For nearby locations like Salt Lake, Sector V, New Town, and EM Bypass, we deliver in 45 to 60 minutes. Standard delivery across Kolkata takes 90 minutes.",
  },
];

function CakesContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");
  const [selectedSort, setSelectedSort] = useState("popularity");
  const [only90Min, setOnly90Min] = useState(false);
  const [onlyUnder600, setOnlyUnder600] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Sync with URL query parameter changes
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...CAKE_PRODUCTS];

    // Filter by subcategory
    if (activeCategory !== "all") {
      list = list.filter((item) => item.category === activeCategory);
    }

    // Filter by 90-min delivery
    if (only90Min) {
      list = list.filter((item) => item.deliveryTag === "90-Min Delivery");
    }

    // Filter by budget under 600
    if (onlyUnder600) {
      list = list.filter((item) => item.price <= 599);
    }

    // Sort
    if (selectedSort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: popularity by reviews count
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return list;
  }, [activeCategory, selectedSort, only90Min, onlyUnder600]);

  function resetFilters() {
    setActiveCategory("all");
    setSelectedSort("popularity");
    setOnly90Min(false);
    setOnlyUnder600(false);
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
            <span className="text-zinc-900 font-semibold">Cakes</span>
            {activeCategory !== "all" && (
              <>
                <span>/</span>
                <span className="text-[#c8102e] font-semibold capitalize">
                  {CAKE_CATEGORIES.find((c) => c.id === activeCategory)?.label || activeCategory}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Compact Promotional Hero Banner */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-4 sm:pt-6">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#881337] via-[#9f1239] to-[#be123c] text-white p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-rose-900/10">
            {/* Left Content */}
            <div className="z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Freshly Baked Celebration Cakes
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 font-medium mt-1.5 leading-relaxed">
                Baked fresh on order at our Chingrighata central kitchen. 100% pure veg (eggless) available with free name piping &amp; knife.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3.5">
                <span className="text-xs font-bold bg-white text-rose-950 px-3 py-1.5 rounded-full shadow-xs">
                  Use Code: CAKE15
                </span>
                <span className="text-xs font-semibold text-rose-100">
                  ⚡ 45–90 Mins Delivery Across Kolkata
                </span>
              </div>
            </div>

            {/* Right Trust Badges */}
            <div className="z-10 flex md:flex-col gap-2 shrink-0 self-start md:self-center">
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-left">
                <p className="text-[10px] uppercase font-bold text-rose-200">Dietary Assurance</p>
                <p className="text-xs font-bold text-white">100% Eggless Option</p>
              </div>
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-left">
                <p className="text-[10px] uppercase font-bold text-rose-200">Surprise Slot</p>
                <p className="text-xs font-bold text-white">12 AM Midnight Guaranteed</p>
              </div>
            </div>

            {/* Background Decorative Blur */}
            <div className="absolute right-0 top-0 -bottom-10 w-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>

        {/* Occasions Visual Grid (Clean Photos) */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-8 sm:pt-10">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Celebration Cakes For Every Occasion
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
              Select handcrafted artisanal cakes tailored for birthdays, anniversaries, and midnight surprises.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {CAKE_OCCASIONS.map((occ) => (
              <div
                key={occ.id}
                onClick={() => {
                  setActiveCategory(occ.categoryTab);
                  const el = document.getElementById("catalog-grid");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="group relative bg-[#fdf9f7] rounded-2xl overflow-hidden border border-zinc-200/80 hover:border-rose-300 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Visual Image - 100% Clean */}
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
                  <Image
                    src={occ.image}
                    alt={occ.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Card Title & Subtitle */}
                <div className="p-3 text-center bg-white border-t border-zinc-100">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-[#c8102e] transition-colors line-clamp-1">
                    {occ.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    {occ.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Category Sub-Pills */}
        <div id="catalog-grid" className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-8">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {CAKE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#c8102e] text-white shadow-xs font-bold"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {cat.count}
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
                Showing {filteredAndSortedProducts.length} Fresh Cakes
              </span>

              {/* Quick filter chips */}
              <button
                type="button"
                onClick={() => setOnly90Min(!only90Min)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  only90Min
                    ? "bg-purple-100 border-purple-300 text-purple-900 font-bold"
                    : "bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400"
                }`}
              >
                ⚡ 90-Min Delivery Only
              </button>

              <button
                type="button"
                onClick={() => setOnlyUnder600(!onlyUnder600)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  onlyUnder600
                    ? "bg-rose-100 border-rose-300 text-rose-900 font-bold"
                    : "bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400"
                }`}
              >
                💰 Under ₹599
              </button>

              {(only90Min || onlyUnder600 || activeCategory !== "all") && (
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
                htmlFor="sort-select"
                className="text-xs text-zinc-600 font-medium whitespace-nowrap"
              >
                Sort By:
              </label>
              <select
                id="sort-select"
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
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 my-4">
              <p className="text-zinc-600 font-medium">
                No cakes match your active filter criteria.
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
              {filteredAndSortedProducts.map((cake) => (
                <ProductCard key={cake.id} product={cake} />
              ))}
            </div>
          )}
        </div>

        {/* Kolkata Delivery Hub & Assurance Section */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-10 mt-6 border-t border-zinc-200">
          <div className="bg-gradient-to-br from-zinc-50 to-rose-50/40 rounded-2xl p-6 sm:p-8 border border-zinc-200/80">
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-2">
              Fresh Cake Delivery Across All Major Kolkata Hubs
            </h2>
            <p className="text-sm text-zinc-600 mb-6 max-w-3xl">
              We bake and dispatch directly from our local kitchen at Chingrighata, ensuring maximum freshness, no melting during transit, and timely 90-minute or midnight deliveries.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-semibold text-zinc-800">
              {[
                "Salt Lake (Sec 1 to 5)",
                "New Town & Action Area",
                "Chingrighata Hub (45 Min)",
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
                  <span className="text-[#c8102e]">📍</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs Accordion (IGP Style Trust Building) */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-8 pb-16">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-4">
            Frequently Asked Questions about Cake Delivery in Kolkata
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

export default function CakesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CakesContent />
    </Suspense>
  );
}
