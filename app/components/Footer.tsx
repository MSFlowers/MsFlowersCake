"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const DEFAULT_STORE_SETTINGS = {
  store_name: "MS Flowers & Cake",
  tagline:
    "Kolkata’s trusted boutique destination for fresh handpicked flower bouquets, artisanal celebration cakes, and romantic flower + cake combos.",
  support_phone: "+91 6295233296",
  support_email: "rohit62952332@gmail.com",
  address: "Chingrighata, Salt Lake, Kolkata, West Bengal - 700105",
  operating_hours: "Open Daily: 8:00 AM – 11:30 PM",
  midnight_hours: "Midnight Delivery Available (Till 12:30 AM)",
  whatsapp_number: "+91 6295233296",
  whatsapp_url: "https://wa.me/916295233296",
  facebook_url: "https://www.facebook.com/profile.php?id=61596205570248",
  instagram_url: "https://instagram.com/msflowers_kolkata",
  copyright_text: "© 2026 MS: Online Flowers and Cake Delivery in Kolkata. All rights reserved.",
  handcrafted_text: "Handcrafted with ❤️ in Chingrighata, Salt Lake, Kolkata",
};

const KOLKATA_DELIVERY_AREAS = [
  "Salt Lake Sector I–V",
  "Chingrighata",
  "New Town Action Area I–III",
  "Park Street",
  "Ballygunge",
  "Gariahat",
  "Lake Town",
  "Dum Dum",
  "Kankurgachi",
  "Rajarhat",
  "Tollygunge",
  "Jadavpur",
  "Behala",
  "New Alipore",
  "Howrah Station Area",
  "Shyambazar",
];

const FLOWER_LINKS = [
  { label: "Red Roses Bouquets", href: "#flowers" },
  { label: "Lilies & Carnations", href: "#flowers" },
  { label: "Exotic Purple Orchids", href: "#flowers" },
  { label: "Luxury Flower Boxes", href: "#flowers" },
  { label: "Birthday Flower Bouquets", href: "#flowers" },
];

const CAKE_LINKS = [
  { label: "Chocolate Truffle Cakes", href: "#cakes" },
  { label: "Red Velvet Heart Cakes", href: "#cakes" },
  { label: "German Black Forest Cakes", href: "#cakes" },
  { label: "Fresh Fruit & Butterscotch Cakes", href: "#cakes" },
  { label: "100% Eggless Cakes", href: "#cakes" },
];

const QUICK_LINKS = [
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
];

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [settings, setSettings] = useState(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            whatsapp_url: data.settings.whatsapp_url || prev.whatsapp_url,
            facebook_url: data.settings.facebook_url || prev.facebook_url,
          }));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const cleanPhone = settings.support_phone.replace(/[^0-9+]/g, "") || "916295233296";
  const telHref = `tel:${cleanPhone}`;
  const waHref = settings.whatsapp_url.includes("?")
    ? settings.whatsapp_url
    : `${settings.whatsapp_url}?text=${encodeURIComponent("Hi MS Flowers & Cake, I want to order")}`;

  return (
    <footer className="bg-zinc-950 text-white pt-10 sm:pt-14 pb-8 border-t border-zinc-800">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 space-y-8 sm:space-y-10">
        {/* Pre-Footer Quick Reassurance Bar */}
        <div className="pb-8 border-b border-zinc-900 grid grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">90-Min Express</p>
              <p className="text-[11px] text-zinc-400">Across Kolkata &amp; Salt Lake</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Farm-Fresh Blooms</p>
              <p className="text-[11px] text-zinc-400">Daily handpicked Dutch roses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">100% Oven Fresh</p>
              <p className="text-[11px] text-zinc-400">Baked fresh only on order</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">WhatsApp Support</p>
              <p className="text-[11px] text-zinc-400">{settings.support_phone}</p>
            </div>
          </div>
        </div>

        {/* ================= MOBILE VIEW: BRAND CARD + ACCORDION DROPDOWNS ================= */}
        <div className="block md:hidden space-y-6">
          {/* Brand Info & Socials */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-zinc-700 shadow-md group-hover:border-rose-500 transition-colors shrink-0 bg-white"
                style={{ position: "relative", width: "56px", height: "56px", borderRadius: "50%", overflow: "hidden" }}
              >
                <Image
                  src="/ms-logo.jpg"
                  alt="MS Online Flowers & Cake Delivery in Kolkata"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="block text-lg font-black tracking-tight text-white group-hover:text-rose-400 transition-colors">
                  {settings.store_name}
                </span>
                <span className="block text-[10px] font-bold tracking-widest uppercase text-rose-400">
                  ONLINE DELIVERY IN KOLKATA
                </span>
              </div>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {settings.tagline}
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-xs active:scale-95"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z" />
                </svg>
                <span>WhatsApp Order</span>
              </a>

              <a
                href={telHref}
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-[#c8102e] hover:border-[#c8102e] flex items-center justify-center text-white transition-all shadow-xs"
                aria-label="Call Store"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </a>

              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-[#1877f2] hover:border-[#1877f2] flex items-center justify-center text-white transition-all shadow-xs"
                aria-label="Facebook Page"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-[#E1306C] hover:border-[#E1306C] flex items-center justify-center text-white transition-all shadow-xs"
                  aria-label="Instagram Profile"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
            </div>

            {/* Mobile Quick Links Pill Bar */}
            <div className="pt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Quick Links
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/70 hover:text-rose-400 text-xs font-semibold text-zinc-200 transition-colors"
                  >
                    <span>{link.label}</span>
                    <svg
                      className="w-3 h-3 text-rose-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.2}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Accordion Group */}
          <div className="border-t border-zinc-800/80 divide-y divide-zinc-800/80">
            {/* Accordion 1: Fresh Flowers */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("flowers")}
                className="w-full py-3.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-white hover:text-rose-400 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 0 1 9 9c0 3.5-3.5 9-9 9s-9-5.5-9-9a9 9 0 0 1 9-9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7a5 5 0 0 1 5 5c0 2-2 5-5 5s-5-3-5-5a5 5 0 0 1 5-5z" />
                    </svg>
                  </span>
                  <span>Fresh Flowers</span>
                </span>
                <svg
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                    openSection === "flowers" ? "rotate-180 text-rose-400" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openSection === "flowers" && (
                <ul className="pb-3.5 pl-8.5 space-y-2 text-xs text-zinc-400 animate-fadeIn">
                  {FLOWER_LINKS.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="hover:text-rose-400 transition-colors block py-0.5">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Accordion 2: Delicious Cakes */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("cakes")}
                className="w-full py-3.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-white hover:text-rose-400 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 18m18 0v-5.25A2.25 2.25 0 0 0 18.75 10.5H5.25A2.25 2.25 0 0 0 3 12.75V18m18 0v2.25a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 20.25V18" />
                    </svg>
                  </span>
                  <span>Delicious Cakes</span>
                </span>
                <svg
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                    openSection === "cakes" ? "rotate-180 text-rose-400" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openSection === "cakes" && (
                <ul className="pb-3.5 pl-8.5 space-y-2 text-xs text-zinc-400 animate-fadeIn">
                  {CAKE_LINKS.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="hover:text-rose-400 transition-colors block py-0.5">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Accordion 3: Kolkata Delivery Areas */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("locations")}
                className="w-full py-3.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-white hover:text-rose-400 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </span>
                  <span>Delivery Locations (16 Hubs)</span>
                </span>
                <svg
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                    openSection === "locations" ? "rotate-180 text-rose-400" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openSection === "locations" && (
                <div className="pb-3.5 pl-8.5 flex flex-wrap gap-1.5 text-[11px] text-zinc-400 animate-fadeIn">
                  {KOLKATA_DELIVERY_AREAS.map((area) => (
                    <span
                      key={area}
                      className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion 4: Florist Hub & Contact */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("hub")}
                className="w-full py-3.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-white hover:text-rose-400 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 8.878 3.5h6.244a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72" />
                    </svg>
                  </span>
                  <span>Kolkata Florist Hub &amp; Store</span>
                </span>
                <svg
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                    openSection === "hub" ? "rotate-180 text-rose-400" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openSection === "hub" && (
                <div className="pb-3.5 pl-8.5 text-xs text-zinc-400 space-y-2.5 leading-relaxed animate-fadeIn">
                  <p className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    </span>
                    <span>{settings.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-rose-400 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                    </span>
                    <a href={telHref} className="text-zinc-200 hover:text-white font-medium">
                      {settings.support_phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-rose-400 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    </span>
                    <a href={`mailto:${settings.support_email}`} className="text-zinc-200 hover:text-white truncate">
                      {settings.support_email}
                    </a>
                  </p>
                  <p className="flex items-center gap-2 pt-0.5 text-zinc-300">
                    <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-rose-400 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </span>
                    <span>{settings.operating_hours}</span>
                  </p>
                  <p className="flex items-center gap-2 text-[11px] text-amber-300 pt-0.5">
                    <span className="w-5 h-5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                      </svg>
                    </span>
                    <span>{settings.midnight_hours}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= DESKTOP VIEW: MULTI-COLUMN EXPANDED GRID ================= */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1 & 2: Brand Story with Prominent Large Logo */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div
                className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 border-zinc-700 shadow-md group-hover:border-rose-500 transition-colors shrink-0 bg-white"
                style={{ position: "relative", width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden" }}
              >
                <Image
                  src="/ms-logo.jpg"
                  alt="MS Online Flowers & Cake Delivery in Kolkata"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-rose-400 transition-colors">
                  {settings.store_name}
                </span>
                <span className="block text-[11px] font-bold tracking-widest uppercase text-rose-400">
                  ONLINE DELIVERY IN KOLKATA
                </span>
              </div>
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
              {settings.tagline}
            </p>

            {/* Social & WhatsApp Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-xs active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z" />
                </svg>
                <span>WhatsApp: {settings.whatsapp_number}</span>
              </a>

              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-[#1877f2] hover:border-[#1877f2] flex items-center justify-center text-white transition-all shadow-xs"
                aria-label="Facebook Page"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-[#E1306C] hover:border-[#E1306C] flex items-center justify-center text-white transition-all shadow-xs"
                  aria-label="Instagram Profile"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              <a
                href={telHref}
                className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-[#c8102e] hover:border-[#c8102e] flex items-center justify-center text-white transition-all shadow-xs"
                aria-label="Call Store"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 3: Flowers Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Fresh Flowers
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              {FLOWER_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-rose-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Cakes Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Delicious Cakes
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              {CAKE_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-rose-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact & Florist Hub */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Kolkata Florist Hub
            </h4>
            <div className="text-xs sm:text-sm text-zinc-400 space-y-2.5 leading-relaxed">
              <p className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </span>
                <span>{settings.address}</span>
              </p>

              <p className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </span>
                <a href={telHref} className="hover:text-white transition-colors">
                  {settings.support_phone}
                </a>
              </p>

              <p className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <a href={`mailto:${settings.support_email}`} className="hover:text-white transition-colors truncate">
                  {settings.support_email}
                </a>
              </p>

              <p className="flex items-center gap-2.5 pt-1">
                <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
                <span className="text-zinc-300">{settings.operating_hours}</span>
              </p>

              <p className="flex items-center gap-2.5 text-[11px] text-amber-300 font-medium">
                <span className="w-5 h-5 rounded-md bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-300 shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                </span>
                <span>{settings.midnight_hours}</span>
              </p>

              {/* Desktop Quick Links */}
              <div className="pt-3 mt-3 border-t border-zinc-900">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Quick Links
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-rose-500/70 hover:text-rose-400 text-xs font-semibold text-zinc-200 transition-colors"
                    >
                      <span>{link.label}</span>
                      <svg
                        className="w-3 h-3 text-rose-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.2}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Kolkata Delivery Areas Served Tag Cloud */}
        <div className="hidden md:block pt-6 border-t border-zinc-900">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Popular Kolkata Delivery Locations (Same-Day &amp; 90-Min Express):
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-zinc-400">
            {KOLKATA_DELIVERY_AREAS.map((area) => (
              <span
                key={area}
                className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md hover:border-zinc-700 transition-colors"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 text-center sm:text-left">
          <p>
            {settings.copyright_text}
          </p>
          <nav aria-label="Footer Quick Links" className="flex items-center justify-center gap-3 text-xs">
            {QUICK_LINKS.map((link, idx) => (
              <span key={link.href} className="inline-flex items-center gap-3">
                {idx > 0 && <span className="text-zinc-700" aria-hidden="true">•</span>}
                <Link href={link.href} className="text-zinc-300 hover:text-rose-400 font-medium transition-colors">
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
          <p className="flex items-center justify-center gap-1">
            <span>{settings.handcrafted_text}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
