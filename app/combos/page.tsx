"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import type { CategoryTab, Product } from "../data/types";
import {
  DEFAULT_PAGE_CONFIGS,
  formatDbProduct,
  getPageConfigFromCategories,
} from "../lib/db";

const SORT_OPTIONS = [
  { id: "popularity", label: "Popularity (Bestsellers)" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Customer Rating (Highest)" },
];

interface OccasionCardItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  categoryTab: string;
}

const FAQS = [
  {
    q: "Will the flowers and cake arrive together at the same time in Kolkata?",
    a: "Yes! Because our central kitchen and florist studio are under one roof at Chingrighata, Salt Lake, your bouquet and cake are packed and dispatched together with the same delivery rider in one single slot.",
  },
  {
    q: "Can I customize the cake flavor or flower colors in a combo?",
    a: "Absolutely! You can choose between Chocolate Truffle, Black Forest, Red Velvet, or Butterscotch, and specify flower preferences (red, pink, yellow roses) during checkout or via WhatsApp message.",
  },
  {
    q: "Do you include a free greeting card, candle, and knife?",
    a: "Yes, every combo comes complete with a personalized message card, complimentary celebration candle, and cake cutting knife at zero extra charge.",
  },
  {
    q: "Can I schedule 12:00 AM midnight delivery for combos in Kolkata?",
    a: "Yes, we specialize in midnight surprise deliveries across Salt Lake, New Town, Park Street, Ballygunge, Lake Town, and other Kolkata areas between 11:30 PM to 12:00 AM.",
  },
];

function CombosContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const priceParam = searchParams.get("price");
  const deliveryParam = searchParams.get("delivery");

  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");
  const [selectedSort, setSelectedSort] = useState("popularity");
  const [only90Min, setOnly90Min] = useState(deliveryParam === "90-min");
  const [onlyUnder1200, setOnlyUnder1200] = useState(priceParam === "under-1199");
  const [priceBand, setPriceBand] = useState<string | null>(
    priceParam === "above-1200" ? priceParam : null
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const [categoriesList, setCategoriesList] = useState<CategoryTab[]>([{ id: "all", label: "All Combos" }]);
  const [occasionsList, setOccasionsList] = useState<OccasionCardItem[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageConfig, setPageConfig] = useState(DEFAULT_PAGE_CONFIGS.combos);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?group=Combos"),
        ]);

        if (catRes.ok && isMounted) {
          const json = await catRes.json();
          if (json.categories && json.categories.length > 0) {
            const comboParent = json.categories.find(
              (c: any) => c.slug === "combos" && !c.parent_id
            );
            if (comboParent) {
              const comboSubs = json.categories.filter(
                (c: any) =>
                  c.parent_id === comboParent.id &&
                  c.is_active &&
                  !c.group_name?.startsWith("drawer:") &&
                  c.group_name !== "page_config"
              );
              if (comboSubs.length > 0) {
                setCategoriesList([
                  { id: "all", label: "All Combos", count: comboSubs.length },
                  ...comboSubs.map((s: any) => ({
                    id: s.slug,
                    label: s.name,
                    image: s.image_url || null,
                    badge: s.badge || null,
                  })),
                ]);
              }
            }

            const feat = json.categories.filter(
              (c: any) =>
                c.is_featured &&
                c.is_active &&
                c.group_name === "Combos Occasions"
            );
            if (feat.length > 0) {
              setOccasionsList(
                feat.map((f: any) => {
                  let tab = f.slug;
                  if (f.slug.includes("birthday") || f.slug.includes("orchid")) tab = "orchids-blackforest-combo";
                  else if (f.slug.includes("anniversary") || f.slug.includes("red-velvet")) tab = "red-velvet-roses-combo";
                  else if (f.slug.includes("midnight") || f.slug.includes("truffle")) tab = "roses-truffle-combo";
                  else if (f.slug.includes("luxury") || f.slug.includes("hamper")) tab = "luxury-fruit-hamper";

                  return {
                    id: f.slug,
                    title: f.name,
                    subtitle: f.subtitle || "",
                    tag: f.badge || "SPECIAL",
                    image: f.image_url || "/products/combos/roses-chocolate-combo.jpg",
                    categoryTab: tab,
                  };
                })
              );
            }

            const { config } = getPageConfigFromCategories(json.categories, "combos");
            setPageConfig(config);
          }
        }

        if (prodRes.ok && isMounted) {
          const prodJson = await prodRes.json();
          setProductsList((prodJson.products || []).map(formatDbProduct));
        }
      } catch {
        // network error: leave lists empty
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLiveData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with URL query parameter changes
  useEffect(() => {
    setActiveCategory(categoryParam || "all");
    setOnly90Min(deliveryParam === "90-min");
    if (priceParam === "under-1199") {
      setOnlyUnder1200(true);
      setPriceBand(null);
    } else if (priceParam === "above-1200") {
      setOnlyUnder1200(false);
      setPriceBand(priceParam);
    } else {
      setOnlyUnder1200(false);
      setPriceBand(null);
    }
  }, [categoryParam, priceParam, deliveryParam]);

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    const COMBO_SLUG_ALIAS: Record<string, string[]> = {
      "roses-truffle-combo": ["roses-cake"],
      "red-velvet-roses-combo": ["roses-cake"],
      "orchids-blackforest-combo": ["orchids-cake"],
      "luxury-fruit-hamper": ["luxury-hamper"],
    };

    let list = [...productsList];

    // Filter by subcategory
    if (activeCategory !== "all") {
      const aliases = COMBO_SLUG_ALIAS[activeCategory] || [];
      list = list.filter(
        (item) =>
          item.category === activeCategory || aliases.includes(item.category)
      );
    }

    // Filter by 90-min delivery
    if (only90Min) {
      list = list.filter((item) => item.deliveryTag === "90-Min Delivery");
    }

    // Filter by budget / price band
    if (onlyUnder1200) {
      list = list.filter((item) => item.price <= 1199);
    } else if (priceBand === "above-1200") {
      list = list.filter((item) => item.price >= 1200);
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
  }, [productsList, activeCategory, selectedSort, only90Min, onlyUnder1200, priceBand]);

  function resetFilters() {
    setActiveCategory("all");
    setSelectedSort("popularity");
    setOnly90Min(false);
    setOnlyUnder1200(false);
    setPriceBand(null);
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
            <span className="text-zinc-900 font-semibold">Combos</span>
            {activeCategory !== "all" && (
              <>
                <span>/</span>
                <span className="text-[#c8102e] font-semibold capitalize">
                  {categoriesList.find((c) => c.id === activeCategory)?.label || activeCategory}
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
                {pageConfig.heroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 font-medium mt-1.5 leading-relaxed">
                {pageConfig.heroDescription}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3.5">
                {pageConfig.promoPill && (
                  <span className="text-xs font-bold bg-white text-rose-950 px-3 py-1.5 rounded-full shadow-xs">
                    {pageConfig.promoPill}
                  </span>
                )}
                {pageConfig.deliveryNote && (
                  <span className="text-xs font-semibold text-rose-100">
                    {pageConfig.deliveryNote}
                  </span>
                )}
              </div>
            </div>

            {/* Right Trust Badges */}
            <div className="z-10 flex md:flex-col gap-2 shrink-0 self-start md:self-center">
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-left">
                <p className="text-[10px] uppercase font-bold text-rose-200">{pageConfig.badge1Label}</p>
                <p className="text-xs font-bold text-white">{pageConfig.badge1Value}</p>
              </div>
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-left">
                <p className="text-[10px] uppercase font-bold text-rose-200">{pageConfig.badge2Label}</p>
                <p className="text-xs font-bold text-white">{pageConfig.badge2Value}</p>
              </div>
            </div>

            {/* Background Decorative Blur */}
            <div className="absolute right-0 top-0 -bottom-10 w-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>

        {/* Occasions Visual Grid (Clean Photos) */}
        <div hidden={occasionsList.length === 0} className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-8 sm:pt-10">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {pageConfig.occasionHeading}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
              {pageConfig.occasionSubheading}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {occasionsList.map((occ) => (
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

        {/* Visual Category Photo-Pills */}
        <div id="catalog-grid" className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-8">
          <div className="flex sm:flex-wrap items-center gap-2 sm:gap-2.5 overflow-x-auto sm:overflow-visible pb-3 sm:pb-1 scrollbar-hide">
            {categoriesList.map((cat) => {
              const isActive = activeCategory === cat.id;
              const hasThumb = cat.id !== "all" && Boolean(cat.image);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`${
                    hasThumb ? "pl-1.5 pr-3.5 py-1.5" : "px-4 py-2"
                  } rounded-full text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border shrink-0 ${
                    isActive
                      ? "bg-[#c8102e] text-white border-[#c8102e] shadow-sm font-bold"
                      : "bg-white hover:bg-rose-50/70 text-zinc-800 border-zinc-200/90 hover:border-rose-300 shadow-2xs"
                  }`}
                >
                  {hasThumb && (
                    <span
                      className={`relative w-7 h-7 rounded-full overflow-hidden shrink-0 border ${
                        isActive ? "border-white/60 bg-white" : "border-rose-100 bg-rose-50"
                      }`}
                    >
                      <img
                        src={cat.image!}
                        alt={cat.label}
                        className="w-full h-full object-cover"
                      />
                    </span>
                  )}
                  <span>{cat.label}</span>
                  {cat.id === "all" && typeof cat.count === "number" && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {cat.count}
                    </span>
                  )}
                  {cat.id !== "all" && cat.badge && (
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-tight ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {cat.badge}
                    </span>
                  )}
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
                Showing {filteredAndSortedProducts.length} Curated Combos
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
                onClick={() => setOnlyUnder1200(!onlyUnder1200)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  onlyUnder1200
                    ? "bg-rose-100 border-rose-300 text-rose-900 font-bold"
                    : "bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400"
                }`}
              >
                💰 Under ₹1,199
              </button>

              {(only90Min || onlyUnder1200 || activeCategory !== "all") && (
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
                htmlFor="combo-sort-select"
                className="text-xs text-zinc-600 font-medium whitespace-nowrap"
              >
                Sort By:
              </label>
              <select
                id="combo-sort-select"
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
            <div className="text-center py-16 text-sm text-zinc-500 font-medium">Loading combos…</div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 my-4">
              <p className="text-zinc-600 font-medium">
                No celebration combos match your active filter criteria.
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
              {filteredAndSortedProducts.map((combo) => (
                <ProductCard key={combo.id} product={combo} />
              ))}
            </div>
          )}
        </div>

        {/* Kolkata Delivery Hub & Assurance Section */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-10 mt-6 border-t border-zinc-200">
          <div className="bg-gradient-to-br from-zinc-50 to-amber-50/40 rounded-2xl p-6 sm:p-8 border border-zinc-200/80">
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-2">
              Combined Fast Dispatch Across All Major Kolkata Hubs
            </h2>
            <p className="text-sm text-zinc-600 mb-6 max-w-3xl">
              Flowers and cakes are arranged side-by-side at our Chingrighata central florist hub, guaranteeing that both items reach together fresh, intact, and right on time.
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
            {pageConfig.faqHeading}
          </h2>

          <div className="space-y-3">
            {pageConfig.faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div
                  key={`${index}-${faq.q}`}
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

export default function CombosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CombosContent />
    </Suspense>
  );
}
