import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { SparklesIcon } from "../components/StorefrontIcons";

export const metadata: Metadata = {
  title: "About Us | MS Flowers & Cake — Fresh Blooms & Cakes in Kolkata",
  description:
    "Discover the story, mission, and vision of MS Flowers & Cake — Kolkata's trusted boutique florist and bakery hub in Chingrighata, Salt Lake delivering fresh bouquets and celebration cakes in 90 minutes.",
};

const PROOF_POINTS = [
  {
    value: "90-Min",
    label: "Express Delivery",
    detail: "Direct dispatch from our Salt Lake & Chingrighata hub",
    accent: "text-[#c8102e]",
  },
  {
    value: "16+",
    label: "Kolkata Delivery Hubs",
    detail: "Salt Lake, New Town, Park Street, Ballygunge & more",
    accent: "text-[#c8102e]",
  },
  {
    value: "100%",
    label: "Baked Fresh On Order",
    detail: "Artisanal sponges in pure egg & 100% eggless options",
    accent: "text-[#c8102e]",
  },
  {
    value: "12:30 AM",
    label: "Midnight Surprises",
    detail: "Special midnight doorstep delivery slots every night",
    accent: "text-[#c8102e]",
  },
];

const KOLKATA_HUBS = [
  "Salt Lake Sector I–V",
  "Chingrighata",
  "New Town",
  "Park Street",
  "Ballygunge",
  "Gariahat",
  "Lake Town",
  "Dum Dum",
  "Tollygunge",
  "Jadavpur",
  "Behala",
  "New Alipore",
  "Howrah",
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Header />

      <main className="flex-1 bg-linear-to-b from-[#fff7f6] via-white to-white">
        {/* Breadcrumb Strip */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 pt-5 pb-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-[#c8102e] font-medium transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-900 font-semibold">About Us</span>
          </nav>
        </div>

        {/* 1. Hero Tagline Banner Section */}
        <section className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-4 sm:py-6">
          <div className="relative rounded-3xl overflow-hidden border border-rose-200/80 shadow-sm bg-linear-to-r from-[#fff3ef] via-[#fff7f5] to-[#fce7ea]">
            {/* Background Floral Texture */}
            <Image
              src="/backgrounds/promise-floral-bg.jpg"
              alt="MS Flowers & Cake floral promise backdrop"
              fill
              sizes="(min-width: 1680px) 1600px, 100vw"
              className="object-cover object-center opacity-35 pointer-events-none"
              priority
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-10 p-6 sm:p-10 lg:p-12">
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#c8102e] bg-white/90 border border-rose-200 px-3.5 py-1 rounded-full shadow-2xs">
                    #GiftThatFeeling
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-rose-900 bg-rose-100/90 border border-rose-200/80 px-3.5 py-1 rounded-full">
                    #DeliveringSmilesInKolkata
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl 2xl:text-5xl font-black text-zinc-900 tracking-tight leading-[1.15]">
                  Expressing Emotions Through{" "}
                  <span className="text-[#c8102e]">Dawn-Fresh Blooms</span> &amp; Artisanal Cakes
                </h1>

                <p className="text-sm sm:text-base 2xl:text-lg text-zinc-700 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  MS Flowers &amp; Cake is Kolkata’s boutique florist and celebration bakery hub — crafting handpicked flower bouquets, oven-fresh cakes, and thoughtful gifting combos from our Chingrighata, Salt Lake studio straight to your loved ones’ doorsteps.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <Link
                    href="/combos"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#c8102e] hover:bg-[#a60c25] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs transition-all"
                  >
                    <span>Explore Combos</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                  <Link
                    href="/contact-us"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-rose-50 text-zinc-900 border border-rose-200 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xs transition-all"
                  >
                    <span>Contact Support</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden border-2 border-white/90 shadow-lg bg-rose-50">
                  <Image
                    src="/banners/anniversary-desktop.jpg"
                    alt="Curated red roses bouquet and celebration cake arrangement by MS Flowers & Cake"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-center"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Key Brand Proof Points Strip */}
        <section aria-label="Brand proof points" className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-4 sm:py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6">
            {PROOF_POINTS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white border border-rose-100 p-5 shadow-xs hover:border-rose-200 hover:shadow-sm transition-all"
              >
                <p className={`text-2xl sm:text-3xl font-black tracking-tight ${stat.accent}`}>
                  {stat.value}
                </p>
                <p className="text-sm sm:text-base font-extrabold text-zinc-900 mt-1">
                  {stat.label}
                </p>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{stat.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. ABOUT US — Brand Story & 3 Thematic Pillars */}
        <section className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-8 sm:py-12">
          <div className="rounded-3xl bg-linear-to-b from-[#fff6f4] via-white to-[#fff8f7] border border-rose-100 p-6 sm:p-10 lg:p-12 shadow-xs">
            {/* About Us Heading Lockup */}
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-12">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-[#c8102e] shadow-2xs mb-3">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5c1.5 0 2.75 1.15 2.75 2.6 0 1.9-2.75 3.9-2.75 3.9s-2.75-2-2.75-3.9C9.25 8.65 10.5 7.5 12 7.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 15.75c1-.85 2.2-1.25 3.5-1.25s2.5.4 3.5 1.25" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-black uppercase tracking-tight text-zinc-900">
                ABOUT <span className="text-[#c8102e]">US</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 mt-2 leading-relaxed">
                You focus on the emotions — we take care of the execution with fresh blooms, warm oven bakes, and dependable Kolkata delivery.
              </p>
            </div>

            {/* 3 Narrative Pillars */}
            <div className="space-y-8 lg:space-y-10">
              {/* Pillar 1: Emotional Purpose */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center bg-white rounded-3xl border border-rose-100/90 p-5 sm:p-8 shadow-2xs">
                <div className="lg:col-span-5">
                  <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-rose-50">
                    <Image
                      src="/trust/farm-fresh-blooms.jpg"
                      alt="Master florist handpicking fresh red Dutch roses and white lilies"
                      fill
                      sizes="(min-width: 1024px) 38vw, 100vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
                <div className="lg:col-span-7 space-y-3">
                  <span className="inline-block text-[11px] font-black uppercase tracking-widest text-[#c8102e] bg-rose-50 border border-rose-200/80 px-3 py-1 rounded-full">
                    01 · Emotional Purpose
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                    Gifts That Say What Your Heart Feels
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                    At MS Flowers &amp; Cake, we believe every relationship carries a unique feeling, and thoughtful gifts are the purest way to express those unspoken emotions. Whether it is a milestone Anniversary, a joyful Birthday, Valentine’s Day, or an unexpected romantic surprise, our curated floral arrangements and celebration cakes help you turn ordinary moments into cherished memories.
                  </p>
                </div>
              </div>

              {/* Pillar 2: Operational Craft & Speed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center bg-white rounded-3xl border border-rose-100/90 p-5 sm:p-8 shadow-2xs">
                <div className="lg:col-span-7 space-y-3 order-2 lg:order-1">
                  <span className="inline-block text-[11px] font-black uppercase tracking-widest text-[#c8102e] bg-rose-50 border border-rose-200/80 px-3 py-1 rounded-full">
                    02 · Operational Craft &amp; Speed
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                    Handpicked Daily Blooms &amp; Oven-Fresh Cakes
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                    Every bouquet begins at dawn with freshly cut Dutch red roses, fragrant lilies, carnations, and exotic purple orchids — hydrated and wrapped by skilled florists for lasting vase life. Alongside our floral studio, our bakery prepares 100% fresh-on-order chocolate truffle, red velvet, butterscotch, and gourmet cakes in both egg and 100% eggless options, delivered right on schedule via Same-Day, 45-to-90-Minute Express, and Midnight delivery slots.
                  </p>
                </div>
                <div className="lg:col-span-5 order-1 lg:order-2">
                  <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-rose-50">
                    <Image
                      src="/trust/freshly-baked-cakes.jpg"
                      alt="Artisan pastry chef piping chocolate cream on an oven-fresh celebration cake"
                      fill
                      sizes="(min-width: 1024px) 38vw, 100vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              </div>

              {/* Pillar 3: Kolkata Footprint & Personal Touch */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center bg-white rounded-3xl border border-rose-100/90 p-5 sm:p-8 shadow-2xs">
                <div className="lg:col-span-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-rose-50">
                      <Image
                        src="/trust/express-delivery-kolkata.jpg"
                        alt="MS Flowers 90-minute express delivery across Kolkata"
                        fill
                        sizes="(min-width: 1024px) 18vw, 50vw"
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-rose-50">
                      <Image
                        src="/trust/free-greeting-card.jpg"
                        alt="Complimentary wax-sealed greeting card tucked with red roses"
                        fill
                        sizes="(min-width: 1024px) 18vw, 50vw"
                        className="object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-7 space-y-3.5">
                  <span className="inline-block text-[11px] font-black uppercase tracking-widest text-[#c8102e] bg-rose-50 border border-rose-200/80 px-3 py-1 rounded-full">
                    03 · Kolkata Footprint &amp; Personal Touch
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                    From Chingrighata, Salt Lake to Every Corner of Kolkata
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                    Operating directly from our central florist and bakery hub in Chingrighata, Salt Lake, our dedicated riders deliver smiles with speed, care, and a complimentary wax-sealed handwritten greeting card tucked into every order.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {KOLKATA_HUBS.map((hub) => (
                      <span
                        key={hub}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50/90 border border-rose-100 text-zinc-800"
                      >
                        {hub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. MISSION & VISION Sections */}
        <section className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-4 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-8">
            {/* MISSION Card */}
            <div className="relative rounded-3xl overflow-hidden border border-rose-200/80 bg-linear-to-br from-[#fff3f0] via-white to-rose-50/80 p-7 sm:p-10 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-[#c8102e] text-white flex items-center justify-center shadow-sm shrink-0">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.9} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
                      <circle cx="12" cy="12" r="1.25" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#c8102e]">
                      What Drives Us
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
                      MISSION
                    </h2>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-zinc-700 font-medium leading-relaxed">
                  Offering a wide range of thoughtful floral arrangements, artisanal cakes, and curated gifting combos for every celebration and self-care moment in Kolkata with 90-minute express delivery and exceptional customer service.
                </p>
              </div>
            </div>

            {/* VISION Card */}
            <div className="relative rounded-3xl overflow-hidden border border-amber-200/80 bg-linear-to-br from-[#fffbeb] via-white to-rose-50/60 p-7 sm:p-10 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-zinc-900 text-amber-300 flex items-center justify-center shadow-sm shrink-0">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.9} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-amber-700">
                      Where We Are Headed
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
                      VISION
                    </h2>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-zinc-700 font-medium leading-relaxed">
                  To make every celebration in Kolkata a joyful memory and enrich relationships through heartfelt gifting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Bottom CTA Banner */}
        <section className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-8 sm:py-12">
          <div className="rounded-3xl bg-zinc-950 text-white p-7 sm:p-10 lg:p-12 border border-zinc-800 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-rose-400">
                <SparklesIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Celebrate Today</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Ready to Surprise Someone Special in Kolkata?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Pick a handtied floral bouquet, freshly baked cake, or festive combo — or reach out to our team for custom orders.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/flowers"
                className="px-5 py-3 rounded-full bg-[#c8102e] hover:bg-[#e11d48] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
              >
                Shop Flowers
              </Link>
              <Link
                href="/cakes"
                className="px-5 py-3 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
              >
                Shop Cakes
              </Link>
              <Link
                href="/combos"
                className="px-5 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
              >
                Shop Combos
              </Link>
              <Link
                href="/contact-us"
                className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
