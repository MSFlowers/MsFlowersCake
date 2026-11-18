"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface CategoryItem {
  label: string;
  mobileLine1?: string;
  mobileLine2?: string;
  href: string;
  imageSrc: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    label: "Same Day Delivery",
    mobileLine1: "Same Day",
    mobileLine2: "Delivery",
    href: "/same-day",
    imageSrc: "/categories/same-day-delivery.jpg",
  },
  {
    label: "Cakes",
    href: "/cakes",
    imageSrc: "/categories/cakes-truffle.jpg",
  },
  {
    label: "Flowers",
    href: "/flowers",
    imageSrc: "/categories/flowers-bouquet.jpg",
  },
  {
    label: "Combos",
    href: "/combos",
    imageSrc: "/categories/combos-duo.jpg",
  },
  {
    label: "Birthday",
    href: "/cakes",
    imageSrc: "/categories/birthday-cake.jpg",
  },
  {
    label: "Anniversary",
    href: "/combos",
    imageSrc: "/categories/anniversary-heart.jpg",
  },
  {
    label: "Midnight Delivery",
    mobileLine1: "Midnight",
    mobileLine2: "Delivery",
    href: "/midnight",
    imageSrc: "/categories/midnight-delivery.jpg",
  },
];

const VISIBLE_SLOTS = 7;

export default function CategoryStrip() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [desktopOffset, setDesktopOffset] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadStripCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const json = await res.json();
          if (json.categories && json.categories.length > 0 && isMounted) {
            const stripItems = json.categories
              .filter((c: any) => c.group_name === "homepage_strip" && c.is_active)
              .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

            if (stripItems.length > 0) {
              const mapped: CategoryItem[] = stripItems.map((c: any) => {
                const parts = c.banner_image_url ? c.banner_image_url.split("|") : [];
                return {
                  label: c.name,
                  mobileLine1: parts[0] || (c.name.includes(" ") ? c.name.split(" ")[0] : undefined),
                  mobileLine2: parts[1] || (c.name.includes(" ") ? c.name.split(" ").slice(1).join(" ") : undefined),
                  href: c.subtitle || `/${c.slug.replace("strip-", "")}`,
                  imageSrc: c.image_url || "/categories/same-day-delivery.jpg",
                };
              });
              setCategories(mapped);
            }
          }
        }
      } catch {
        // Fallback to default categories
      }
    }
    loadStripCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const maxOffset = Math.max(0, categories.length - VISIBLE_SLOTS);
  const clampedOffset = Math.min(desktopOffset, maxOffset);
  const canGoLeft = clampedOffset > 0;
  const canGoRight = clampedOffset < maxOffset;
  const showDesktopChevrons = categories.length > VISIBLE_SLOTS;
  const slotCount = Math.min(VISIBLE_SLOTS, Math.max(1, categories.length));

  return (
    <section
      aria-label="Flowers and cakes categories"
      className="max-w-[1680px] mx-auto px-1 sm:px-8 2xl:px-12 pt-2.5 sm:pt-4 pb-1 sm:pb-2 w-full"
    >
      {/* MOBILE: Native Touch Swipe Strip */}
      <div className="sm:hidden py-1.5 flex items-stretch overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
        {categories.map((category) => (
          <a
            key={category.label}
            href={category.href}
            className="w-1/4 shrink-0 snap-start flex flex-col items-center justify-start gap-1.5 py-1 group transition-colors text-center"
          >
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-rose-100/90 shadow-2xs bg-white p-1.5 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={category.imageSrc}
                  alt={category.label}
                  fill
                  sizes="56px"
                  className="object-contain object-center"
                />
              </div>
            </div>
            <div className="text-[11px] font-semibold text-zinc-800 group-hover:text-[#c8102e] text-center leading-tight tracking-tight px-0.5">
              {category.mobileLine1 ? (
                <>
                  <span className="block">{category.mobileLine1}</span>
                  <span className="block text-[10px] text-zinc-500 font-medium">{category.mobileLine2}</span>
                </>
              ) : (
                <span className="block">{category.label}</span>
              )}
            </div>
          </a>
        ))}
      </div>

      {/* DESKTOP: Non-Overlapping 7-Slot Slider with Dedicated Side Chevrons */}
      <div className="hidden sm:flex items-center bg-white border border-zinc-200/90 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] py-3.5 2xl:py-4 px-2 2xl:px-3 gap-1">
        {showDesktopChevrons && (
          <button
            type="button"
            disabled={!canGoLeft}
            onClick={() => setDesktopOffset((prev) => Math.max(0, Math.min(prev, maxOffset) - 1))}
            aria-label="Previous category"
            className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
              canGoLeft
                ? "bg-white border-zinc-200 shadow-sm text-zinc-700 hover:text-[#c8102e] hover:border-[#c8102e] hover:scale-105 cursor-pointer"
                : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        <div className="flex-1 overflow-hidden">
          <div
            style={{
              transform: `translateX(-${clampedOffset * (100 / slotCount)}%)`,
            }}
            className="flex items-stretch transition-transform duration-300 ease-out divide-x divide-zinc-200/70"
          >
            {categories.map((category) => (
              <a
                key={category.label}
                href={category.href}
                style={{ width: `${100 / slotCount}%` }}
                className="shrink-0 flex flex-col items-center justify-start gap-2 px-2.5 py-2 group transition-colors text-center"
              >
                <div className="relative w-16 h-16 2xl:w-18 2xl:h-18 rounded-full overflow-hidden border-2 border-rose-100/90 shadow-2xs group-hover:scale-108 group-hover:border-[#c8102e] group-hover:shadow-md transition-all duration-300 bg-white p-2 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={category.imageSrc}
                      alt={category.label}
                      fill
                      sizes="72px"
                      className="object-contain object-center group-hover:scale-108 transition-transform duration-300"
                    />
                  </div>
                </div>
                <span className="text-xs sm:text-[13px] 2xl:text-sm font-semibold text-zinc-800 group-hover:text-[#c8102e] text-center whitespace-nowrap transition-colors tracking-tight">
                  {category.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {showDesktopChevrons && (
          <button
            type="button"
            disabled={!canGoRight}
            onClick={() => setDesktopOffset((prev) => Math.min(maxOffset, Math.min(prev, maxOffset) + 1))}
            aria-label="Next category"
            className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
              canGoRight
                ? "bg-white border-zinc-200 shadow-sm text-zinc-700 hover:text-[#c8102e] hover:border-[#c8102e] hover:scale-105 cursor-pointer"
                : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
