"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface TrustPillar {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  alt: string;
}

const TRUST_PILLARS: TrustPillar[] = [
  {
    id: "express",
    tag: "⚡ 90-Min Hub Dispatch",
    title: "Fastest Kolkata Delivery",
    subtitle: "Dispatched hot & fresh from our Salt Lake & Chingrighata hub with live WhatsApp tracking.",
    imageSrc: "/trust/express-delivery-kolkata.jpg",
    alt: "MS Flowers delivery courier with scooter and Victoria Memorial Kolkata in background",
  },
  {
    id: "fresh-blooms",
    tag: "🌸 100% Farm-Fresh Daily",
    title: "Handpicked Daily Blooms",
    subtitle: "Selected daily at dawn with dewdrops on petals — longer vase life guaranteed.",
    imageSrc: "/trust/farm-fresh-blooms.jpg",
    alt: "Master florist arranging fresh red Dutch roses and lilies with morning dewdrops",
  },
  {
    id: "freshly-baked",
    tag: "🎂 Oven-Fresh On Order",
    title: "Baked Fresh On Order",
    subtitle: "Artisanal sponge baked only after you order. 100% pure egg & eggless options available.",
    imageSrc: "/trust/freshly-baked-cakes.jpg",
    alt: "Artisan pastry chef piping rich chocolate cream on fresh chocolate truffle cake",
  },
  {
    id: "greeting-card",
    tag: "💌 Complimentary Gift",
    title: "Free Handwritten Card",
    subtitle: "Express your heart with our custom wax-sealed calligraphy message card tucked in.",
    imageSrc: "/trust/free-greeting-card.jpg",
    alt: "Aesthetic wax-sealed love letter card and red roses flatlay",
  },
];

export default function TrustFeatures() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-slide on mobile every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TRUST_PILLARS.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  function nextSlide() {
    setCurrentIndex((prev) => (prev + 1) % TRUST_PILLARS.length);
  }

  function prevSlide() {
    setCurrentIndex((prev) => (prev - 1 + TRUST_PILLARS.length) % TRUST_PILLARS.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    setIsPaused(false);
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide(); // Swiped left -> next
      } else {
        prevSlide(); // Swiped right -> prev
      }
    }
    touchStartX.current = null;
  }

  return (
    <section
      aria-label="Why choose MS Flowers & Cakes"
      className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-8 sm:py-16 w-full"
    >
      <div className="bg-linear-to-b from-[#fff6f4] via-[#fef8f6] to-[#fff3f0] border border-rose-100 rounded-3xl p-5 sm:p-10 2xl:p-12 shadow-xs">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <span className="inline-block text-[11px] font-black uppercase tracking-widest text-[#c8102e] bg-rose-100/90 border border-rose-200/80 px-3.5 py-1 rounded-full shadow-2xs">
            ✿ THE ART OF GIFTING
          </span>
          <h2 className="text-xl sm:text-3xl 2xl:text-4xl font-black text-zinc-900 mt-2 tracking-tight">
            Crafted with Love, <span className="text-[#c8102e]">Delivered with Care</span>
          </h2>
          <p className="text-xs sm:text-base text-zinc-600 mt-1 sm:mt-1.5 leading-relaxed">
            From dawn-fresh blooms to artisanal oven bakes, every celebration is handcrafted with love in Kolkata.
          </p>
        </div>

        {/* ================= MOBILE VIEW: 1-CARD AUTO-SLIDER ================= */}
        <div
          className="block sm:hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Card Carousel Track */}
          <div className="overflow-hidden rounded-2xl border border-rose-100/90 bg-white shadow-sm">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {TRUST_PILLARS.map((pillar) => (
                <div key={pillar.id} className="w-full shrink-0 flex flex-col">
                  {/* Photo with Perfect Fit - 1:1 Square (Never Cut Off) */}
                  <div
                    className="relative aspect-square w-full bg-rose-50 overflow-hidden"
                    style={{ position: "relative", aspectRatio: "1 / 1" }}
                  >
                    <Image
                      src={pillar.imageSrc}
                      alt={pillar.alt}
                      fill
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#c8102e] mb-1 block">
                        {pillar.tag}
                      </span>
                      <h3 className="text-base font-extrabold text-zinc-900 tracking-tight leading-snug">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-zinc-600 font-medium mt-1 leading-relaxed">
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Bar: Prev Button + Dots + Next Button */}
          <div className="flex items-center justify-between mt-3.5 px-1">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="w-7 h-7 rounded-full bg-white border border-rose-200 text-zinc-700 flex items-center justify-center shadow-2xs hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {TRUST_PILLARS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full h-1.5 cursor-pointer ${
                    currentIndex === idx
                      ? "w-6 bg-[#c8102e]"
                      : "w-2 bg-rose-200 hover:bg-rose-300"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="w-7 h-7 rounded-full bg-white border border-rose-200 text-zinc-700 flex items-center justify-center shadow-2xs hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* ================= DESKTOP / TABLET VIEW: 4-COLUMN LUXURY GRID ================= */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 2xl:gap-6">
          {TRUST_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="group bg-white rounded-3xl overflow-hidden border border-rose-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-rose-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              {/* Photorealistic Hero Image */}
              <div
                className="relative aspect-square w-full overflow-hidden bg-rose-50"
                style={{ position: "relative", aspectRatio: "1 / 1" }}
              >
                <Image
                  src={pillar.imageSrc}
                  alt={pillar.alt}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Text Info */}
              <div className="p-5 sm:p-5.5 2xl:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#c8102e] mb-1.5 block">
                    {pillar.tag}
                  </span>
                  <h3 className="text-base sm:text-lg 2xl:text-xl font-extrabold text-zinc-900 tracking-tight leading-snug group-hover:text-[#c8102e] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-700 font-medium mt-1.5 leading-relaxed">
                    {pillar.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
