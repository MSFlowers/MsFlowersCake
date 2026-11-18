"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductVariant, ColorGallery } from "@/app/data/types";

type Group = string;

interface Cat {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  group_name: string | null;
  is_active: boolean;
}

interface Row {
  id: string;
  slug: string;
  name: string;
  group_type: Group;
  category_id: string | null;
  sub_category_id: string | null;
  price: number;
  original_price: number | null;
  rating: number;
  reviews_count: number;
  delivery_tag: string;
  badge: string | null;
  tagline: string | null;
  description: string | null;
  image: string;
  images: string[];
  is_eggless: boolean;
  weight: string | null;
  care_tips: string[];
  delivery_info: string[];
  stock: number;
  threshold: number;
  is_active: boolean;
  is_midnight: boolean;
  variants?: ProductVariant[];
  color_galleries?: ColorGallery[];
  categories?: { slug: string; name: string } | null;
  sub_categories?: { slug: string; name: string } | null;
}

interface FormState {
  id: string | null;
  name: string;
  slug: string;
  group: Group;
  subCategoryId: string;
  price: string;
  originalPrice: string;
  deliveryTag: string;
  badge: string;
  tagline: string;
  description: string;
  weight: string;
  isEggless: boolean;
  isMidnight: boolean;
  isActive: boolean;
  stock: string;
  threshold: string;
  image: string;
  images: string[];
  careTips: string;
  deliveryInfo: string;
  hasVariants: boolean;
  variants: ProductVariant[];
  colorGalleries: ColorGallery[];
}

const BUILTIN_GROUPS: Record<string, string> = {
  flowers: "Flowers",
  cakes: "Cakes",
  combos: "Combos",
};
const NON_PRODUCT_ROOT_SLUGS = ["occasions"];
const NON_PRODUCT_GROUP_NAMES = ["homepage_strip", "page_config"];
const groupTypeOf = (root: Cat) => BUILTIN_GROUPS[root.slug] || root.name;

const DELIVERY_TAGS = [
  "90-Min Delivery",
  "Same Day Delivery",
  "Next Day Delivery",
  "Midnight Delivery",
];

const PRESET_COLORS = [
  { name: "Crimson Red", code: "#e11d48" },
  { name: "Blush Pink", code: "#f472b6" },
  { name: "Sunny Yellow", code: "#eab308" },
  { name: "Pure White", code: "#f8fafc" },
  { name: "Royal Purple", code: "#a855f7" },
  { name: "Pastel Peach", code: "#fb923c" },
];

const emptyForm = (group: Group = "", isCake = false): FormState => ({
  id: null,
  name: "",
  slug: "",
  group,
  subCategoryId: "",
  price: "",
  originalPrice: "",
  deliveryTag: "90-Min Delivery",
  badge: "",
  tagline: "",
  description: "",
  weight: "",
  isEggless: isCake,
  isMidnight: false,
  isActive: true,
  stock: "25",
  threshold: "5",
  image: "",
  images: [],
  careTips: "",
  deliveryInfo: "",
  hasVariants: false,
  variants: [],
  colorGalleries: [],
});

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const lines = (v: string) =>
  v
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const inputCls =
  "w-full rounded-2xl border border-gray-200/90 px-4 py-3 text-sm focus:outline-rose-600 focus:border-rose-500 bg-white shadow-2xs transition-all";
const labelCls = "block font-bold text-gray-800 text-xs uppercase tracking-wider mb-2";

type EditorTab = "general" | "variants" | "colors" | "description";

export default function ProductsManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // filters
  const [groupFilter, setGroupFilter] = useState<"All" | Group>("All");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "low">("all");
  const [search, setSearch] = useState("");

  // editor view state
  const [form, setForm] = useState<FormState | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>("general");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // new color entry helper state
  const [newColorName, setNewColorName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#e11d48");

  const flash = (type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/products?includeInactive=true", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      const pJson = await pRes.json().catch(() => ({}));
      if (!pRes.ok) {
        setLoadError(pJson.error || `Failed to load products (${pRes.status})`);
      } else {
        setLoadError(null);
        setRows(pJson.products || []);
      }
      if (cRes.ok) {
        const cJson = await cRes.json();
        setCats(cJson.categories || []);
      }
    } catch (e: any) {
      setLoadError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const roots = useMemo(
    () =>
      cats.filter(
        (c) =>
          !c.parent_id &&
          c.is_active !== false &&
          !NON_PRODUCT_ROOT_SLUGS.includes(c.slug) &&
          !NON_PRODUCT_GROUP_NAMES.includes(c.group_name || "")
      ),
    [cats]
  );

  const rootFor = useCallback(
    (g: Group) => roots.find((c) => c.id === g) || null,
    [roots]
  );

  const subsFor = useCallback(
    (g: Group) => {
      const root = rootFor(g);
      if (!root) return [];
      return cats.filter(
        (c) =>
          c.parent_id === root.id &&
          !c.group_name?.startsWith("drawer:") &&
          c.group_name !== "page_config"
      );
    },
    [cats, rootFor]
  );

  const rowRootId = useCallback(
    (r: Row) =>
      r.category_id && roots.some((c) => c.id === r.category_id)
        ? r.category_id
        : roots.find((c) => groupTypeOf(c) === r.group_type)?.id || "",
    [roots]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (groupFilter !== "All" && rowRootId(r) !== groupFilter) return false;
      if (catFilter !== "all" && r.sub_categories?.slug !== catFilter) return false;
      if (statusFilter === "active" && !r.is_active) return false;
      if (statusFilter === "inactive" && r.is_active) return false;
      if (statusFilter === "low" && r.stock >= r.threshold) return false;
      if (q && !r.name.toLowerCase().includes(q) && !r.slug.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, groupFilter, catFilter, statusFilter, search, rowRootId]);

  const lowCount = rows.filter((r) => r.stock < r.threshold).length;
  const filterSubs = groupFilter === "All" ? [] : subsFor(groupFilter);

  async function patchProduct(id: string, updates: Record<string, unknown>, okMsg?: string) {
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      flash("err", json.error || "Update failed");
      return false;
    }
    if (okMsg) flash("ok", okMsg);
    await load();
    return true;
  }

  async function handleDelete(r: Row) {
    if (!confirm(`Delete "${r.name}" permanently?`)) return;
    const res = await fetch(`/api/products?id=${r.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return flash("err", json.error || "Delete failed");
    flash("ok", "Product deleted");
    await load();
  }

  async function upload(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "/products");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      flash("err", "ImageKit upload failed");
      return null;
    }
    const json = await res.json();
    return json.url as string;
  }

  async function onMainImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploading(true);
    const url = await upload(file);
    setUploading(false);
    if (url) setForm((f) => (f ? { ...f, image: url } : f));
    e.target.value = "";
  }

  // Upload photos for specific color bucket
  async function onColorImagesUpload(e: React.ChangeEvent<HTMLInputElement>, colorId: string) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !form) return;
    setUploading(true);
    const urls: string[] = [];
    for (const f of files) {
      const u = await upload(f);
      if (u) urls.push(u);
    }
    setUploading(false);

    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        colorGalleries: prev.colorGalleries.map((cg) =>
          cg.id === colorId ? { ...cg, images: [...cg.images, ...urls] } : cg
        ),
      };
    });
    e.target.value = "";
  }

  function openEdit(r: Row) {
    setActiveEditorTab("general");
    const loadedVariants = Array.isArray(r.variants) ? r.variants : [];
    const loadedColors = Array.isArray(r.color_galleries) ? r.color_galleries : [];

    setForm({
      id: r.id,
      name: r.name,
      slug: r.slug,
      group: rowRootId(r),
      subCategoryId: r.sub_category_id || "",
      price: String(r.price),
      originalPrice: r.original_price ? String(r.original_price) : "",
      deliveryTag: r.delivery_tag || "90-Min Delivery",
      badge: r.badge || "",
      tagline: r.tagline || "",
      description: r.description || "",
      weight: r.weight || "",
      isEggless: r.is_eggless,
      isMidnight: r.is_midnight,
      isActive: r.is_active,
      stock: String(r.stock),
      threshold: String(r.threshold),
      image: r.image,
      images: (r.images || []).filter((u) => u !== r.image),
      careTips: (r.care_tips || []).join("\n"),
      deliveryInfo: (r.delivery_info || []).join("\n"),
      hasVariants: loadedVariants.length > 0,
      variants: loadedVariants,
      colorGalleries: loadedColors,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.group) return flash("err", "Select a group / page first");
    if (!form.name || !form.price || !form.image) {
      return flash("err", "Name, base price and main image are required");
    }
    const root = rootFor(form.group);

    // Compute effective stock and threshold
    let totalStock = Number(form.stock) || 0;
    if (form.hasVariants && form.variants.length > 0) {
      totalStock = form.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() ? slugify(form.slug) : slugify(form.name),
      group_type: root ? groupTypeOf(root) : "",
      category_id: root?.id || null,
      sub_category_id: form.subCategoryId || null,
      price: Number(form.price),
      original_price: form.originalPrice ? Number(form.originalPrice) : null,
      delivery_tag: form.deliveryTag,
      badge: form.badge.trim() || null,
      tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      weight: form.weight.trim() || null,
      is_eggless: form.isEggless,
      is_midnight: form.isMidnight,
      is_active: form.isActive,
      stock: totalStock,
      threshold: Number(form.threshold) || 0,
      image: form.image,
      images: [form.image, ...form.images.filter((u) => u !== form.image)],
      care_tips: lines(form.careTips),
      delivery_info: lines(form.deliveryInfo),
      variants: form.hasVariants ? form.variants : [],
      color_galleries: form.colorGalleries,
    };

    setSaving(true);
    try {
      if (form.id) {
        const ok = await patchProduct(form.id, payload, "Product updated successfully");
        if (ok) setForm(null);
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Failed to create product");
        flash("ok", "Product created successfully");
        setForm(null);
        await load();
      }
    } catch (err: any) {
      flash("err", err.message);
    } finally {
      setSaving(false);
    }
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const formSubs = form ? subsFor(form.group) : [];

  // ==========================================
  // VIEW: FULL CANVAS STUDIO (SPACIOUS BREATHING ROOM)
  // ==========================================
  if (form) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FCF8F9] flex flex-col overflow-y-auto">
        {toast && (
          <div
            className={`fixed top-4 right-4 z-[80] rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl ${
              toast.type === "ok" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Top Header Sticky Bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100/80 px-6 sm:px-10 py-4 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setForm(null)}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Catalog</span>
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate max-w-sm sm:max-w-lg">
                {form.name || "Untitled Product"}
              </h1>
              <span
                className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${
                  form.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {form.isActive ? "Live" : "Draft"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded-2xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-7 py-2.5 text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : form.id ? (
                "Update Product"
              ) : (
                "Publish Product"
              )}
            </button>
          </div>
        </header>

        {/* Main Spacious Canvas */}
        <main className="max-w-6xl mx-auto w-full p-6 sm:p-10 my-4 space-y-8">
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden flex flex-col">
            {/* Horizontal Tabs Bar */}
            <div className="border-b border-rose-100 bg-rose-50/30 px-8 pt-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
              {[
                { id: "general", label: "General & Category" },
                { id: "variants", label: "Variants & Stock" },
                { id: "colors", label: "Colors & Photos" },
                { id: "description", label: "Description & Care" },
              ].map((tab) => {
                const active = activeEditorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveEditorTab(tab.id as EditorTab)}
                    className={`px-6 py-3 text-sm font-bold rounded-t-2xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                      active
                        ? "border-rose-600 text-rose-700 bg-white shadow-2xs"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                    {tab.id === "variants" && form.hasVariants && (
                      <span className="ml-2 text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                        {form.variants.length}
                      </span>
                    )}
                    {tab.id === "colors" && form.colorGalleries.length > 0 && (
                      <span className="ml-2 text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                        {form.colorGalleries.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Inputs Form with Breathing Space */}
            <form onSubmit={handleSave} className="p-8 sm:p-10 space-y-8">
              {/* TAB 1: GENERAL & CATEGORY */}
              {activeEditorTab === "general" && (
                <div className="space-y-6 max-w-4xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>Product Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Romantic 10 Red Roses Bouquet"
                        value={form.name}
                        onChange={(e) => {
                          set("name", e.target.value);
                          if (!form.id) set("slug", slugify(e.target.value));
                        }}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>URL Slug</label>
                      <div className="flex items-center rounded-2xl border border-gray-200/90 bg-gray-50 px-4 text-sm text-gray-400">
                        <span>/</span>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => set("slug", e.target.value)}
                          className="w-full bg-transparent py-3 pl-1 text-sm text-gray-800 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>Target Page / Group *</label>
                      <select
                        value={form.group}
                        onChange={(e) => {
                          set("group", e.target.value);
                          set("subCategoryId", "");
                        }}
                        className={inputCls}
                      >
                        <option value="">— Select page —</option>
                        {roots.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Sub-Category</label>
                      <select
                        value={form.subCategoryId}
                        onChange={(e) => set("subCategoryId", e.target.value)}
                        className={inputCls}
                      >
                        <option value="">— No sub-category —</option>
                        {formSubs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className={labelCls}>Promotional Badge</label>
                      <input
                        type="text"
                        placeholder="e.g. BESTSELLER, 15% OFF"
                        value={form.badge}
                        onChange={(e) => set("badge", e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Standard Weight / Size</label>
                      <input
                        type="text"
                        placeholder="e.g. 500g or 10 Stems"
                        value={form.weight}
                        onChange={(e) => set("weight", e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Delivery Tag</label>
                      <select
                        value={form.deliveryTag}
                        onChange={(e) => set("deliveryTag", e.target.value)}
                        className={inputCls}
                      >
                        {[...new Set([form.deliveryTag, ...DELIVERY_TAGS])].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Feature Checkboxes with generous spacing */}
                  <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-8">
                    <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isEggless}
                        onChange={(e) => set("isEggless", e.target.checked)}
                        className="rounded-lg text-rose-600 focus:ring-rose-500 w-5 h-5"
                      />
                      🌿 100% Pure Veg (Eggless)
                    </label>

                    <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isMidnight}
                        onChange={(e) => set("isMidnight", e.target.checked)}
                        className="rounded-lg text-rose-600 focus:ring-rose-500 w-5 h-5"
                      />
                      🌙 12 AM Midnight Delivery Available
                    </label>

                    <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => set("isActive", e.target.checked)}
                        className="rounded-lg text-rose-600 focus:ring-rose-500 w-5 h-5"
                      />
                      👁️ Active &amp; Published on Website
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: DYNAMIC VARIANTS & OPTIONS */}
              {activeEditorTab === "variants" && (
                <div className="space-y-6">
                  {/* Base Pricing Reference (used if no variants) */}
                  <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          Base Product Pricing &amp; Stock
                        </h3>
                        <p className="text-xs text-gray-500">
                          Standard price shown if variants are not selected.
                        </p>
                      </div>
                      <label className="flex items-center gap-2.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-rose-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={form.hasVariants}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            set("hasVariants", enabled);
                            if (enabled && form.variants.length === 0) {
                              const baseP = Number(form.price) || 549;
                              const baseMrp = Number(form.originalPrice) || Math.round(baseP * 1.2);
                              const defaultName = form.group.toLowerCase().includes("cake")
                                ? "0.5 Kg"
                                : form.group.toLowerCase().includes("flower")
                                ? "Standard (10 Stems)"
                                : "Standard";
                              set("variants", [
                                {
                                  id: `var_${Date.now()}`,
                                  name: defaultName,
                                  price: baseP,
                                  originalPrice: baseMrp,
                                  stock: Number(form.stock) || 20,
                                  threshold: Number(form.threshold) || 5,
                                },
                              ]);
                            }
                          }}
                          className="rounded text-rose-600 w-4 h-4 cursor-pointer"
                        />
                        Enable Multi-Size / Option Variants
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Base Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          placeholder="549"
                          value={form.price}
                          onChange={(e) => set("price", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Base MRP (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder="649"
                          value={form.originalPrice}
                          onChange={(e) => set("originalPrice", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Base Stock {form.hasVariants && "(Auto-summed)"}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={form.stock}
                          disabled={form.hasVariants && form.variants.length > 0}
                          onChange={(e) => set("stock", e.target.value)}
                          className={`${inputCls} disabled:bg-gray-100 disabled:text-gray-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Low Stock Alert
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={form.threshold}
                          onChange={(e) => set("threshold", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Multi-variant dynamic table */}
                  {form.hasVariants && (
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">
                              Product Variants & Options
                            </h3>
                            <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                              {form.variants.length} Options
                            </span>
                            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              Total Stock: {form.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)} Units
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Track independent pricing, MRP, stock count and alert thresholds for each size/variant.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newId = `var_${Date.now()}`;
                            const newVar: ProductVariant = {
                              id: newId,
                              name: "Option " + (form.variants.length + 1),
                              price: Number(form.price) || 899,
                              originalPrice: Number(form.originalPrice) || 1099,
                              stock: 15,
                              threshold: 3,
                            };
                            set("variants", [...form.variants, newVar]);
                          }}
                          className="self-start sm:self-auto rounded-xl bg-rose-600 text-white px-4 py-2 text-xs font-bold hover:bg-rose-700 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                        >
                          <span>+ Add Custom Variant</span>
                        </button>
                      </div>

                      {/* Quick Presets Bar for 1-Click Addition */}
                      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-rose-50/50 border border-rose-100/80 text-xs">
                        <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wide">
                          ⚡ 1-Click Quick Presets:
                        </span>
                        {(form.group.toLowerCase().includes("cake")
                          ? [
                              { name: "0.5 Kg", mult: 1 },
                              { name: "1.0 Kg", mult: 1.85 },
                              { name: "1.5 Kg", mult: 2.7 },
                              { name: "2.0 Kg", mult: 3.5 },
                            ]
                          : form.group.toLowerCase().includes("flower")
                          ? [
                              { name: "Standard (10 Stems)", mult: 1 },
                              { name: "Deluxe (15 Stems)", mult: 1.45 },
                              { name: "Luxury (20 Stems)", mult: 1.85 },
                              { name: "Grand (30 Stems)", mult: 2.6 },
                            ]
                          : [
                              { name: "Standard Pack", mult: 1 },
                              { name: "Deluxe with Teddy", mult: 1.35 },
                              { name: "Celebration Mega Pack", mult: 1.75 },
                            ]
                        ).map((preset) => {
                          const exists = form.variants.some((v) => v.name.toLowerCase() === preset.name.toLowerCase());
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              disabled={exists}
                              onClick={() => {
                                const baseP = Number(form.price) || 549;
                                const baseMrp = Number(form.originalPrice) || Math.round(baseP * 1.25);
                                const newVar: ProductVariant = {
                                  id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                                  name: preset.name,
                                  price: Math.round(baseP * preset.mult),
                                  originalPrice: Math.round(baseMrp * preset.mult),
                                  stock: 20,
                                  threshold: 5,
                                };
                                set("variants", [...form.variants, newVar]);
                              }}
                              className={`rounded-xl px-3 py-1 font-semibold transition-all ${
                                exists
                                  ? "bg-gray-200/80 text-gray-400 cursor-not-allowed"
                                  : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white shadow-2xs cursor-pointer"
                              }`}
                            >
                              + {preset.name} {exists && "✓"}
                            </button>
                          );
                        })}
                      </div>

                      {form.variants.length === 0 ? (
                        <div className="p-8 rounded-2xl border-2 border-dashed border-rose-200 text-center bg-rose-50/20">
                          <p className="text-sm font-bold text-gray-800">No variants created yet</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Click "+ Add Custom Variant" or pick from the 1-click presets above.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-2xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-gray-600">
                              <tr>
                                <th className="px-4 py-3">Variant Option Name</th>
                                <th className="px-4 py-3">Selling Price (₹)</th>
                                <th className="px-4 py-3">MRP (₹)</th>
                                <th className="px-4 py-3">Stock Units</th>
                                <th className="px-4 py-3">Alert Threshold</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {form.variants.map((v, idx) => {
                                const disc =
                                  v.originalPrice && v.originalPrice > v.price
                                    ? Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100)
                                    : 0;
                                const isOut = Number(v.stock) <= 0;
                                const isLow = !isOut && Number(v.stock) <= Number(v.threshold);

                                return (
                                  <tr key={v.id} className="hover:bg-rose-50/20 transition-colors">
                                    <td className="px-4 py-2.5">
                                      <input
                                        type="text"
                                        placeholder="e.g. 0.5 Kg or 20 Roses"
                                        value={v.name}
                                        onChange={(e) => {
                                          const updated = [...form.variants];
                                          updated[idx].name = e.target.value;
                                          set("variants", updated);
                                        }}
                                        className="w-44 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold focus:outline-rose-600 bg-white"
                                      />
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="number"
                                          min={0}
                                          value={v.price}
                                          onChange={(e) => {
                                            const updated = [...form.variants];
                                            updated[idx].price = Number(e.target.value);
                                            set("variants", updated);
                                          }}
                                          className="w-24 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-900 focus:outline-rose-600 bg-white"
                                        />
                                        {disc > 0 && (
                                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                            {disc}% off
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <input
                                        type="number"
                                        min={0}
                                        placeholder="Optional MRP"
                                        value={v.originalPrice || ""}
                                        onChange={(e) => {
                                          const updated = [...form.variants];
                                          updated[idx].originalPrice = Number(e.target.value);
                                          set("variants", updated);
                                        }}
                                        className="w-24 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-500 focus:outline-rose-600 bg-white"
                                      />
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <input
                                        type="number"
                                        min={0}
                                        value={v.stock}
                                        onChange={(e) => {
                                          const updated = [...form.variants];
                                          updated[idx].stock = Number(e.target.value);
                                          set("variants", updated);
                                        }}
                                        className="w-20 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-900 focus:outline-rose-600 bg-white"
                                      />
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <input
                                        type="number"
                                        min={0}
                                        value={v.threshold}
                                        onChange={(e) => {
                                          const updated = [...form.variants];
                                          updated[idx].threshold = Number(e.target.value);
                                          set("variants", updated);
                                        }}
                                        className="w-20 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-amber-700 focus:outline-rose-600 bg-white"
                                      />
                                    </td>
                                    <td className="px-4 py-2.5">
                                      {isOut ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                          Out of Stock
                                        </span>
                                      ) : isLow ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                          Low Stock
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                          In Stock
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5 text-right whitespace-nowrap space-x-2">
                                      <button
                                        type="button"
                                        title="Duplicate variant"
                                        onClick={() => {
                                          const copy: ProductVariant = {
                                            ...v,
                                            id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                                            name: `${v.name} (Copy)`,
                                          };
                                          const next = [...form.variants];
                                          next.splice(idx + 1, 0, copy);
                                          set("variants", next);
                                        }}
                                        className="text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                                      >
                                        Duplicate
                                      </button>
                                      <span className="text-gray-300">|</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          set(
                                            "variants",
                                            form.variants.filter((x) => x.id !== v.id)
                                          );
                                        }}
                                        className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: COLORS & GALLERIES */}
              {activeEditorTab === "colors" && (
                <div className="space-y-8">
                  {/* Main Master Cover Photo */}
                  <div className="p-6 rounded-3xl bg-rose-50/40 border border-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-gray-900">
                        Default Cover Image (Listing Grid Photo) *
                      </h3>
                      <p className="text-xs text-gray-500">
                        Primary image seen on search, home page and catalog grids.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onMainImage}
                        className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-700 cursor-pointer mt-2"
                      />
                    </div>
                    {form.image && (
                      <div className="relative group shrink-0">
                        <img
                          src={form.image}
                          alt="Main"
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-rose-200 shadow-sm"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Cover
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Color-based Galleries Section */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          Color-Specific Photo Galleries
                        </h3>
                        <p className="text-xs text-gray-500">
                          Upload distinct photos for each color shade (e.g. Red, Pink, Yellow). Customers clicking a color will see its matching pictures!
                        </p>
                      </div>

                      {/* Add Color Creator */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Color Name (e.g. Pink)"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold focus:outline-rose-600 w-36"
                        />
                        <input
                          type="color"
                          value={newColorCode}
                          onChange={(e) => setNewColorCode(e.target.value)}
                          className="w-8 h-8 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                          title="Pick hex shade"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newColorName.trim()) {
                              flash("err", "Please enter a color name");
                              return;
                            }
                            const newCol: ColorGallery = {
                              id: `col_${Date.now()}`,
                              colorName: newColorName.trim(),
                              colorCode: newColorCode,
                              images: [],
                            };
                            set("colorGalleries", [...form.colorGalleries, newCol]);
                            setNewColorName("");
                          }}
                          className="rounded-xl bg-gray-900 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                        >
                          + Add Color
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Color Buttons */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
                      <span>Quick presets:</span>
                      {PRESET_COLORS.map((pc) => (
                        <button
                          key={pc.name}
                          type="button"
                          onClick={() => {
                            if (form.colorGalleries.some((cg) => cg.colorName === pc.name)) return;
                            const newCol: ColorGallery = {
                              id: `col_${Date.now()}_${pc.name}`,
                              colorName: pc.name,
                              colorCode: pc.code,
                              images: [],
                            };
                            set("colorGalleries", [...form.colorGalleries, newCol]);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:border-rose-300 transition-colors cursor-pointer"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10"
                            style={{ backgroundColor: pc.code }}
                          />
                          <span>{pc.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Color Buckets List */}
                    {form.colorGalleries.length === 0 ? (
                      <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-700">No color galleries added</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Add colors above to upload different photos for different shades.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {form.colorGalleries.map((cg) => (
                          <div
                            key={cg.id}
                            className="p-5 rounded-3xl border border-gray-200/90 bg-white shadow-2xs space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span
                                  className="w-6 h-6 rounded-full border border-gray-300 shadow-2xs shrink-0"
                                  style={{ backgroundColor: cg.colorCode }}
                                />
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900">
                                    {cg.colorName} Shade Photos
                                  </h4>
                                  <span className="text-[11px] text-gray-400 font-mono">
                                    {cg.colorCode} &bull; {cg.images.length} photos uploaded
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  set(
                                    "colorGalleries",
                                    form.colorGalleries.filter((x) => x.id !== cg.id)
                                  );
                                }}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                              >
                                Delete Color
                              </button>
                            </div>

                            {/* Upload photos for this color */}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => onColorImagesUpload(e, cg.id)}
                                className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                              />
                            </div>

                            {/* Color Thumbnails Grid */}
                            <div className="flex flex-wrap gap-3">
                              {cg.images.map((u, imgIdx) => (
                                <div key={u} className="relative group">
                                  <img
                                    src={u}
                                    alt=""
                                    className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-2xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      set(
                                        "colorGalleries",
                                        form.colorGalleries.map((item) =>
                                          item.id === cg.id
                                            ? {
                                                ...item,
                                                images: item.images.filter((_, i) => i !== imgIdx),
                                              }
                                            : item
                                        )
                                      );
                                    }}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-transform"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              {cg.images.length === 0 && (
                                <p className="text-xs text-gray-400 italic py-2">
                                  No photos uploaded for this color yet. Choose files above.
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: DESCRIPTION & CARE INSTRUCTIONS */}
              {activeEditorTab === "description" && (
                <div className="space-y-6 max-w-4xl">
                  <div>
                    <label className={labelCls}>Hook Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. Speak the language of love with ten hand-picked velvet Dutch roses..."
                      value={form.tagline}
                      onChange={(e) => set("tagline", e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Full Detailed Description</label>
                    <textarea
                      rows={5}
                      placeholder="Describe arrangement details, freshness assurance, packaging quality..."
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>Care Instructions (One per line)</label>
                      <textarea
                        rows={5}
                        placeholder="Trim stems 1-2 cm at 45 degree angle&#10;Place in clean cool water&#10;Keep away from direct heat"
                        value={form.careTips}
                        onChange={(e) => set("careTips", e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Delivery Notes (One per line)</label>
                      <textarea
                        rows={5}
                        placeholder="Dispatched in specialized hydration wraps&#10;Complimentary personalized message card"
                        value={form.deliveryInfo}
                        onChange={(e) => set("deliveryInfo", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // VIEW: PRODUCTS CATALOG TABLE (DEFAULT VIEW)
  // ==========================================
  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl ${
            toast.type === "ok" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="rounded-3xl border border-rose-100 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-rose-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Products Catalog ({visible.length})</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live products synced with Supabase &amp; ImageKit CDN
              {lowCount > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusFilter("low")}
                  className="ml-2 font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  &bull; {lowCount} low stock alerts
                </button>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const def = groupFilter !== "All" ? groupFilter : roots[0]?.id || "";
              setForm(emptyForm(def, rootFor(def)?.slug === "cakes"));
              setActiveEditorTab("general");
            }}
            className="rounded-2xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-all shadow-sm cursor-pointer"
          >
            + Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="px-8 py-4 border-b border-rose-100 bg-rose-50/20 flex flex-wrap items-center gap-3">
          <select
            value={groupFilter}
            onChange={(e) => {
              setGroupFilter(e.target.value);
              setCatFilter("all");
            }}
            aria-label="Page / group"
            className="rounded-2xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 max-w-[260px] shadow-2xs"
          >
            <option value="All">All pages ({rows.length})</option>
            {roots.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({rows.filter((x) => rowRootId(x) === r.id).length})
              </option>
            ))}
          </select>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            disabled={groupFilter === "All"}
            className="rounded-2xl border border-gray-200 px-4 py-2 text-xs bg-white disabled:opacity-50 shadow-2xs"
          >
            <option value="all">
              {groupFilter === "All" ? "Pick a page first" : "All categories"}
            </option>
            {filterSubs.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-2xl border border-gray-200 px-4 py-2 text-xs bg-white shadow-2xs"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Hidden / Draft</option>
            <option value="low">Low stock</option>
          </select>

          <input
            type="search"
            placeholder="Search name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-2 text-xs bg-white w-64 shadow-2xs"
          />

          {(groupFilter !== "All" || catFilter !== "all" || statusFilter !== "all" || search) && (
            <button
              type="button"
              onClick={() => {
                setGroupFilter("All");
                setCatFilter("all");
                setStatusFilter("all");
                setSearch("");
              }}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loadError && (
          <div className="mx-8 mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <b>Could not load products:</b> {loadError}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-rose-50/40 text-xs font-bold uppercase tracking-wider text-rose-900/70 border-b border-rose-100">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-xs text-gray-400">
                    Loading products…
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <p className="font-bold text-gray-800">No products found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {rows.length === 0
                        ? "Click '+ Add Product' to create your first product."
                        : "No products match the current filters."}
                    </p>
                  </td>
                </tr>
              ) : (
                visible.map((r) => (
                  <tr key={r.id} className={`hover:bg-rose-50/30 ${r.is_active ? "" : "opacity-60"}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-rose-100 bg-rose-50 shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-[240px]">{r.name}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[240px]">/{r.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 font-bold text-rose-700">
                        {r.categories?.name || r.group_type}
                      </span>
                      <span className="ml-2 text-gray-600 font-medium">
                        {r.sub_categories?.name || "— none —"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₹{r.price}
                      {r.original_price && r.original_price > r.price && (
                        <span className="ml-2 text-xs font-normal text-gray-400 line-through">
                          ₹{r.original_price}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min={0}
                        defaultValue={r.stock}
                        key={`${r.id}-${r.stock}`}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v) && v !== r.stock) patchProduct(r.id, { stock: v }, "Stock updated");
                        }}
                        className={`w-18 rounded-xl border px-2.5 py-1 text-xs font-bold ${
                          r.stock < r.threshold ? "border-amber-400 bg-amber-50 text-amber-900" : "border-gray-200"
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 text-xs text-emerald-700 font-semibold">
                      {r.delivery_tag}
                      {r.is_midnight && <span className="ml-1.5 text-indigo-600">🌙</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          patchProduct(r.id, { is_active: !r.is_active }, r.is_active ? "Product hidden" : "Product live")
                        }
                        className={`rounded-full px-3 py-1 text-[11px] font-bold border cursor-pointer ${
                          r.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {r.is_active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="text-xs text-gray-700 hover:text-rose-700 font-bold cursor-pointer mr-4"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
