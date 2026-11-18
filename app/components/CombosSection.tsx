"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGroupCatalog } from "../lib/useGroupCatalog";
import ProductCard from "./ProductCard";

export default function CombosSection() {
  const { products: allProducts, categories, loading } = useGroupCatalog("Combos", "combos");
  const [activeTab, setActiveTab] = useState("all");
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);

  const filteredProducts =
    activeTab === "all"
      ? allProducts
      : allProducts.filter((item) => item.category === activeTab);

  // Check scroll boundary
  function updateScrollButtons() {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }

  // Smooth slide by 1 step (responsive card width + gap)
  function scrollSlide(direction: "left" | "right") {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const card = container.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : 300;

    if (direction === "left") {
      if (container.scrollLeft <= 10) {
        container.scrollTo({
          left: container.scrollWidth - container.clientWidth,
          behavior: "smooth",
        });
      } else {
        container.scrollBy({ left: -step, behavior: "smooth" });
      }
    } else {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 15) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: step, behavior: "smooth" });
      }
    }
  }

  // Auto-rotate slider every 3.5 seconds when not paused
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      if (!sliderRef.current) return;
      const container = sliderRef.current;
      const card = container.firstElementChild as HTMLElement | null;
      const step = card ? card.offsetWidth + 16 : 300;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 15) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, filteredProducts.length]);

  if (!loading && allProducts.length === 0) return null;

  return (
    <section
      id="combos"
      className="max-w-[1680px] mx-auto px-3 sm:px-8 2xl:px-12 py-8 sm:py-12 w-full"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c8102e]" />
            <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-[#c8102e]">
              Double The Surprise • Combined 90-Min Dispatch
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Curated Flower + Cake Combos
          </h2>
          <p className="text-sm 2xl:text-base text-zinc-600 font-medium mt-1">
            Handcrafted fresh bouquets &amp; celebration cakes delivered together across Kolkata in one single slot.
          </p>
        </div>

        {/* View All & Top-Right Header Arrows (Clean & Unobstructed) */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Link
            href="/combos"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#c8102e] hover:text-[#9b0b22] bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-full transition-colors"
          >
            <span>View All Combos</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          {/* Slider Prev & Next Arrows (Header Top-Right - Zero overlap on cards) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollSlide("left")}
              aria-label="Previous combos"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-[#c8102e] text-zinc-700 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <svg
                className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollSlide("right")}
              aria-label="Next combos"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-[#c8102e] text-zinc-700 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <svg
                className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide text-xs font-semibold">
        {categories.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (sliderRef.current) {
                  sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
                }
              }}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#c8102e] text-white shadow-xs font-bold"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Auto-Rotating Slider Container: Exactly 4 Cards on Desktop/Laptop, Exactly 2 Cards on Mobile */}
      <div
        className="relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          ref={sliderRef}
          onScroll={updateScrollButtons}
          className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2 pt-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="shrink-0 snap-start w-[calc(50%-6px)] sm:w-[calc(50%-8px)] lg:w-[calc(25%-15px)]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
