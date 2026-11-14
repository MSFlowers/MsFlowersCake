"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { FLOWER_CATEGORIES, FLOWER_PRODUCTS } from "../data/flowers";

const SORT_OPTIONS = [
  { id: "popularity", label: "Popularity (Bestsellers)" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Customer Rating (Highest)" },
];

const FLOWER_OCCASIONS = [
  {
    id: "birthday",
    title: "Birthday Blooms",
    subtitle: "Pastel Lilies & Mixed Roses",
    tag: "POPULAR",
    image: "/products/flowers/white-lilies-carnations.jpg",
    categoryTab: "lilies",
  },
  {
    id: "romance",
    title: "Proposal & Romance",
    subtitle: "Classic Dutch Red Roses",
    tag: "BESTSELLER",
    image: "/products/flowers/red-roses-bouquet.jpg",
    categoryTab: "roses",
  },
  {
    id: "anniversary",
    title: "Anniversary Elegance",
    subtitle: "Signature Velvet Rose Box",
    tag: "LUXURY PICK",
    image: "/products/flowers/luxury-roses-box.jpg",
    categoryTab: "boxes",
  },
  {
    id: "wishes",
    title: "Congratulations & Wishes",
    subtitle: "Exotic Purple Orchids in Vase",
    tag: "FRESH TODAY",
    image: "/products/flowers/purple-orchids-vase.jpg",
    categoryTab: "orchids",
  },
];

const FAQS = [
  {
    q: "How fresh will the flowers be upon delivery in Kolkata?",
    a: "We procure fresh farm-cut blooms every morning directly at our Chingrighata florist hub. Every bouquet is hand-tied with moisture wrap at the stems just before dispatch so the flowers arrive crisp, fragrant, and vibrant.",
  },
  {
    q: "Can I get midnight flower delivery at 12:00 AM in Kolkata?",
    a: "Yes! We specialize in 12 AM midnight surprise flower deliveries across Kolkata including Salt Lake, New Town, Park Street, Ballygunge, Lake Town, Behala, and surrounding areas. Our riders deliver between 11:30 PM to 12:00 AM.",
  },
  {
    q: "Do you include a personalized greeting card with the flowers?",
    a: "Yes, every bouquet comes with a complimentary personalized message card. You can write your custom message during checkout or share it on WhatsApp, and our florists will handwrite or print it neatly.",
  },
  {
    q: "Can I order flowers and cake together for simultaneous delivery?",
    a: "Absolutely! We bake fresh celebration cakes and handcraft flower bouquets under one roof at our Chingrighata hub, so both your cake and flowers will arrive together in the same delivery slot without separate shipping charges.",
  },
];

function FlowersContent() {
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
    let list = [...FLOWER_PRODUCTS];

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
            <span className="text-zinc-900 font-semibold">Flowers</span>
            {activeCategory !== "all" && (
              <>
                <span>/</span>
                <span className="text-[#c8102e] font-semibold capitalize">
                  {FLOWER_CATEGORIES.find((c) => c.id === activeCategory)?.label || activeCategory}
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
                Farm-Fresh Flowers Handpicked Daily
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 font-medium mt-1.5 leading-relaxed">
                Dispatched from our Chingrighata hub within 45–90 minutes. 100% bloom freshness guaranteed with complimentary greeting card.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3.5">
                <span className="text-xs font-bold bg-white text-rose-950 px-3 py-1.5 rounded-full shadow-xs">
                  Use Code: FRESH15
                </span>
                <span className="text-xs font-semibold text-rose-100">
                  ⚡ 90-Min Express Across Kolkata
                </span>
              </div>
            </div>

            {/* Right Trust Badges */}
            <div className="z-10 flex md:flex-col gap-2 shrink-0 self-start md:self-center">
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-left">
                <p className="text-[10px] uppercase font-bold text-rose-200">Express Delivery</p>
                <p className="text-xs font-bold text-white">45–90 Mins Hub Slot</p>
              </div>
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-left">
                <p className="text-[10px] uppercase font-bold text-rose-200">Surprise Timings</p>
                <p className="text-xs font-bold text-white">12 AM Midnight Available</p>
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
              Timeless Flowers For Every Occasion
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
              Curated fresh flower arrangements styled for life&apos;s most meaningful celebrations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {FLOWER_OCCASIONS.map((occ) => (
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
            {FLOWER_CATEGORIES.map((cat) => {
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
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-y-2.5 gap-x-2 sm:gap-x-3">
            {/* Top-Left on Mobile / Left on Desktop: Product Count */}
            <span className="order-1 text-xs sm:text-sm font-bold text-zinc-900 whitespace-nowrap">
              <span className="hidden sm:inline">Showing </span>
              {filteredAndSortedProducts.length} Fresh Flowers
            </span>

            {/* Bottom Row on Mobile / Center-Left on Desktop: Quick Filter Chips */}
            <div className="order-3 md:order-2 w-full md:w-auto flex flex-wrap items-center gap-2 pt-2.5 md:pt-0 border-t border-zinc-200/80 md:border-t-0 md:mr-auto md:ml-2">
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
                  className="text-xs text-[#c8102e] hover:underline font-semibold ml-auto md:ml-1 cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Top-Right on Mobile / Right on Desktop: Sort By Dropdown */}
            <div className="order-2 md:order-3 flex items-center gap-1.5 sm:gap-2">
              <label
                htmlFor="flower-sort-select"
                className="text-[11px] sm:text-xs text-zinc-500 font-medium whitespace-nowrap"
              >
                Sort<span className="hidden sm:inline"> By</span>:
              </label>
              <select
                id="flower-sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="text-xs font-semibold bg-white border border-zinc-300 rounded-lg px-2.5 sm:px-3 py-1.5 text-zinc-800 focus:outline-hidden focus:border-[#c8102e] cursor-pointer"
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
                No bouquets match your active filter criteria.
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
              {filteredAndSortedProducts.map((flower) => (
                <ProductCard key={flower.id} product={flower} />
              ))}
            </div>
          )}
        </div>

        {/* Kolkata Delivery Hub & Assurance Section */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-10 mt-6 border-t border-zinc-200">
          <div className="bg-gradient-to-br from-zinc-50 to-pink-50/40 rounded-2xl p-6 sm:p-8 border border-zinc-200/80">
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-2">
              Fresh Flower Delivery Across All Major Kolkata Hubs
            </h2>
            <p className="text-sm text-zinc-600 mb-6 max-w-3xl">
              We arrange and dispatch directly from our florist workshop at Chingrighata, ensuring guaranteed freshness, vibrant petals, and punctual 90-minute or midnight deliveries across Kolkata.
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
            Frequently Asked Questions about Flower Delivery in Kolkata
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

export default function FlowersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <FlowersContent />
    </Suspense>
  );
}
