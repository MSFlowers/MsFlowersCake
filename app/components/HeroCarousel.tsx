"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface HeroSlide {
  id: string;
  headline: string;
  headlineColor: string;
  subtitle: string;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  desktopImageSrc: string;
  mobileImageSrc: string;
  cardBg: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "anniversary",
    headline: "Anniversary Flowers & Cakes",
    headlineColor: "text-[#b91c1c]",
    subtitle: "for every love story",
    ctaLabel: "SHOP NOW",
    ctaHref: "#combos",
    desktopImageSrc: "/banners/anniversary-desktop.jpg",
    mobileImageSrc: "/banners/anniversary-mobile.jpg",
    cardBg: "bg-linear-to-b from-[#f5e4d7] via-[#f7e9df] to-[#fbf2ec]",
  },
  {
    id: "cakes",
    headline: "Sweeten Every",
    headlineColor: "text-[#4c1d95]",
    subtitle: "Celebration",
    ctaLabel: "ORDER CAKES",
    ctaHref: "#cakes",
    desktopImageSrc: "/banners/cakes-desktop.jpg",
    mobileImageSrc: "/banners/cakes-mobile.jpg",
    cardBg: "bg-linear-to-b from-[#f1d6bf] via-[#f3dbc6] to-[#f4e0ce]",
  },
  {
    id: "birthday",
    headline: "Birthday",
    headlineColor: "text-[#e11d48]",
    subtitle: "Party Essentials",
    ctaLabel: "EXPLORE ALL",
    ctaHref: "#birthday",
    desktopImageSrc: "/banners/birthday-desktop.jpg",
    mobileImageSrc: "/banners/birthday-mobile.jpg",
    cardBg: "bg-linear-to-b from-[#fbdadd] via-[#fce4e6] to-[#fdf1f2]",
  },
];

const SLIDE_COUNT = HERO_SLIDES.length;
const EXTENDED_SLIDES = [...HERO_SLIDES, ...HERO_SLIDES, ...HERO_SLIDES];

export default function HeroCarousel() {
  const [trackIndex, setTrackIndex] = useState(SLIDE_COUNT);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const activeIndex = ((trackIndex % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(true);
      setTrackIndex((prev) =>
        prev >= SLIDE_COUNT * 2 + 1 ? SLIDE_COUNT + (prev % SLIDE_COUNT) + 1 : prev + 1
      );
    }, 5500);
    return () => clearTimeout(timer);
  }, [trackIndex]);

  function handlePrev() {
    setIsTransitioning(true);
    setTrackIndex((prev) =>
      prev <= 0 ? SLIDE_COUNT + (((prev % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT) - 1 : prev - 1
    );
  }

  function handleNext() {
    setIsTransitioning(true);
    setTrackIndex((prev) =>
      prev >= SLIDE_COUNT * 2 + 1 ? SLIDE_COUNT + (prev % SLIDE_COUNT) + 1 : prev + 1
    );
  }

  function handleSelectDot(index: number) {
    setIsTransitioning(true);
    setTrackIndex(SLIDE_COUNT + index);
  }

  function handleTrackTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (trackIndex >= SLIDE_COUNT * 2 || trackIndex < SLIDE_COUNT) {
      const normalized = SLIDE_COUNT + (((trackIndex % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
      setIsTransitioning(false);
      setTrackIndex(normalized);
    }
  }

  function renderSlideCard(slide: HeroSlide, idx: number) {
    const isMain = idx === trackIndex;

    return (
      <div
        key={`${slide.id}-${idx}`}
        onClick={isMain ? undefined : handleNext}
        role={isMain ? undefined : "button"}
        tabIndex={isMain ? undefined : 0}
        aria-label={isMain ? undefined : `Next slide: ${slide.headline}`}
        onKeyDown={
          isMain
            ? undefined
            : (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNext();
                }
              }
        }
        className={`relative w-full lg:w-[68%] 2xl:w-[70%] shrink-0 aspect-9/16 sm:aspect-auto sm:h-[360px] lg:h-[400px] 2xl:h-[460px] rounded-2xl overflow-hidden border border-rose-100/70 shadow-xs ${slide.cardBg} ${
          isMain ? "" : "cursor-pointer"
        }`}
      >
        {/* Mobile 9:16 Uncropped Image */}
        <Image
          src={slide.mobileImageSrc}
          alt={`${slide.headline} ${slide.subtitle}`}
          fill
          sizes="(max-width: 639px) 100vw, 1px"
          className="object-contain sm:hidden"
          priority={idx >= SLIDE_COUNT && idx < SLIDE_COUNT * 2}
        />

        {/* Desktop Ambient Backdrop + 16:9 Uncropped Right-Aligned Image */}
        <Image
          src={slide.desktopImageSrc}
          alt=""
          fill
          sizes="(min-width: 1024px) 68vw, 100vw"
          className="hidden sm:block object-cover object-left blur-lg scale-105 pointer-events-none"
          aria-hidden="true"
        />
        <div className="hidden sm:block absolute top-0 bottom-0 right-0 h-full aspect-16/9 [mask-image:linear-gradient(to_right,transparent_0%,black_18%,black_100%)]">
          <Image
            src={slide.desktopImageSrc}
            alt={`${slide.headline} ${slide.subtitle}`}
            fill
            sizes="(min-width: 1024px) 68vw, 100vw"
            className="object-contain object-right"
            priority={idx >= SLIDE_COUNT && idx < SLIDE_COUNT * 2}
          />
        </div>

        {/* Copy Overlay */}
        <div className="relative z-20 h-full flex flex-col justify-start pt-7 px-6 text-center items-center sm:justify-center sm:items-start sm:text-left sm:pt-0 sm:px-10 2xl:px-14 sm:pb-0 sm:max-w-[44%] 2xl:max-w-[42%]">
          {slide.badge && (
            <span className="inline-flex items-center justify-center w-fit mb-2.5 px-3 py-1 rounded-full bg-amber-300 text-zinc-950 text-[10px] sm:text-xs 2xl:text-sm font-extrabold tracking-wide uppercase shadow-xs">
              {slide.badge}
            </span>
          )}
          {isMain ? (
            <h1
              className={`text-2xl sm:text-3xl md:text-[34px] 2xl:text-[40px] font-extrabold leading-tight tracking-tight ${slide.headlineColor}`}
            >
              {slide.headline}
            </h1>
          ) : (
            <p
              className={`text-2xl sm:text-3xl md:text-[34px] 2xl:text-[40px] font-extrabold leading-tight tracking-tight ${slide.headlineColor}`}
            >
              {slide.headline}
            </p>
          )}
          <p className="text-lg sm:text-2xl 2xl:text-[26px] font-medium text-zinc-900 mt-1 2xl:mt-2">
            {slide.subtitle}
          </p>
          <a
            href={slide.ctaHref}
            onClick={(e) => {
              if (!isMain) e.stopPropagation();
            }}
            className="mt-4 2xl:mt-6 bg-[#f43f5e] hover:bg-[#e11d48] text-white text-xs 2xl:text-sm font-bold px-5 2xl:px-7 py-2 2xl:py-2.5 rounded-full transition-colors uppercase tracking-wider shadow-xs"
          >
            {slide.ctaLabel}
          </a>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label="Featured Flowers and Cakes Offers"
      className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-3 pb-6 w-full"
    >
      {/* IGP-Style Infinite Conveyor Peek Hero Carousel */}
      <div className="relative group">
        <div className="overflow-hidden rounded-2xl [--slide-step:calc(100%+1rem)] lg:[--slide-step:calc(68%+1rem)] 2xl:[--slide-step:calc(70%+1.25rem)]">
          <div
            onTransitionEnd={handleTrackTransitionEnd}
            className={`flex gap-4 2xl:gap-5 w-full ${
              isTransitioning
                ? "transition-transform duration-650 ease-[cubic-bezier(0.25,1,0.5,1)]"
                : "transition-none"
            }`}
            style={{
              transform: `translate3d(calc(-1 * ${trackIndex} * var(--slide-step)), 0, 0)`,
            }}
          >
            {EXTENDED_SLIDES.map((slide, idx) => renderSlideCard(slide, idx))}
          </div>
        </div>

        {/* Left & Right Hover-Only Frosted Glass Arrow Buttons */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous banner"
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/35 hover:bg-white/75 backdrop-blur-md border border-white/50 text-zinc-800 shadow-sm items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next banner"
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/35 hover:bg-white/75 backdrop-blur-md border border-white/50 text-zinc-800 shadow-sm items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => handleSelectDot(index)}
              aria-label={`Show slide ${index + 1}`}
              aria-current={isActive ? "true" : undefined}
              className={
                isActive
                  ? "w-6 h-2 rounded-full bg-zinc-500 transition-all cursor-pointer"
                  : "w-2 h-2 rounded-full bg-zinc-300 hover:bg-zinc-400 transition-all cursor-pointer"
              }
            />
          );
        })}
      </div>

      {/* Our Promise Full-Width Floral Artistic Ribbon */}
        <div className="mt-4 2xl:mt-6">
          <div className="relative rounded-2xl overflow-hidden border border-rose-200/80 shadow-xs py-3.5 sm:py-4.5 2xl:py-5 px-5 sm:px-8 2xl:px-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center">
            {/* Floral Background Image */}
            <Image
              src="/backgrounds/promise-floral-bg.jpg"
              alt="MS Floral Promise"
              fill
              sizes="(min-width: 1680px) 1600px, 100vw"
              className="object-cover object-center pointer-events-none"
              priority
            />
            {/* Translucent veil for pristine text legibility */}
            <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px] pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
              <span className="text-rose-500 text-lg 2xl:text-xl hidden sm:inline drop-shadow-xs" aria-hidden="true">
                ✿
              </span>
              <p className="text-sm sm:text-lg 2xl:text-xl leading-snug">
                <span className="text-[#c8102e] font-black text-base sm:text-xl 2xl:text-2xl mr-2 tracking-tight drop-shadow-xs">
                  Our Promise!
                </span>
                <span className="text-zinc-900 font-extrabold tracking-tight">
                  You focus on the emotions, We take care of the execution!
                </span>
              </p>
              <span className="text-rose-500 text-lg 2xl:text-xl hidden sm:inline drop-shadow-xs" aria-hidden="true">
                ✿
              </span>
            </div>
          </div>
        </div>
      </section>
  );
}
