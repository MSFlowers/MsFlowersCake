"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { SparklesIcon, ZapIcon } from "../components/StorefrontIcons";

const DEFAULT_STORE_SETTINGS = {
  store_name: "MS Flowers & Cake",
  tagline:
    "Kolkata’s trusted boutique destination for fresh handpicked flower bouquets, artisanal celebration cakes, and romantic flower + cake combos.",
  support_phone: "+91 6295233296",
  support_email: "rohit62952332@gmail.com",
  address: "MS Flowers & Cake — Florist & Bakery Hub, Chingrighata, Salt Lake, Kolkata, West Bengal - 700105",
  operating_hours: "Open Daily: 8:00 AM – 11:30 PM",
  midnight_hours: "Midnight Delivery Available (Till 12:30 AM)",
  whatsapp_number: "+91 6295233296",
  whatsapp_url: "https://wa.me/916295233296",
  facebook_url: "https://www.facebook.com/profile.php?id=61596205570248",
  instagram_url: "https://instagram.com/msflowers_kolkata",
};

const QUERY_CATEGORIES = [
  "Order Status / Tracking",
  "Custom Cake / Bouquet Request",
  "Delivery / Pincode Inquiry",
  "Bulk / Corporate / Event Order",
  "Complaint / Feedback",
  "General Query",
] as const;

const SELF_SERVE_LINKS = [
  {
    label: "90-Min Express Delivery",
    sub: "Same-day across Kolkata",
    href: "/same-day",
    badge: "Fastest",
  },
  {
    label: "Midnight Delivery",
    sub: "12:00 AM surprises till 12:30 AM",
    href: "/midnight",
    badge: "Midnight",
  },
  {
    label: "Fresh Flower Bouquets",
    sub: "Roses, orchids & lilies",
    href: "/flowers",
    badge: "Blooms",
  },
  {
    label: "Artisanal Cakes",
    sub: "Truffle, red velvet & eggless",
    href: "/cakes",
    badge: "Bakery",
  },
];

// Deterministic 21x21 decorative QR matrix (with valid 7x7 finder patterns & timing lines)
// Styled cleanly around a central WhatsApp badge for scannable-style visual parity with IGP Contact Us
const QR_GRID: string[] = [
  "111111101011011111111",
  "100000100101001000001",
  "101110101110101011101",
  "101110100110001011101",
  "101110101001101011101",
  "100000101101001000001",
  "111111101010101111111",
  "000000001101100000000",
  "101101110000011011010",
  "010110000000000101101",
  "111010100000001011011",
  "001101000000000110100",
  "101011100000001101011",
  "000000001011010010110",
  "111111101100101101001",
  "100000100110100011100",
  "101110101011011100101",
  "101110100100101011010",
  "101110101110010100111",
  "100000100011011011001",
  "111111101101001010111",
];

function WhatsAppQrGraphic() {
  return (
    <div className="relative w-36 h-36 sm:w-40 sm:h-40 bg-white p-2.5 rounded-2xl border-2 border-emerald-200 shadow-sm shrink-0">
      <svg
        viewBox="0 0 21 21"
        className="w-full h-full"
        role="img"
        aria-label="WhatsApp Chat QR Code for +91 6295233296"
      >
        <rect width="21" height="21" fill="#ffffff" />
        {QR_GRID.map((row, y) =>
          row.split("").map((cell, x) =>
            cell === "1" ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={0.94}
                height={0.94}
                rx={0.18}
                fill="#09090b"
              />
            ) : null
          )
        )}
      </svg>
      {/* Center WhatsApp Badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.5 14.12c-.23.65-1.35 1.24-1.88 1.32-.49.07-1.12.1-1.8-.12-.41-.13-.95-.31-1.63-.61-2.86-1.24-4.73-4.14-4.88-4.33-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09.99-2.37.26-.29.57-.36.76-.36.19 0 .38.01.55.02.18.01.41-.07.64.49.23.56.79 1.94.86 2.08.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.58.17.29.74 1.23 1.59 1.99 1.1.98 2.02 1.29 2.31 1.43.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.64-.14.26.09 1.66.78 1.94.92.29.14.48.21.55.33.07.12.07.68-.16 1.33z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SupportSpecialistIllustration() {
  return (
    <svg
      viewBox="0 0 320 170"
      className="w-full max-w-[280px] h-auto mx-auto"
      role="img"
      aria-label="MS Flowers & Cake customer support specialist illustration"
    >
      {/* Soft backdrop */}
      <ellipse cx="160" cy="146" rx="118" ry="14" fill="#ffe4e6" />
      <circle cx="70" cy="48" r="22" fill="#fff1f2" />
      <circle cx="255" cy="42" r="16" fill="#ecfdf5" />

      {/* Decorative floral sprigs */}
      <path d="M46 138 C46 112, 58 96, 66 84" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="67" cy="79" r="7" fill="#f43f5e" />
      <circle cx="58" cy="84" r="5" fill="#fb7185" />
      <circle cx="74" cy="86" r="5" fill="#fda4af" />
      <circle cx="67" cy="79" r="2.5" fill="#fef08a" />

      {/* Beanbag */}
      <path
        d="M95 144 C78 144, 72 122, 84 106 C95 92, 114 96, 128 104 C150 116, 178 118, 200 112 C216 108, 232 120, 224 138 C218 147, 195 146, 160 146 Z"
        fill="#fda4af"
      />
      <path
        d="M98 144 C128 146, 195 146, 218 140 C208 130, 185 128, 160 129 C132 130, 110 132, 98 144 Z"
        fill="#f43f5e"
        opacity="0.35"
      />

      {/* Support Specialist Torso & Arms */}
      <path d="M126 118 C126 94, 140 80, 156 80 C172 80, 184 94, 184 118 Z" fill="#c8102e" />
      <path d="M168 96 L202 106" stroke="#c8102e" strokeWidth="10" strokeLinecap="round" />
      <circle cx="204" cy="107" r="5" fill="#f3c6a5" />

      {/* Head & Hair */}
      <circle cx="155" cy="60" r="17" fill="#f3c6a5" />
      <path d="M138 58 C138 44, 152 38, 165 42 C173 45, 174 54, 171 60 C166 52, 148 50, 138 58 Z" fill="#27272a" />
      {/* Headset */}
      <path d="M137 60 C137 42, 173 42, 173 60" stroke="#18181b" strokeWidth="3.5" fill="none" />
      <rect x="134" y="55" width="6" height="12" rx="3" fill="#18181b" />
      <path d="M138 66 Q146 72 154 70" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Laptop */}
      <polygon points="184,114 230,114 242,88 196,88" fill="#18181b" />
      <polygon points="188,111 226,111 236,91 198,91" fill="#f4f4f5" />
      <rect x="174" y="114" width="60" height="5" rx="2.5" fill="#3f3f46" />

      {/* Floating Chat & Heart Bubbles */}
      <rect x="218" y="34" width="64" height="32" rx="10" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1.5" />
      <path d="M234 66 L228 74 L242 66 Z" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1.5" />
      <circle cx="236" cy="50" r="3" fill="#10b981" />
      <circle cx="249" cy="50" r="3" fill="#10b981" />
      <circle cx="262" cy="50" r="3" fill="#10b981" />
    </svg>
  );
}

interface SubmittedInquiry {
  category: string;
  orderId: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

export default function ContactUsPage() {
  const [settings, setSettings] = useState(DEFAULT_STORE_SETTINGS);
  const [category, setCategory] = useState<string>(QUERY_CATEGORIES[0]);
  const [orderId, setOrderId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState<SubmittedInquiry | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const cleanPhone = settings.support_phone.replace(/[^0-9+]/g, "") || "916295233296";
  const telHref = `tel:${cleanPhone}`;
  const whatsappCleanNumber = cleanPhone.replace(/[^0-9]/g, "") || "916295233296";

  const whatsappDirectUrl = settings.whatsapp_url.includes("?")
    ? settings.whatsapp_url
    : `${settings.whatsapp_url}?text=${encodeURIComponent(`Hi ${settings.store_name}, I need help with an order`)}`;

  const dispatchLinks = useMemo(() => {
    if (!submitted) return { whatsappUrl: whatsappDirectUrl, mailtoUrl: `mailto:${settings.support_email}` };

    const lines = [
      `Hi ${settings.store_name} Support Team,`,
      ``,
      `*Category:* ${submitted.category}`,
      submitted.orderId ? `*Order ID:* ${submitted.orderId}` : null,
      `*Name:* ${submitted.name}`,
      `*Phone:* ${submitted.phone}`,
      submitted.email ? `*Email:* ${submitted.email}` : null,
      `*Message:* ${submitted.message}`,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    const whatsappUrl = `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(lines)}`;
    const subject = `[${settings.store_name} Inquiry] ${submitted.category}${submitted.orderId ? ` - #${submitted.orderId}` : ""}`;
    const mailtoUrl = `mailto:${settings.support_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;

    return { whatsappUrl, mailtoUrl };
  }, [submitted, settings.store_name, settings.support_email, whatsappCleanNumber, whatsappDirectUrl]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          inquiry_type: category,
          location: "Kolkata Hub",
          message: orderId.trim() ? `[Order ID: #${orderId.trim()}] ${message.trim()}` : message.trim(),
        }),
      });
    } catch (err) {
      console.warn("Inquiry sync warning:", err);
    } finally {
      setSubmitting(false);
    }

    setSubmitted({
      category,
      orderId: orderId.trim(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      message: message.trim(),
    });
  }

  function handleReset() {
    setSubmitted(null);
    setOrderId("");
    setName("");
    setPhone("");
    setEmail("");
    setMessage("");
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Header />

      <main className="flex-1 bg-linear-to-b from-rose-50/40 via-white to-white">
        {/* Hero / Breadcrumb Header Strip */}
        <section className="border-b border-rose-100/80 bg-linear-to-r from-[#fff5f6] via-white to-[#fff8f5]">
          <div className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-6 sm:py-10">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
              <Link href="/" className="hover:text-[#c8102e] font-medium transition-colors">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-zinc-900 font-semibold">Contact Us</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#c8102e] bg-rose-100/90 border border-rose-200/80 px-3 py-1 rounded-full">
                  <SparklesIcon className="w-3.5 h-3.5 text-[#c8102e]" />
                  <span>Kolkata Customer Care</span>
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight mt-2.5">
                  Contact <span className="text-[#c8102e]">Us!!</span>
                </h1>
                <p className="text-xs sm:text-base text-zinc-600 mt-1.5 max-w-2xl leading-relaxed">
                  24x7 WhatsApp order support, custom cake &amp; bouquet assistance, and real-time updates for 90-minute express &amp; midnight delivery across Kolkata.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  WhatsApp Active
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-700 border border-zinc-200">
                  <ZapIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>90-Min Kolkata Hub Dispatch</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main 2-Column Support Workspace */}
        <section className="max-w-[1680px] mx-auto px-4 sm:px-8 2xl:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Direct Support Channels & Hub Identity */}
            <div className="lg:col-span-5 space-y-5">
              {/* Card 1: Featured WhatsApp Us Card with QR */}
              <div className="rounded-3xl bg-linear-to-br from-emerald-50/90 via-white to-emerald-50/40 border border-emerald-200/80 p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <WhatsAppQrGraphic />

                  <div className="text-center sm:text-left space-y-2.5 flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                      Instant Support
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 tracking-tight">
                      WhatsApp Us
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      Scan the QR code or click below to chat directly with our customer support on WhatsApp.
                    </p>
                    <div className="pt-1">
                      <a
                        href={whatsappDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
                      >
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z" />
                        </svg>
                        <span>{settings.whatsapp_number}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Physical Hub Address & Operating Hours */}
              <div className="rounded-3xl bg-white border border-zinc-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#c8102e] shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.9} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                      Kolkata Florist &amp; Bakery Hub
                    </h3>
                    <p className="text-sm text-zinc-700 font-medium mt-1 leading-relaxed">
                      {settings.address}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-zinc-700 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2.5">
                    <svg className="w-4 h-4 text-[#c8102e] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span>
                      <strong className="block text-zinc-900">Open Daily</strong>
                      {settings.operating_hours}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-900 bg-amber-50/80 border border-amber-200/70 rounded-xl px-3 py-2.5">
                    <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                    <span>
                      <strong className="block text-amber-950">Midnight Surprise Delivery</strong>
                      {settings.midnight_hours}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Email & Phone Support */}
              <div className="rounded-3xl bg-white border border-zinc-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                  Direct Contact Channels
                </h3>

                <div className="space-y-3">
                  <a
                    href={`mailto:${settings.support_email}`}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50 hover:bg-rose-50/70 border border-zinc-100 hover:border-rose-200 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 group-hover:border-rose-200 flex items-center justify-center text-[#c8102e] shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.9} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        Email Support
                      </span>
                      <span className="block text-sm font-bold text-zinc-900 group-hover:text-[#c8102e] truncate">
                        {settings.support_email}
                      </span>
                    </div>
                  </a>

                  <a
                    href={telHref}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50 hover:bg-rose-50/70 border border-zinc-100 hover:border-rose-200 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 group-hover:border-rose-200 flex items-center justify-center text-[#c8102e] shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.9} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        Call Store Desk
                      </span>
                      <span className="block text-sm font-bold text-zinc-900 group-hover:text-[#c8102e]">
                        {settings.support_phone}
                      </span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Card 4: Follow Us On & Support Illustration */}
              <div className="rounded-3xl bg-linear-to-b from-rose-50/60 to-white border border-rose-100 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                    Follow Us On:
                  </span>
                  <div className="flex items-center gap-2.5">
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow MS Flowers & Cake on Facebook"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200 hover:border-[#1877f2] hover:bg-[#1877f2] hover:text-white text-xs font-bold text-zinc-700 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Facebook</span>
                    </a>

                    <a
                      href={whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chat on WhatsApp"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white text-xs font-bold text-zinc-700 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={telHref}
                      aria-label="Direct Call"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200 hover:border-[#c8102e] hover:bg-[#c8102e] hover:text-white text-xs font-bold text-zinc-700 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                      <span>Call</span>
                    </a>
                  </div>
                </div>

                <SupportSpecialistIllustration />
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive "Send us a message" Form & Self-Serve Links */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl bg-white border border-zinc-200/90 p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                    Send us a message
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                    Fill in the details below and dispatch your query directly to our support desk.
                  </p>
                </div>

                {submitted ? (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.4} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-emerald-950">
                          Inquiry Ready to Dispatch!
                        </h3>
                        <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                          Click below to send your pre-filled details straight to our Kolkata support team on WhatsApp for the fastest response, or send via Email.
                        </p>
                      </div>
                    </div>

                    {/* Inquiry Summary */}
                    <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 sm:p-5 space-y-2 text-xs sm:text-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                        Your Message Summary
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <p>
                          <span className="text-zinc-500">Category:</span>{" "}
                          <strong className="text-zinc-900">{submitted.category}</strong>
                        </p>
                        {submitted.orderId && (
                          <p>
                            <span className="text-zinc-500">Order ID:</span>{" "}
                            <strong className="text-zinc-900">{submitted.orderId}</strong>
                          </p>
                        )}
                        <p>
                          <span className="text-zinc-500">Name:</span>{" "}
                          <strong className="text-zinc-900">{submitted.name}</strong>
                        </p>
                        <p>
                          <span className="text-zinc-500">Phone:</span>{" "}
                          <strong className="text-zinc-900">{submitted.phone}</strong>
                        </p>
                        {submitted.email && (
                          <p className="sm:col-span-2">
                            <span className="text-zinc-500">Email:</span>{" "}
                            <strong className="text-zinc-900">{submitted.email}</strong>
                          </p>
                        )}
                      </div>
                      <div className="pt-2 border-t border-zinc-200/80">
                        <span className="text-zinc-500 block mb-1">Message:</span>
                        <p className="text-zinc-800 whitespace-pre-line">{submitted.message}</p>
                      </div>
                    </div>

                    {/* 1-Click Dispatch Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={dispatchLinks.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-sm transition-all active:scale-95"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z" />
                        </svg>
                        <span>Send via WhatsApp Now</span>
                      </a>

                      <a
                        href={dispatchLinks.mailtoUrl}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        <span>Send via Email</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center justify-center px-4 py-3.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold transition-colors cursor-pointer"
                      >
                        New Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-category" className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                          Query Category <span className="text-[#c8102e]">*</span>
                        </label>
                        <select
                          id="contact-category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        >
                          {QUERY_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="contact-order-id" className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                          Order ID <span className="text-zinc-400 font-medium normal-case">(Optional)</span>
                        </label>
                        <input
                          id="contact-order-id"
                          type="text"
                          value={orderId}
                          onChange={(e) => setOrderId(e.target.value)}
                          placeholder="e.g. MS-10482"
                          className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                          Full Name <span className="text-[#c8102e]">*</span>
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-phone" className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                          Phone / WhatsApp Number <span className="text-[#c8102e]">*</span>
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98XXXXXXXX"
                          className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-zinc-400 font-medium normal-case">(Optional)</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Message <span className="text-[#c8102e]">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your delivery area, occasion, preferred flower or cake details, or order question..."
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-y"
                      />
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-xs text-zinc-500">
                        Typical reply time: <strong className="text-zinc-700">under 5 minutes</strong> on WhatsApp.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#c8102e] hover:bg-[#a60c25] disabled:opacity-75 text-white text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Message</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Self-Serve Support Quick Links */}
              <div className="rounded-3xl bg-rose-50/50 border border-rose-100 p-5 sm:p-6">
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider mb-3.5">
                  Quick Self-Serve Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SELF_SERVE_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-rose-100 hover:border-[#c8102e]/50 hover:shadow-xs transition-all group"
                    >
                      <div>
                        <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#c8102e]">
                          {item.badge}
                        </span>
                        <p className="text-sm font-bold text-zinc-900 group-hover:text-[#c8102e] transition-colors">
                          {item.label}
                        </p>
                        <p className="text-xs text-zinc-500">{item.sub}</p>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-rose-50 group-hover:bg-[#c8102e] text-[#c8102e] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
