"use client";

import React, { useState, useEffect, useRef } from "react";

export interface HeroSlideRecord {
  id: string;
  headline: string;
  headline_color: string;
  subtitle: string;
  badge?: string | null;
  cta_label: string;
  cta_href: string;
  desktop_image_url: string;
  mobile_image_url: string;
  card_bg: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

const BG_PRESETS = [
  { label: "Warm Peach", value: "bg-linear-to-b from-[#f5e4d7] via-[#f7e9df] to-[#fbf2ec]" },
  { label: "Golden Caramel", value: "bg-linear-to-b from-[#f1d6bf] via-[#f3dbc6] to-[#f4e0ce]" },
  { label: "Blush Pink", value: "bg-linear-to-b from-[#fbdadd] via-[#fce4e6] to-[#fdf1f2]" },
  { label: "Lavender Glow", value: "bg-linear-to-b from-[#eeddfa] via-[#f4e8fd] to-[#fbf7ff]" },
  { label: "Mint Cream", value: "bg-linear-to-b from-[#dcfce7] via-[#eefdf3] to-[#f7fef9]" },
];

const COLOR_PRESETS = [
  { label: "Crimson Red", value: "text-[#b91c1c]", bg: "bg-[#b91c1c]" },
  { label: "Royal Purple", value: "text-[#4c1d95]", bg: "bg-[#4c1d95]" },
  { label: "Rose Pink", value: "text-[#e11d48]", bg: "bg-[#e11d48]" },
  { label: "Amber Gold", value: "text-[#d97706]", bg: "bg-[#d97706]" },
  { label: "Charcoal Dark", value: "text-[#18181b]", bg: "bg-[#18181b]" },
];

export function HeroSlidesManagerView({ onSlideCountChange }: { onSlideCountChange?: (count: number) => void }) {
  const [slides, setSlides] = useState<HeroSlideRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideRecord | null>(null);

  // Form State
  const [formHeadline, setFormHeadline] = useState("");
  const [formHeadlineColor, setFormHeadlineColor] = useState("text-[#b91c1c]");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formCtaLabel, setFormCtaLabel] = useState("SHOP NOW");
  const [formCtaHref, setFormCtaHref] = useState("#combos");
  const [formDesktopImage, setFormDesktopImage] = useState("");
  const [formMobileImage, setFormMobileImage] = useState("");
  const [formCardBg, setFormCardBg] = useState("bg-linear-to-b from-[#f5e4d7] via-[#f7e9df] to-[#fbf2ec]");
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);

  // Uploading state
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [saving, setSaving] = useState(false);

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  async function loadSlides(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/hero-slides");
      const data = await res.json();
      if (data.slides && Array.isArray(data.slides)) {
        setSlides(data.slides);
        if (onSlideCountChange) {
          onSlideCountChange(data.slides.filter((s: any) => s.is_active).length);
        }
      }
    } catch (err: any) {
      console.error("Failed to load slides:", err);
      setErrorMsg("Failed to connect to hero slides database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadSlides();
  }, []);

  function openCreateModal() {
    setEditingSlide(null);
    setFormHeadline("");
    setFormHeadlineColor("text-[#b91c1c]");
    setFormSubtitle("");
    setFormBadge("");
    setFormCtaLabel("SHOP NOW");
    setFormCtaHref("#combos");
    setFormDesktopImage("");
    setFormMobileImage("");
    setFormCardBg("bg-linear-to-b from-[#f5e4d7] via-[#f7e9df] to-[#fbf2ec]");
    setFormOrder(slides.length + 1);
    setFormIsActive(true);
    setModalOpen(true);
  }

  function openEditModal(slide: HeroSlideRecord) {
    setEditingSlide(slide);
    setFormHeadline(slide.headline);
    setFormHeadlineColor(slide.headline_color || "text-[#b91c1c]");
    setFormSubtitle(slide.subtitle);
    setFormBadge(slide.badge || "");
    setFormCtaLabel(slide.cta_label || "SHOP NOW");
    setFormCtaHref(slide.cta_href || "#combos");
    setFormDesktopImage(slide.desktop_image_url);
    setFormMobileImage(slide.mobile_image_url);
    setFormCardBg(slide.card_bg || "bg-linear-to-b from-[#f5e4d7] via-[#f7e9df] to-[#fbf2ec]");
    setFormOrder(slide.display_order || 1);
    setFormIsActive(slide.is_active);
    setModalOpen(true);
  }

  async function handleFileUpload(file: File, isDesktop: boolean) {
    if (isDesktop) setUploadingDesktop(true);
    else setUploadingMobile(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "/hero-slides");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload to ImageKit failed");
      }

      if (isDesktop) {
        setFormDesktopImage(data.url);
      } else {
        setFormMobileImage(data.url);
      }
      setSuccessMsg(`Image uploaded to ImageKit: ${file.name}`);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      console.error("ImageKit upload error:", err);
      setErrorMsg(`Upload failed: ${err.message}`);
    } finally {
      if (isDesktop) setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  }

  async function handleSaveSlide(e: React.FormEvent) {
    e.preventDefault();
    if (!formHeadline.trim()) {
      setErrorMsg("Please enter a headline for the slide.");
      return;
    }
    if (!formDesktopImage.trim() || !formMobileImage.trim()) {
      setErrorMsg("Both 16:9 Desktop and 9:16 Mobile photos are compulsory.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        id: editingSlide ? editingSlide.id : undefined,
        headline: formHeadline,
        headline_color: formHeadlineColor,
        subtitle: formSubtitle,
        badge: formBadge || null,
        cta_label: formCtaLabel,
        cta_href: formCtaHref,
        desktop_image_url: formDesktopImage,
        mobile_image_url: formMobileImage,
        card_bg: formCardBg,
        display_order: Number(formOrder) || 1,
        is_active: formIsActive,
      };

      const res = await fetch("/api/admin/hero-slides", {
        method: editingSlide ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save slide");
      }

      setModalOpen(false);
      setSuccessMsg(editingSlide ? "Hero slide updated successfully!" : "New hero slide created successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
      loadSlides(true);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMsg(err.message || "Could not save slide");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(slide: HeroSlideRecord) {
    const nextStatus = !slide.is_active;
    setSlides((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, is_active: nextStatus } : s))
    );

    try {
      await fetch("/api/admin/hero-slides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slide.id, is_active: nextStatus }),
      });
      loadSlides(true);
    } catch (err) {
      console.error("Toggle error:", err);
      loadSlides();
    }
  }

  async function handleDeleteSlide(id: string, headline: string) {
    if (!confirm(`Are you sure you want to delete "${headline}" slide?`)) return;

    try {
      const res = await fetch(`/api/admin/hero-slides?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSlides((prev) => prev.filter((s) => s.id !== id));
        setSuccessMsg(`Slide "${headline}" deleted.`);
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  const hasBothCompulsoryImages = Boolean(formDesktopImage.trim() && formMobileImage.trim());

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Notifications */}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>&bull;</span>
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg("")} className="font-bold text-rose-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>&bull;</span>
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg("")} className="font-bold text-emerald-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Top Header & KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
            Website &amp; CMS
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Hero Slides &amp; Banners ({slides.length})
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              ImageKit CDN Live
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Manage responsive promotional carousel slides. Every slide strictly requires both <strong>16:9 Desktop</strong> and <strong>9:16 Mobile</strong> photos for crystal-clear uncropped rendering.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => loadSlides(true)}
            disabled={refreshing}
            className="px-3.5 py-2.5 rounded-xl border border-rose-100 bg-white hover:bg-rose-50 text-gray-700 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-rose-600" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-300/40 flex items-center gap-2 cursor-pointer"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>Create New Slide</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Configured Slides</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{slides.length}</p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-base">
            &#9638;
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Live on Storefront</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {slides.filter((s) => s.is_active).length}
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
            &#10003;
          </span>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Dual-Ratio Rule</p>
            <p className="text-sm font-extrabold text-indigo-700 mt-1.5 flex items-center gap-1.5">
              <span>16:9</span> &bull; <span>9:16</span> <span className="text-xs font-medium text-gray-400">Strict</span>
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            100%
          </span>
        </div>
      </div>

      {/* Slides Cards Grid */}
      {loading ? (
        <div className="p-14 text-center text-gray-500 bg-white rounded-2xl border border-rose-100">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading promotional slides...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-rose-100">
          <p className="text-base font-bold text-gray-900">No Hero Slides Configured</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Click &ldquo;Create New Slide&rdquo; to add your first promotional banner with compulsory 16:9 &amp; 9:16 images.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {slides.map((slide, sIdx) => (
            <div
              key={slide.id}
              className={`rounded-3xl border transition-all overflow-hidden bg-white shadow-xs ${
                slide.is_active ? "border-rose-100" : "border-gray-200 opacity-75"
              }`}
            >
              {/* Card Header */}
              <div className="p-4 sm:px-6 border-b border-rose-100/70 bg-rose-50/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center font-mono font-black text-xs">
                    #{slide.display_order || sIdx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                      {slide.headline}
                    </h3>
                    <p className="text-xs text-gray-500">{slide.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(slide)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                      slide.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${slide.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                    <span>{slide.is_active ? "Active in Carousel" : "Paused / Hidden"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(slide)}
                    className="p-1.8 rounded-xl border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                    title="Edit Slide"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id, slide.headline)}
                    className="p-1.8 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-200 text-xs font-bold transition-colors cursor-pointer"
                    title="Delete Slide"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Side-by-Side Dual Aspect Ratio Previews */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 16:9 Desktop Preview (7 Cols) */}
                <div className="lg:col-span-8 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Desktop View (16:9 Widescreen)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-[10px] font-mono font-bold text-rose-800">
                      16:9 Aspect
                    </span>
                  </div>

                  <div className={`relative w-full aspect-16/9 rounded-2xl overflow-hidden border border-rose-200/80 shadow-xs ${slide.card_bg}`}>
                    {/* Background Ambient Blur */}
                    <img
                      src={slide.desktop_image_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover object-left blur-md scale-105 pointer-events-none opacity-85"
                    />
                    {/* Right Aligned 16:9 Image */}
                    <div className="absolute top-0 bottom-0 right-0 h-full aspect-16/9 [mask-image:linear-gradient(to_right,transparent_0%,black_20%,black_100%)]">
                      <img
                        src={slide.desktop_image_url}
                        alt={slide.headline}
                        className="w-full h-full object-contain object-right"
                      />
                    </div>
                    {/* Overlay Text */}
                    <div className="relative z-10 h-full flex flex-col justify-center items-start text-left pl-6 pr-4 max-w-[50%]">
                      {slide.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-300 text-zinc-950 text-[10px] font-black uppercase mb-1.5">
                          {slide.badge}
                        </span>
                      )}
                      <h4 className={`text-base sm:text-lg font-black leading-tight ${slide.headline_color}`}>
                        {slide.headline}
                      </h4>
                      <p className="text-xs sm:text-sm font-medium text-zinc-900 mt-0.5">
                        {slide.subtitle}
                      </p>
                      <span className="mt-2.5 bg-[#f43f5e] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {slide.cta_label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 9:16 Mobile Preview (4 Cols) */}
                <div className="lg:col-span-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>Mobile View (9:16 Portrait)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-[10px] font-mono font-bold text-indigo-800">
                      9:16 Story
                    </span>
                  </div>

                  <div className="relative w-full max-w-[210px] mx-auto aspect-9/16 rounded-2xl overflow-hidden border-2 border-gray-800 bg-gray-950 shadow-md">
                    <img
                      src={slide.mobile_image_url}
                      alt={`${slide.headline} Mobile`}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 left-2 right-2 text-center bg-black/60 backdrop-blur-xs py-1 px-2 rounded-lg">
                      <p className="text-[10px] font-bold text-white truncate">{slide.headline}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical CDN URL Footer */}
              <div className="px-5 py-3 border-t border-rose-100/60 bg-rose-50/20 text-[11px] text-gray-500 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 truncate max-w-xl">
                  <span className="font-semibold text-gray-700">ImageKit 16:9:</span>
                  <a
                    href={slide.desktop_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-600 hover:underline truncate"
                  >
                    {slide.desktop_image_url}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">Target: <code className="text-gray-700 font-bold">{slide.cta_href}</code></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Slide Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl my-8 rounded-3xl border border-rose-100 bg-white p-6 sm:p-8 shadow-2xl shadow-rose-950/20 max-h-[92vh] overflow-y-auto floral-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-rose-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block">
                  Storefront Carousel
                </span>
                <h2 className="text-xl font-extrabold text-gray-900 mt-0.5">
                  {editingSlide ? "Edit Hero Slide" : "Create New Hero Slide"}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Both <strong>16:9 Desktop</strong> and <strong>9:16 Mobile</strong> banner photos are strictly compulsory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-rose-100 text-gray-500 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="mt-6 space-y-6">
              {/* Compulsory Dual Photos Section */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                      <span>Compulsory Dual Aspect Banners</span>
                      <span className="text-rose-600">*</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Uploaded directly to your ImageKit account (`/hero-slides` folder).
                    </p>
                  </div>
                  {hasBothCompulsoryImages ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                      <span>&#10003;</span>
                      <span>Both Ratios Ready</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                      Upload Required (16:9 &amp; 9:16)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Field A: 16:9 Desktop (Compulsory) */}
                  <div className="space-y-2 p-3.5 rounded-xl border border-rose-200/80 bg-white">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                        <span>Desktop Photo</span>
                        <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
                        16:9 Landscape
                      </span>
                    </div>

                    {formDesktopImage ? (
                      <div className="relative w-full aspect-16/9 rounded-lg overflow-hidden border border-rose-200 bg-gray-50">
                        <img src={formDesktopImage} alt="Desktop 16:9 preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormDesktopImage("")}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-red-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                          title="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-16/9 rounded-lg border-2 border-dashed border-rose-200 flex flex-col items-center justify-center p-3 text-center bg-rose-50/20">
                        {uploadingDesktop ? (
                          <div className="flex flex-col items-center gap-1.5 text-xs text-rose-700 font-semibold">
                            <div className="w-5 h-5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                            <span>Uploading to ImageKit...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-[11px] font-bold text-gray-700">Upload 16:9 Photo</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">e.g. 1920x1080 or 1200x675</p>
                            <input
                              ref={desktopFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleFileUpload(e.target.files[0], true);
                              }}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => desktopFileInputRef.current?.click()}
                              className="mt-2 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Choose 16:9 File
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="pt-1">
                      <input
                        type="url"
                        placeholder="Or paste 16:9 ImageKit URL..."
                        value={formDesktopImage}
                        onChange={(e) => setFormDesktopImage(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Field B: 9:16 Mobile (Compulsory) */}
                  <div className="space-y-2 p-3.5 rounded-xl border border-rose-200/80 bg-white">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                        <span>Mobile Photo</span>
                        <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
                        9:16 Vertical
                      </span>
                    </div>

                    {formMobileImage ? (
                      <div className="relative w-full max-w-[140px] mx-auto aspect-9/16 rounded-lg overflow-hidden border border-indigo-200 bg-gray-50">
                        <img src={formMobileImage} alt="Mobile 9:16 preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormMobileImage("")}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-red-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                          title="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <div className="w-full max-w-[140px] mx-auto aspect-9/16 rounded-lg border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center p-3 text-center bg-indigo-50/20">
                        {uploadingMobile ? (
                          <div className="flex flex-col items-center gap-1.5 text-xs text-indigo-700 font-semibold">
                            <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                            <span>Uploading to ImageKit...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-[11px] font-bold text-gray-700">Upload 9:16</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">e.g. 1080x1920</p>
                            <input
                              ref={mobileFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleFileUpload(e.target.files[0], false);
                              }}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => mobileFileInputRef.current?.click()}
                              className="mt-2 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Choose 9:16 File
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="pt-1">
                      <input
                        type="url"
                        placeholder="Or paste 9:16 ImageKit URL..."
                        value={formMobileImage}
                        onChange={(e) => setFormMobileImage(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Copy: Headline, Subtitle, Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Slide Headline <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anniversary Flowers & Cakes"
                    value={formHeadline}
                    onChange={(e) => setFormHeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Headline Color Accent
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_PRESETS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setFormHeadlineColor(col.value)}
                        className={`w-7 h-7 rounded-lg ${col.bg} transition-all cursor-pointer ${
                          formHeadlineColor === col.value ? "ring-2 ring-offset-2 ring-gray-900 scale-110" : "opacity-80"
                        }`}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ANNIVERSARY SPECIAL"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Subtitle / Punchline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. for every love story"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* CTA Button Label & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SHOP NOW"
                    value={formCtaLabel}
                    onChange={(e) => setFormCtaLabel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    CTA Target Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #combos, #cakes, or /flowers"
                    value={formCtaHref}
                    onChange={(e) => setFormCtaHref(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Background Theme Preset */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Card Background Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {BG_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormCardBg(preset.value)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${preset.value} ${
                        formCardBg === preset.value
                          ? "ring-2 ring-rose-600 border-rose-300 font-bold"
                          : "border-gray-200 opacity-80"
                      }`}
                    >
                      <span className="text-[11px] text-gray-800">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordering and Active Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-rose-100">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700">Display Order:</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value) || 1)}
                    className="w-16 px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span>Active in Storefront Hero Carousel</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-rose-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !hasBothCompulsoryImages}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-300/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving Slide..." : editingSlide ? "Update Hero Slide" : "Create Hero Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
