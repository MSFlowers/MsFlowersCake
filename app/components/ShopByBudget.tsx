"use client";

import Image from "next/image";
import { SparklesIcon } from "./StorefrontIcons";

interface BudgetTier {
  id: string;
  label: string;
  tag: string;
  targetId: string;
}

const BUDGET_TIERS: BudgetTier[] = [
  {
    id: "tier-499",
    label: "UNDER ₹499",
    tag: "Pocket Friendly",
    targetId: "flowers",
  },
  {
    id: "tier-899",
    label: "UNDER ₹899",
    tag: "Fresh Blooms",
    targetId: "flowers",
  },
  {
    id: "tier-1299",
    label: "UNDER ₹1299",
    tag: "Celebration Cakes",
    targetId: "cakes",
  },
  {
    id: "tier-1999",
    label: "UNDER ₹1999",
    tag: "Signature Combos",
    targetId: "combos",
  },
];

export default function ShopByBudget() {
  function handleScrollTo(targetId: string) {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section
      aria-label="Shop Flowers and Cakes by Budget"
      className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 my-8 sm:my-12 2xl:my-14 w-full"
    >
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-sky-100 min-h-[180px] sm:min-h-[220px] 2xl:min-h-[240px] flex flex-col justify-center items-center py-7 px-4 sm:px-10">
        {/* Background Image: Crisp Sunny Blue Sky with Clouds, Floating Hearts & Gift Box */}
        <Image
          src="/backgrounds/budget-sky-bg.jpg"
          alt="Shop by Budget Sky Background"
          fill
          sizes="(min-width: 1680px) 1600px, 100vw"
          className="object-cover object-center pointer-events-none"
          priority
        />

        {/* Content Container */}
        <div className="relative z-10 w-full flex flex-col items-center">
          {/* Subtle Heading */}
          <div className="mb-4 sm:mb-5 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] sm:text-xs font-black tracking-widest uppercase text-[#c8102e] shadow-2xs">
              <SparklesIcon className="w-3.5 h-3.5 text-[#c8102e]" />
              <span>Best Kolkata Deals</span>
            </span>
            <h2 className="text-xl sm:text-2xl 2xl:text-3xl font-black text-zinc-900 tracking-tight drop-shadow-xs mt-1">
              Shop by Budget
            </h2>
          </div>

          {/* Clean Budget Cards */}
          <div className="w-full flex items-center justify-start sm:justify-center gap-3 sm:gap-4 lg:gap-6 overflow-x-auto no-scrollbar py-2 px-1">
            {BUDGET_TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleScrollTo(tier.targetId)}
                className="relative shrink-0 group cursor-pointer transition-all duration-200 bg-white/95 hover:bg-white text-zinc-900 rounded-xl sm:rounded-2xl px-5 sm:px-6 2xl:px-7 py-3 sm:py-3.5 flex items-center gap-3 sm:gap-4 shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-95 border border-zinc-200/80 backdrop-blur-xs"
              >
                <div className="text-left">
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    {tier.tag}
                  </span>
                  <span className="block text-sm sm:text-base 2xl:text-lg font-black tracking-tight leading-tight text-zinc-900">
                    {tier.label}
                  </span>
                </div>

                {/* Red Arrow */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 text-[#c8102e] flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:bg-[#c8102e] group-hover:text-white">
                  <svg
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.6}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
