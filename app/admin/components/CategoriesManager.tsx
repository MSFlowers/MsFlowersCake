"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_PAGE_CONFIGS,
  formatCategoriesForNav,
  getPageConfigFromCategories,
  PageConfig,
} from "@/app/lib/db";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type Placement =
  | "homepage"
  | "page-filter"
  | "page-occasion"
  | "root"
  | "new-page"
  | "drawer-link";

interface Cat {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  group_name: string | null;
  subtitle: string | null;
  image_url: string | null;
  banner_image_url: string | null;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
}

const SLUG_ICON: Record<string, string> = {
  cakes: "🎂",
  flowers: "💐",
  combos: "🎁",
  occasions: "🎉",
};

const SLUG_TAB_LABEL: Record<string, string> = {
  cakes: "Cakes Page",
  flowers: "Flowers Page",
  combos: "Combos Page",
};

const DEFAULT_GROUPS: Record<string, string[]> = {
  cakes: ["Popular Flavours", "Styles & Types"],
  flowers: ["Flower Varieties", "Arrangements & Occasions"],
  combos: ["Signature Combos", "Deluxe Celebration Hampers"],
};

const LINK_SUGGESTIONS = [
  "/cakes",
  "/cakes?price=under-599",
  "/cakes?price=600-999",
  "/cakes?price=above-1000",
  "/cakes?delivery=90-min",
  "/flowers",
  "/flowers?price=under-599",
  "/flowers?delivery=90-min",
  "/combos",
  "/combos?price=under-1199",
  "/combos?delivery=90-min",
  "/same-day",
  "/midnight",
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function Chevron({ rotated, className = "" }: { rotated: boolean; className?: string }) {
  return (
    <svg
      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
        rotated ? "rotate-90 text-[#c8102e]" : "text-gray-400"
      } ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CategoriesView(_props: { categories?: unknown }) {
  const [all, setAll] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("home");
  const [uploading, setUploading] = useState(false);

  // Live 3-Column Drawer Editor selection state
  const [drawerCatId, setDrawerCatId] = useState<string | null>(null);
  const [drawerGroupIdx, setDrawerGroupIdx] = useState<number | null>(null);

  // Inline Column 2 sub-menu create / rename UI state
  const [addingSubMenu, setAddingSubMenu] = useState(false);
  const [newSubMenuTitle, setNewSubMenuTitle] = useState("");
  const [renamingGroupRaw, setRenamingGroupRaw] = useState<string | null>(null);
  const [renameGroupTitle, setRenameGroupTitle] = useState("");
  const [drawerBusy, setDrawerBusy] = useState(false);

  // Live Page Studio state (Hero Banner + Headings + FAQs + Full-Page Preview)
  type PageSectionId = "hero" | "occasions" | "pills" | "faqs";
  const [draftConfig, setDraftConfig] = useState<PageConfig>(DEFAULT_PAGE_CONFIGS.cakes);
  const [configRowId, setConfigRowId] = useState<string | null>(null);
  const [configDirty, setConfigDirty] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [monitorExpanded, setMonitorExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<PageSectionId>("hero");
  const [openSec, setOpenSec] = useState<Record<PageSectionId, boolean>>({
    hero: true,
    occasions: true,
    pills: true,
    faqs: true,
  });
  const [previewFaqIdx, setPreviewFaqIdx] = useState<number | null>(0);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const [homePageIdx, setHomePageIdx] = useState(0);
  const previewRefs = useRef<Record<PageSectionId, HTMLDivElement | null>>({
    hero: null,
    occasions: null,
    pills: null,
    faqs: null,
  });

  // Wizard modal state
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [placement, setPlacement] = useState<Placement>("page-filter");
  const [targetRootSlug, setTargetRootSlug] = useState<string>("cakes");
  const [drawerGroupTitle, setDrawerGroupTitle] = useState<string>("");
  const [addStripOnPageCreate, setAddStripOnPageCreate] = useState<boolean>(true);
  const [openedFromDrawer, setOpenedFromDrawer] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [badge, setBadge] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setAll(json.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Sync draftConfig when switching to a page tab
  useEffect(() => {
    if (tab === "home" || tab === "drawer") return;
    const matchedRoot = all.find(
      (c) => !c.parent_id && c.group_name !== "homepage_strip" && c.slug === tab
    );
    const label = SLUG_TAB_LABEL[tab] || matchedRoot?.name;
    const { config, rowId } = getPageConfigFromCategories(all, tab, label);
    setDraftConfig(config);
    setConfigRowId(rowId);
    setConfigDirty(false);
    setActiveSection("hero");
  }, [tab]);

  // Keep draftConfig & configRowId refreshed after saves/loads when not dirty
  useEffect(() => {
    if (tab === "home" || tab === "drawer") return;
    const matchedRoot = all.find(
      (c) => !c.parent_id && c.group_name !== "homepage_strip" && c.slug === tab
    );
    const label = SLUG_TAB_LABEL[tab] || matchedRoot?.name;
    const { config, rowId } = getPageConfigFromCategories(all, tab, label);
    setConfigRowId(rowId);
    if (!configDirty) {
      setDraftConfig(config);
    }
  }, [all]);

  /* ----------------------- derived data ----------------------- */

  const strip = useMemo(
    () =>
      all
        .filter((c) => c.group_name === "homepage_strip")
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [all]
  );

  const HOME_VISIBLE_SLOTS = 7;
  const maxHomeOffset = Math.max(0, strip.length - HOME_VISIBLE_SLOTS);
  const clampedHomeOffset = Math.min(homePageIdx, maxHomeOffset);

  const roots = useMemo(
    () =>
      all
        .filter((c) => !c.parent_id && c.group_name !== "homepage_strip")
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [all]
  );

  const pageTabs = useMemo(
    () =>
      roots
        .filter((r) => r.slug !== "occasions")
        .map((r) => ({
          id: r.slug,
          icon: SLUG_ICON[r.slug] || "📄",
          label: SLUG_TAB_LABEL[r.slug] || r.name,
          route: r.banner_image_url || `/${r.slug}`,
          root: r,
        })),
    [roots]
  );

  const drawerNav = useMemo(
    () => formatCategoriesForNav(all, { includeEmptyGroups: true }),
    [all]
  );

  const rootBySlug = (slug: string) => roots.find((r) => r.slug === slug);

  const childrenOf = (rootSlug: string) => {
    const r = rootBySlug(rootSlug);
    if (!r) return [];
    return all
      .filter(
        (c) =>
          c.parent_id === r.id &&
          !c.group_name?.startsWith("drawer:") &&
          c.group_name !== "page_config"
      )
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  };

  function occasionCardsFor(pageSlug: string) {
    const occs = childrenOf("occasions").filter((c) => c.is_featured);
    if (pageSlug === "flowers") {
      return occs.filter((c) => c.group_name === "Flowers Occasions");
    }
    if (pageSlug === "combos") {
      return occs.filter((c) => c.group_name === "Combos Occasions");
    }
    if (pageSlug === "cakes") {
      return occs.filter(
        (c) =>
          !c.group_name ||
          c.group_name === "Occasions" ||
          c.group_name === "Cakes Occasions"
      );
    }
    return occs.filter((c) => c.group_name === `${pageSlug} Occasions`);
  }

  function placementOf(c: Cat): {
    placement: Placement;
    rootSlug: string;
    groupTitle: string;
  } {
    if (c.group_name === "homepage_strip") {
      return { placement: "homepage", rootSlug: "cakes", groupTitle: "" };
    }
    if (!c.parent_id) {
      return { placement: "root", rootSlug: c.slug, groupTitle: "" };
    }
    const parent = all.find((p) => p.id === c.parent_id);
    if (c.group_name?.startsWith("drawer:")) {
      return {
        placement: "drawer-link",
        rootSlug: parent?.slug || "cakes",
        groupTitle: c.group_name.replace(/^drawer:/, "").trim(),
      };
    }
    if (parent?.slug === "occasions") {
      if (c.group_name === "Flowers Occasions") {
        return { placement: "page-occasion", rootSlug: "flowers", groupTitle: "" };
      }
      if (c.group_name === "Combos Occasions") {
        return { placement: "page-occasion", rootSlug: "combos", groupTitle: "" };
      }
      if (
        c.group_name?.endsWith(" Occasions") &&
        c.group_name !== "Occasions" &&
        c.group_name !== "Cakes Occasions"
      ) {
        return {
          placement: "page-occasion",
          rootSlug: c.group_name.replace(/ Occasions$/, ""),
          groupTitle: "",
        };
      }
      return { placement: "page-occasion", rootSlug: "cakes", groupTitle: "" };
    }
    return {
      placement: "page-filter",
      rootSlug: parent?.slug || "cakes",
      groupTitle: "",
    };
  }

  /* ----------------------- actions ----------------------- */

  async function uploadFile(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "/categories");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      return json.url as string;
    } catch (err: any) {
      alert("ImageKit upload error: " + err.message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function inlinePhoto(id: string, file: File) {
    const url = await uploadFile(file);
    if (!url) return;
    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, image_url: url }),
    });
    if (res.ok) await load();
    else alert((await res.json()).error || "Photo update failed");
  }

  async function remove(c: Cat) {
    const childCount = all.filter((x) => x.parent_id === c.id).length;
    const msg =
      childCount > 0
        ? `Delete "${c.name}" and its ${childCount} linked items?`
        : `Delete "${c.name}"?`;
    if (!confirm(msg)) return;

    if (childCount > 0) {
      for (const child of all.filter((x) => x.parent_id === c.id)) {
        await fetch(`/api/categories?id=${child.id}`, { method: "DELETE" });
      }
    }
    const res = await fetch(`/api/categories?id=${c.id}`, { method: "DELETE" });
    if (res.ok) {
      if (!c.parent_id && tab === c.slug) setTab("home");
      if (!c.parent_id && drawerCatId === c.slug) {
        setDrawerCatId(null);
        setDrawerGroupIdx(null);
      }
      await load();
    } else {
      alert((await res.json()).error || "Delete failed");
    }
  }

  function resetForm() {
    setName("");
    setBadge("");
    setSubtitle("");
    setImageUrl("");
    setLink("");
    setAddStripOnPageCreate(true);
  }

  function openAdd(
    preset?: Placement,
    opts?: {
      rootSlug?: string;
      groupTitle?: string;
      fromDrawer?: boolean;
      defaultLink?: string;
    }
  ) {
    resetForm();
    setEditing(null);
    setOpenedFromDrawer(Boolean(opts?.fromDrawer));
    if (preset) {
      setPlacement(preset);
      if (opts?.rootSlug) setTargetRootSlug(opts.rootSlug);
      if (opts?.groupTitle) setDrawerGroupTitle(opts.groupTitle);
      if (opts?.defaultLink) setLink(opts.defaultLink);
      else if (preset === "drawer-link" && opts?.rootSlug) {
        setLink(opts.rootSlug === "occasions" ? "/combos" : `/${opts.rootSlug}`);
      }
      setStep(2);
    } else {
      setPlacement("page-filter");
      setTargetRootSlug("cakes");
      setStep(1);
    }
    setShowModal(true);
  }

  function openEdit(c: Cat) {
    const detected = placementOf(c);
    setEditing(c);
    setPlacement(detected.placement);
    setTargetRootSlug(detected.rootSlug);
    setDrawerGroupTitle(detected.groupTitle);
    setOpenedFromDrawer(false);
    setName(c.name || "");
    setBadge(c.badge || "");
    if (detected.placement === "homepage" || detected.placement === "drawer-link") {
      setSubtitle("");
      setLink(c.subtitle || "");
    } else if (detected.placement === "root") {
      setSubtitle(c.subtitle || "");
      setLink(c.banner_image_url || (c.slug === "occasions" ? "/combos" : `/${c.slug}`));
    } else {
      setSubtitle(c.subtitle || "");
      setLink("");
    }
    setImageUrl(c.image_url || "");
    setStep(2);
    setShowModal(true);
  }

  async function save() {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    if ((placement === "homepage" || placement === "drawer-link") && !link.trim()) {
      alert("Enter a target link (e.g. /cakes or /cakes?price=under-599)");
      return;
    }

    setSaving(true);
    try {
      let payload: any;

      if (placement === "new-page") {
        const pageSlug = slugify(name);
        if (!pageSlug) throw new Error("Enter a valid page name");
        if (roots.some((r) => r.slug === pageSlug)) {
          throw new Error(`A page with slug "${pageSlug}" already exists`);
        }
        const customRoute =
          link.trim() && link.trim() !== `/${pageSlug}` ? link.trim() : null;
        const nextRootSort = Math.max(0, ...roots.map((r) => r.sort_order || 0)) + 1;

        payload = {
          name: name.trim(),
          slug: pageSlug,
          parent_id: null,
          group_name: null,
          subtitle: subtitle.trim() || null,
          image_url: imageUrl || null,
          banner_image_url: customRoute,
          badge: badge.trim() || null,
          is_featured: false,
          is_active: true,
          sort_order: nextRootSort,
        };

        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Save failed");

        if (addStripOnPageCreate) {
          const words = name.trim().split(/\s+/);
          const two =
            words.length > 1 ? `${words[0]}|${words.slice(1).join(" ")}` : null;
          const nextStripSort =
            Math.max(0, ...strip.map((s) => s.sort_order || 0)) + 1;
          await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              slug: `strip-${pageSlug}`,
              parent_id: null,
              group_name: "homepage_strip",
              subtitle: customRoute || `/${pageSlug}`,
              banner_image_url: two,
              image_url: imageUrl || null,
              is_featured: false,
              is_active: true,
              sort_order: nextStripSort,
            }),
          });
        }

        setShowModal(false);
        await load();
        if (openedFromDrawer) {
          setTab("drawer");
          setDrawerCatId(pageSlug);
          setDrawerGroupIdx(null);
        } else {
          setTab(pageSlug);
        }
        return;
      }

      if (placement === "root") {
        const customRoute =
          editing &&
          link.trim() &&
          link.trim() !== `/${editing.slug}` &&
          !(editing.slug === "occasions" && link.trim() === "/combos")
            ? link.trim()
            : null;
        payload = {
          name: name.trim(),
          subtitle: subtitle.trim() || null,
          image_url: imageUrl || null,
          banner_image_url: customRoute,
        };
      } else if (placement === "homepage") {
        const words = name.trim().split(/\s+/);
        const two =
          words.length > 1 ? `${words[0]}|${words.slice(1).join(" ")}` : null;
        const nextSort = Math.max(0, ...strip.map((s) => s.sort_order || 0)) + 1;
        payload = {
          name: name.trim(),
          slug: editing ? editing.slug : `strip-${slugify(name)}`,
          parent_id: null,
          group_name: "homepage_strip",
          subtitle: link.trim(),
          banner_image_url: two,
          image_url: imageUrl || null,
          badge: null,
          is_featured: false,
          is_active: true,
          sort_order: editing ? editing.sort_order : nextSort,
        };
      } else if (placement === "drawer-link") {
        const parent = rootBySlug(targetRootSlug);
        if (!parent) throw new Error(`Main section "${targetRootSlug}" not found`);
        const grpName = `drawer:${drawerGroupTitle.trim() || "More Links"}`;
        const siblings = all.filter((c) => c.parent_id === parent.id);
        const nextSort = Math.max(0, ...siblings.map((s) => s.sort_order || 0)) + 1;
        payload = {
          name: name.trim(),
          slug: editing
            ? editing.slug
            : `drawer-${targetRootSlug}-${slugify(name)}-${Date.now().toString().slice(-4)}`,
          parent_id: parent.id,
          group_name: editing?.group_name || grpName,
          subtitle: link.trim(),
          badge: badge.trim() || null,
          image_url: imageUrl || null,
          is_featured: false,
          is_active: true,
          sort_order: editing ? editing.sort_order : nextSort,
        };
      } else {
        const isOccasion = placement === "page-occasion";
        const rootSlug = isOccasion ? "occasions" : targetRootSlug;
        const parent = rootBySlug(rootSlug);
        if (!parent) throw new Error(`Main section "${rootSlug}" not found`);

        const siblings = isOccasion
          ? occasionCardsFor(targetRootSlug)
          : childrenOf(targetRootSlug);
        const nextSort = Math.max(0, ...siblings.map((s) => s.sort_order || 0)) + 1;

        let resolvedGroup: string;
        if (isOccasion) {
          resolvedGroup =
            targetRootSlug === "flowers"
              ? "Flowers Occasions"
              : targetRootSlug === "combos"
              ? "Combos Occasions"
              : targetRootSlug === "cakes"
              ? "Occasions"
              : `${targetRootSlug} Occasions`;
        } else {
          resolvedGroup =
            (editing && editing.group_name) ||
            DEFAULT_GROUPS[targetRootSlug]?.[0] ||
            "Collections";
        }

        payload = {
          name: name.trim(),
          slug: editing
            ? editing.slug
            : isOccasion
            ? `${targetRootSlug}-occ-${slugify(name)}`
            : slugify(name),
          parent_id: parent.id,
          group_name: resolvedGroup,
          subtitle: subtitle.trim() || null,
          badge: badge.trim() || null,
          image_url: imageUrl || null,
          is_featured: isOccasion,
          is_active: true,
          sort_order: editing ? editing.sort_order : nextSort,
        };
      }

      const res = await fetch("/api/categories", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");

      setShowModal(false);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  /* ----------------------- drawer group actions ----------------------- */

  async function renameDrawerGroup(
    rootDbId: string,
    oldRawGroupName: string,
    newTitle: string
  ) {
    const clean = newTitle.trim();
    if (!clean) return;
    const newRaw = `drawer:${clean}`;
    if (newRaw === oldRawGroupName) {
      setRenamingGroupRaw(null);
      return;
    }
    setDrawerBusy(true);
    try {
      const matching = all.filter(
        (c) => c.parent_id === rootDbId && c.group_name === oldRawGroupName
      );
      for (const row of matching) {
        await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: row.id, group_name: newRaw }),
        });
      }
      setRenamingGroupRaw(null);
      await load();
    } catch (err: any) {
      alert("Rename failed: " + err.message);
    } finally {
      setDrawerBusy(false);
    }
  }

  async function deleteDrawerGroup(
    rootDbId: string,
    rawGroupName: string,
    title: string
  ) {
    const matching = all.filter(
      (c) => c.parent_id === rootDbId && c.group_name === rawGroupName
    );
    if (
      !confirm(
        `Delete custom sub-menu "${title}" and its ${matching.length} link(s)?`
      )
    ) {
      return;
    }
    setDrawerBusy(true);
    try {
      for (const row of matching) {
        await fetch(`/api/categories?id=${row.id}`, { method: "DELETE" });
      }
      setDrawerGroupIdx(null);
      await load();
    } catch (err: any) {
      alert("Delete sub-menu failed: " + err.message);
    } finally {
      setDrawerBusy(false);
    }
  }

  /* ----------------------- live page studio actions ----------------------- */

  function focusPreview(sec: PageSectionId, alsoOpenLeft = false) {
    setActiveSection(sec);
    if (alsoOpenLeft) {
      setOpenSec((prev) => ({ ...prev, [sec]: true }));
    }
    const container = previewScrollRef.current;
    const el = previewRefs.current[sec];
    if (container && el) {
      container.scrollTo({
        top: Math.max(0, el.offsetTop - 12),
        behavior: "smooth",
      });
    }
  }

  function updateDraft<K extends keyof PageConfig>(key: K, value: PageConfig[K]) {
    setDraftConfig((prev) => ({ ...prev, [key]: value }));
    setConfigDirty(true);
  }

  async function savePageConfig(slug: string) {
    const parent = rootBySlug(slug);
    if (!parent) {
      alert(`Main section "${slug}" not found`);
      return;
    }
    setSavingConfig(true);
    try {
      const targetSlug = `page-config-${slug}`;
      const existing = all.find(
        (c) =>
          (configRowId && c.id === configRowId) ||
          (c.group_name === "page_config" && c.slug === targetSlug)
      );

      const res = await fetch("/api/categories", {
        method: existing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          existing
            ? { id: existing.id, subtitle: JSON.stringify(draftConfig) }
            : {
                name: `${slug} Page Config`,
                slug: targetSlug,
                parent_id: parent.id,
                group_name: "page_config",
                subtitle: JSON.stringify(draftConfig),
                is_active: true,
                is_featured: false,
                sort_order: 99,
              }
        ),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setConfigDirty(false);
      await load();
    } catch (err: any) {
      alert("Could not save page banner & FAQs: " + err.message);
    } finally {
      setSavingConfig(false);
    }
  }

  /* ----------------------- small UI helpers ----------------------- */

  function Thumb({
    item,
    round,
    size = "w-12 h-12",
  }: {
    item: Cat;
    round?: boolean;
    size?: string;
  }) {
    return (
      <div
        className={`relative ${size} ${
          round ? "rounded-full" : "rounded-xl"
        } overflow-hidden bg-rose-50 border border-rose-200 shrink-0 group/thumb`}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className={`w-full h-full ${round ? "object-contain p-0.5" : "object-cover"}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-rose-500">
            {item.name.charAt(0)}
          </div>
        )}
        <label className="absolute inset-0 bg-black/55 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white text-xs cursor-pointer transition-opacity">
          📷
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) inlinePhoto(item.id, f);
            }}
          />
        </label>
      </div>
    );
  }

  function Row({ item, round }: { item: Cat; round?: boolean }) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-white p-3 flex items-center gap-3 hover:border-rose-300 transition-colors">
        <Thumb item={item} round={round} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs font-bold text-gray-900 leading-snug">
              {item.name}
            </p>
            {item.badge && (
              <span className="rounded bg-rose-100 px-1.5 text-[9px] font-extrabold text-rose-700 uppercase">
                {item.badge}
              </span>
            )}
          </div>
          {round && item.subtitle && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              Link: {item.subtitle}
            </p>
          )}
          {!round && item.subtitle && (
            <p className="text-[11px] text-gray-500 mt-0.5">{item.subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => openEdit(item)}
            className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => remove(item)}
            className="rounded-lg border border-rose-200 px-1.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  function PreviewShell({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800">{title}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700">
              LIVE PREVIEW
            </span>
          </div>
          <span className="text-[10px] text-gray-500">
            This is exactly how customers will see it on the store.
          </span>
        </div>
        <div className="relative rounded-xl border border-gray-200 bg-white">
          {children}
        </div>
      </div>
    );
  }

  /* ----------------------- tab bodies ----------------------- */

  function renderHomeTab() {
    const canGoLeft = clampedHomeOffset > 0;
    const canGoRight = clampedHomeOffset < maxHomeOffset;

    return (
      <div className="space-y-5">
        {/* TOP: Full-Width Live Preview Strip with Non-Overlapping Chevron Slider */}
        <PreviewShell title="Homepage category strip">
          <div className="flex items-center px-2 py-3 gap-1">
            {strip.length > HOME_VISIBLE_SLOTS && (
              <button
                type="button"
                disabled={!canGoLeft}
                onClick={() => setHomePageIdx((prev) => Math.max(0, Math.min(prev, maxHomeOffset) - 1))}
                aria-label="Previous category"
                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  canGoLeft
                    ? "bg-white border-zinc-200 shadow-sm text-zinc-700 hover:text-[#c8102e] hover:border-[#c8102e] cursor-pointer"
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
                  transform: `translateX(-${clampedHomeOffset * (100 / HOME_VISIBLE_SLOTS)}%)`,
                }}
                className="flex items-stretch transition-transform duration-300 ease-out divide-x divide-zinc-200/70"
              >
                {strip.map((s) => (
                  <div
                    key={s.id}
                    style={{ width: `${100 / Math.min(HOME_VISIBLE_SLOTS, Math.max(1, strip.length))}%` }}
                    className="shrink-0 flex flex-col items-center justify-start gap-1.5 px-2 py-1 text-center"
                  >
                    <div className="w-13 h-13 rounded-full border-2 border-rose-100 bg-white p-1.5 overflow-hidden shadow-2xs">
                      {s.image_url ? (
                        <img
                          src={s.image_url}
                          alt={s.name}
                          className="w-full h-full object-contain rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-rose-500">
                          {s.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-800 leading-tight whitespace-nowrap">
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {strip.length > HOME_VISIBLE_SLOTS && (
              <button
                type="button"
                disabled={!canGoRight}
                onClick={() =>
                  setHomePageIdx((prev) =>
                    Math.min(maxHomeOffset, Math.min(prev, maxHomeOffset) + 1)
                  )
                }
                aria-label="Next category"
                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  canGoRight
                    ? "bg-white border-zinc-200 shadow-sm text-zinc-700 hover:text-[#c8102e] hover:border-[#c8102e] cursor-pointer"
                    : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>
        </PreviewShell>

        {/* BOTTOM: Icons List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Homepage round icons ({strip.length})
              </h3>
              <p className="text-xs text-gray-500">
                Shown below the search bar. Hover over a photo to change it.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAdd("homepage")}
              className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer shrink-0"
            >
              + Add circle
            </button>
          </div>
          <div className="space-y-2">
            {strip.map((s) => (
              <Row key={s.id} item={s} round />
            ))}
            {strip.length === 0 && (
              <p className="text-xs text-gray-400">No circles yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderPageTab(slug: string) {
    const items = childrenOf(slug);
    const pageOccasions = occasionCardsFor(slug);
    const tabMeta = pageTabs.find((t) => t.id === slug) || {
      id: slug,
      label: slug,
      route: `/${slug}`,
    };
    const singular =
      slug === "cakes"
        ? "flavour / style"
        : slug === "flowers"
        ? "flower"
        : slug === "combos"
        ? "combo"
        : "filter pill";
    const breadcrumbName =
      slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: 4 Interactive Storefront Sections */}
        <div className="lg:col-span-7 space-y-4">
          {/* Page Header & Unsaved Sticky Save Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {tabMeta.label} Studio
              </h3>
              <a
                href={tabMeta.route}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#c8102e] hover:underline"
              >
                {tabMeta.route} ↗ open live page
              </a>
            </div>
            <div className="flex items-center gap-2">
              {configDirty && (
                <button
                  type="button"
                  onClick={() => {
                    const { config } = getPageConfigFromCategories(
                      all,
                      slug,
                      tabMeta.label
                    );
                    setDraftConfig(config);
                    setConfigDirty(false);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                disabled={savingConfig || !configDirty}
                onClick={() => savePageConfig(slug)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  configDirty
                    ? "bg-[#c8102e] text-white hover:bg-[#9b0b22] shadow-xs"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 opacity-90 cursor-default"
                }`}
              >
                {savingConfig
                  ? "Saving…"
                  : configDirty
                  ? "Save Banner & FAQs"
                  : "✓ All Saved"}
              </button>
            </div>
          </div>

          {/* Section Quick Jump Pills */}
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "hero", label: "🎨 1. Hero Banner" },
                { id: "occasions", label: `🎉 2. Occasion Cards (${pageOccasions.length})` },
                { id: "pills", label: `🏷️ 3. Filter Pills (${items.length})` },
                { id: "faqs", label: `❓ 4. FAQs (${draftConfig.faqs.length})` },
              ] as const
            ).map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => focusPreview(sec.id, true)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
                  activeSection === sec.id
                    ? "border-[#c8102e] bg-rose-50 text-[#c8102e]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* 1. TOP HERO BANNER & HEADINGS */}
          <div
            className={`rounded-2xl border bg-white overflow-hidden transition-all ${
              activeSection === "hero"
                ? "border-rose-300 ring-1 ring-rose-200"
                : "border-rose-100"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setOpenSec((p) => ({ ...p, hero: !p.hero }));
                focusPreview("hero");
              }}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gray-50/70 border-b border-gray-100 text-left cursor-pointer"
            >
              <div>
                <h4 className="text-xs font-extrabold text-gray-900">
                  🎨 1. Top Hero Banner &amp; Headings
                </h4>
                <p className="text-[10px] text-gray-500">
                  Type below to see live updates immediately on the right screen
                </p>
              </div>
              <Chevron rotated={openSec.hero} />
            </button>

            {openSec.hero && (
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Hero Main Heading
                    </label>
                    <input
                      type="text"
                      value={draftConfig.heroTitle}
                      onFocus={() => focusPreview("hero")}
                      onChange={(e) => {
                        focusPreview("hero");
                        updateDraft("heroTitle", e.target.value);
                      }}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Promo Pill (e.g. Use Code: CAKE15)
                    </label>
                    <input
                      type="text"
                      value={draftConfig.promoPill}
                      onFocus={() => focusPreview("hero")}
                      onChange={(e) => {
                        focusPreview("hero");
                        updateDraft("promoPill", e.target.value);
                      }}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-rose-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Hero Description
                  </label>
                  <textarea
                    rows={2}
                    value={draftConfig.heroDescription}
                    onFocus={() => focusPreview("hero")}
                    onChange={(e) => {
                      focusPreview("hero");
                      updateDraft("heroDescription", e.target.value);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Delivery Tagline (next to promo code)
                  </label>
                  <input
                    type="text"
                    value={draftConfig.deliveryNote}
                    onFocus={() => focusPreview("hero")}
                    onChange={(e) => {
                      focusPreview("hero");
                      updateDraft("deliveryNote", e.target.value);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-rose-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-gray-100">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Right Badge 1 Title
                    </label>
                    <input
                      type="text"
                      value={draftConfig.badge1Label}
                      onFocus={() => focusPreview("hero")}
                      onChange={(e) => updateDraft("badge1Label", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Right Badge 1 Value
                    </label>
                    <input
                      type="text"
                      value={draftConfig.badge1Value}
                      onFocus={() => focusPreview("hero")}
                      onChange={(e) => updateDraft("badge1Value", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Right Badge 2 Title
                    </label>
                    <input
                      type="text"
                      value={draftConfig.badge2Label}
                      onFocus={() => focusPreview("hero")}
                      onChange={(e) => updateDraft("badge2Label", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Right Badge 2 Value
                    </label>
                    <input
                      type="text"
                      value={draftConfig.badge2Value}
                      onFocus={() => focusPreview("hero")}
                      onChange={(e) => updateDraft("badge2Value", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Occasions Section Heading
                    </label>
                    <input
                      type="text"
                      value={draftConfig.occasionHeading}
                      onFocus={() => focusPreview("occasions")}
                      onChange={(e) => {
                        focusPreview("occasions");
                        updateDraft("occasionHeading", e.target.value);
                      }}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Occasions Subheading
                    </label>
                    <input
                      type="text"
                      value={draftConfig.occasionSubheading}
                      onFocus={() => focusPreview("occasions")}
                      onChange={(e) => {
                        focusPreview("occasions");
                        updateDraft("occasionSubheading", e.target.value);
                      }}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-rose-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. OCCASION CARDS */}
          <div
            className={`rounded-2xl border bg-white overflow-hidden transition-all ${
              activeSection === "occasions"
                ? "border-rose-300 ring-1 ring-rose-200"
                : "border-rose-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50/70 border-b border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setOpenSec((p) => ({ ...p, occasions: !p.occasions }));
                  focusPreview("occasions");
                }}
                className="flex items-center gap-2 text-left cursor-pointer flex-1"
              >
                <Chevron rotated={openSec.occasions} />
                <h4 className="text-xs font-extrabold text-gray-900">
                  🎉 2. Occasion Cards — Top of Page ({pageOccasions.length})
                </h4>
              </button>
              <button
                type="button"
                onClick={() => openAdd("page-occasion", { rootSlug: slug })}
                className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 cursor-pointer shrink-0"
              >
                + Add card
              </button>
            </div>

            {openSec.occasions && (
              <div className="p-3 space-y-2">
                {pageOccasions.map((o) => (
                  <Row key={o.id} item={o} />
                ))}
                {pageOccasions.length === 0 && (
                  <p className="text-xs text-gray-400 p-2">No occasion cards yet.</p>
                )}
              </div>
            )}
          </div>

          {/* 3. FILTER PILLS */}
          <div
            className={`rounded-2xl border bg-white overflow-hidden transition-all ${
              activeSection === "pills"
                ? "border-rose-300 ring-1 ring-rose-200"
                : "border-rose-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50/70 border-b border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setOpenSec((p) => ({ ...p, pills: !p.pills }));
                  focusPreview("pills");
                }}
                className="flex items-center gap-2 text-left cursor-pointer flex-1"
              >
                <Chevron rotated={openSec.pills} />
                <h4 className="text-xs font-extrabold text-gray-900">
                  🏷️ 3. Filter Pills — Below Occasion Cards ({items.length})
                </h4>
              </button>
              <button
                type="button"
                onClick={() => openAdd("page-filter", { rootSlug: slug })}
                className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 cursor-pointer shrink-0"
              >
                + Add {singular}
              </button>
            </div>

            {openSec.pills && (
              <div className="p-3 space-y-2">
                {items.map((c) => (
                  <Row key={c.id} item={c} />
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-gray-400 p-2">Nothing added yet.</p>
                )}
              </div>
            )}
          </div>

          {/* 4. BOTTOM FAQS */}
          <div
            className={`rounded-2xl border bg-white overflow-hidden transition-all ${
              activeSection === "faqs"
                ? "border-rose-300 ring-1 ring-rose-200"
                : "border-rose-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50/70 border-b border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setOpenSec((p) => ({ ...p, faqs: !p.faqs }));
                  focusPreview("faqs");
                }}
                className="flex items-center gap-2 text-left cursor-pointer flex-1"
              >
                <Chevron rotated={openSec.faqs} />
                <h4 className="text-xs font-extrabold text-gray-900">
                  ❓ 4. Bottom FAQs ({draftConfig.faqs.length})
                </h4>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenSec((p) => ({ ...p, faqs: true }));
                  focusPreview("faqs");
                  updateDraft("faqs", [
                    ...draftConfig.faqs,
                    { q: "New question?", a: "Write your answer here..." },
                  ]);
                  setPreviewFaqIdx(draftConfig.faqs.length);
                }}
                className="rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-[11px] font-bold text-[#c8102e] hover:bg-rose-50 cursor-pointer shrink-0"
              >
                + Add FAQ
              </button>
            </div>

            {openSec.faqs && (
              <div className="p-4 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    FAQ Section Heading
                  </label>
                  <input
                    type="text"
                    value={draftConfig.faqHeading}
                    onFocus={() => focusPreview("faqs")}
                    onChange={(e) => {
                      focusPreview("faqs");
                      updateDraft("faqHeading", e.target.value);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-rose-600"
                  />
                </div>

                <div className="space-y-2.5">
                  {draftConfig.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase text-gray-400">
                          Question #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            focusPreview("faqs");
                            updateDraft(
                              "faqs",
                              draftConfig.faqs.filter((_, i) => i !== idx)
                            );
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          × Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.q}
                        onFocus={() => {
                          focusPreview("faqs");
                          setPreviewFaqIdx(idx);
                        }}
                        onChange={(e) => {
                          focusPreview("faqs");
                          setPreviewFaqIdx(idx);
                          const next = draftConfig.faqs.map((item, i) =>
                            i === idx ? { ...item, q: e.target.value } : item
                          );
                          updateDraft("faqs", next);
                        }}
                        placeholder="Question"
                        className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={faq.a}
                        onFocus={() => {
                          focusPreview("faqs");
                          setPreviewFaqIdx(idx);
                        }}
                        onChange={(e) => {
                          focusPreview("faqs");
                          setPreviewFaqIdx(idx);
                          const next = draftConfig.faqs.map((item, i) =>
                            i === idx ? { ...item, a: e.target.value } : item
                          );
                          updateDraft("faqs", next);
                        }}
                        placeholder="Answer"
                        className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    disabled={savingConfig || !configDirty}
                    onClick={() => savePageConfig(slug)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      configDirty
                        ? "bg-[#c8102e] text-white hover:bg-[#9b0b22]"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                    }`}
                  >
                    {savingConfig
                      ? "Saving…"
                      : configDirty
                      ? "Save Banner & FAQs"
                      : "✓ Banner & FAQs Saved"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Clean Rectangular Live Preview */}
        {(() => {
          const renderScreenContent = (isExpanded = false) => (
            <div
              style={
                isExpanded
                  ? undefined
                  : { zoom: previewDevice === "desktop" ? 0.56 : 0.72 }
              }
              className={`bg-white transition-all duration-200 overflow-hidden ${
                previewDevice === "mobile"
                  ? "max-w-[345px] mx-auto"
                  : "w-full"
              }`}
            >
              {/* Mini Store Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 bg-white">
                <div className="flex items-center gap-2.5">
                  <span className="text-zinc-700 text-sm">☰</span>
                  <span className="w-6 h-6 rounded-full border border-[#c8102e] text-[9px] font-black text-[#c8102e] flex items-center justify-center">
                    MS
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                    Delivering to 700091
                  </span>
                </div>
                <span className="text-xs text-zinc-400">🔍 🤍 🛒</span>
              </div>

              {/* Mini Breadcrumb */}
              <div className="bg-zinc-50 border-b border-zinc-100 px-4 py-1 text-[11px] text-zinc-500">
                Home / <span className="font-semibold text-zinc-800">{breadcrumbName}</span>
              </div>

              <div className="p-4 space-y-5">
                {/* PREVIEW BLOCK 1: HERO BANNER */}
                <div
                  ref={
                    isExpanded
                      ? undefined
                      : (el) => {
                          previewRefs.current.hero = el;
                        }
                  }
                  onClick={() => {
                    setActiveSection("hero");
                    setOpenSec((p) => ({ ...p, hero: true }));
                  }}
                  className={`rounded-2xl cursor-pointer transition-all ${
                    activeSection === "hero" ? "ring-2 ring-rose-500 ring-offset-2" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#881337] via-[#9f1239] to-[#be123c] text-white p-5 flex ${
                      previewDevice === "mobile"
                        ? "flex-col gap-3"
                        : "flex-row items-center justify-between gap-4"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h4
                        className={`font-extrabold leading-tight ${
                          previewDevice === "mobile" ? "text-lg" : "text-2xl"
                        }`}
                      >
                        {draftConfig.heroTitle || "Page Hero Heading"}
                      </h4>
                      <p className="text-xs text-rose-100 leading-relaxed">
                        {draftConfig.heroDescription || "Description goes here..."}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1.5">
                        {draftConfig.promoPill && (
                          <span className="rounded-full bg-white text-rose-950 px-3 py-1 text-[11px] font-bold">
                            {draftConfig.promoPill}
                          </span>
                        )}
                        {draftConfig.deliveryNote && (
                          <span className="text-[11px] font-semibold text-rose-100">
                            {draftConfig.deliveryNote}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex gap-2 shrink-0 ${
                        previewDevice === "mobile" ? "flex-row flex-wrap" : "flex-col"
                      }`}
                    >
                      <div className="bg-black/20 border border-white/10 rounded-xl px-3 py-1.5">
                        <p className="text-[9px] uppercase font-bold text-rose-200">
                          {draftConfig.badge1Label}
                        </p>
                        <p className="text-[11px] font-bold text-white">
                          {draftConfig.badge1Value}
                        </p>
                      </div>
                      <div className="bg-black/20 border border-white/10 rounded-xl px-3 py-1.5">
                        <p className="text-[9px] uppercase font-bold text-rose-200">
                          {draftConfig.badge2Label}
                        </p>
                        <p className="text-[11px] font-bold text-white">
                          {draftConfig.badge2Value}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PREVIEW BLOCK 2: OCCASION CARDS */}
                <div
                  ref={
                    isExpanded
                      ? undefined
                      : (el) => {
                          previewRefs.current.occasions = el;
                        }
                  }
                  onClick={() => {
                    setActiveSection("occasions");
                    setOpenSec((p) => ({ ...p, occasions: true }));
                  }}
                  className={`rounded-xl p-1 cursor-pointer transition-all ${
                    activeSection === "occasions"
                      ? "ring-2 ring-rose-500 ring-offset-2"
                      : ""
                  }`}
                >
                  <div className="mb-2.5">
                    <h5 className="text-base font-extrabold text-zinc-900">
                      {draftConfig.occasionHeading}
                    </h5>
                    <p className="text-xs text-zinc-500">
                      {draftConfig.occasionSubheading}
                    </p>
                  </div>
                  {pageOccasions.length > 0 ? (
                    <div
                      className={`grid gap-2.5 ${
                        previewDevice === "mobile" ? "grid-cols-2" : "grid-cols-4"
                      }`}
                    >
                      {pageOccasions.map((o) => (
                        <div
                          key={o.id}
                          className="rounded-xl border border-zinc-200 bg-[#fdf9f7] overflow-hidden"
                        >
                          <div className="aspect-square bg-rose-50">
                            {o.image_url && (
                              <img
                                src={o.image_url}
                                alt={o.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="p-2 text-center bg-white">
                            <p className="text-[11px] font-bold leading-tight text-zinc-900">
                              {o.name}
                            </p>
                            {o.subtitle && (
                              <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                                {o.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-2">
                      No occasion cards added yet.
                    </p>
                  )}
                </div>

                {/* PREVIEW BLOCK 3: FILTER PHOTO-PILLS */}
                <div
                  ref={
                    isExpanded
                      ? undefined
                      : (el) => {
                          previewRefs.current.pills = el;
                        }
                  }
                  onClick={() => {
                    setActiveSection("pills");
                    setOpenSec((p) => ({ ...p, pills: true }));
                  }}
                  className={`rounded-xl p-1 cursor-pointer transition-all ${
                    activeSection === "pills" ? "ring-2 ring-rose-500 ring-offset-2" : ""
                  }`}
                >
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-2">
                    Category Filter Pills ({items.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8102e] text-white px-3 py-1.5 text-xs font-bold">
                      All {breadcrumbName}
                      <span className="rounded-full bg-white/20 px-1.5 text-[10px]">
                        {items.length}
                      </span>
                    </span>
                    {items.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white pl-1 pr-2.5 py-1 text-xs font-semibold text-zinc-800"
                      >
                        <span className="w-6 h-6 rounded-full overflow-hidden bg-rose-50 border border-rose-100 shrink-0 flex items-center justify-center">
                          {c.image_url ? (
                            <img
                              src={c.image_url}
                              alt={c.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[9px] font-bold text-rose-500">
                              {c.name.charAt(0)}
                            </span>
                          )}
                        </span>
                        <span>{c.name}</span>
                        {c.badge && (
                          <span className="rounded-full bg-rose-100 px-1.5 text-[9px] font-extrabold text-[#c8102e] uppercase">
                            {c.badge}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PREVIEW BLOCK 4: BOTTOM FAQS ACCORDION */}
                <div
                  ref={
                    isExpanded
                      ? undefined
                      : (el) => {
                          previewRefs.current.faqs = el;
                        }
                  }
                  onClick={() => {
                    setActiveSection("faqs");
                    setOpenSec((p) => ({ ...p, faqs: true }));
                  }}
                  className={`rounded-xl border-t border-zinc-200 pt-4 p-1 cursor-pointer transition-all ${
                    activeSection === "faqs" ? "ring-2 ring-rose-500 ring-offset-2" : ""
                  }`}
                >
                  <h5 className="text-sm font-extrabold text-zinc-900 mb-2.5">
                    {draftConfig.faqHeading}
                  </h5>
                  <div className="space-y-2">
                    {draftConfig.faqs.map((faq, fIdx) => {
                      const isOpen = previewFaqIdx === fIdx;
                      return (
                        <div
                          key={fIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSection("faqs");
                            setPreviewFaqIdx(isOpen ? null : fIdx);
                          }}
                          className="border border-zinc-200 rounded-xl bg-white overflow-hidden"
                        >
                          <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs font-bold text-zinc-900">
                            <span>{faq.q || "(Untitled question)"}</span>
                            <span className="text-zinc-400 shrink-0 text-sm">
                              {isOpen ? "−" : "+"}
                            </span>
                          </div>
                          {isOpen && (
                            <div className="px-3.5 pb-3 pt-1.5 text-[11px] text-zinc-600 border-t border-zinc-100 leading-relaxed">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );

          return (
            <>
              <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-2.5">
                {/* Top Controls Row (above monitor) */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                      configDirty
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {configDirty ? "● Unsaved Live Draft" : "● Live Sync"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-0.5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("desktop")}
                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          previewDevice === "desktop"
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        💻 Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("mobile")}
                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          previewDevice === "mobile"
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        📱 Phone
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMonitorExpanded(true)}
                      className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                      title="Expand full-screen preview"
                    >
                      ⛶ Expand
                    </button>
                  </div>
                </div>

                {/* Clean Rectangular Thin-Border Frame (Desktop & Phone) */}
                <div
                  className={`mx-auto transition-all duration-200 rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden ${
                    previewDevice === "mobile" ? "max-w-[260px]" : "w-full"
                  }`}
                >
                  <div
                    ref={previewScrollRef}
                    className="bg-white overflow-y-auto h-[380px] [scrollbar-width:thin]"
                  >
                    {renderScreenContent(false)}
                  </div>
                </div>

                <p className="text-[10px] text-center text-gray-400">
                  Click any section inside the preview to edit it on the left.
                </p>
              </div>

              {/* Expanded Full-Screen Preview Modal */}
              {monitorExpanded && (
                <div
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                  onClick={() => setMonitorExpanded(false)}
                >
                  <div
                    className="w-full max-w-5xl rounded-2xl bg-white p-3 shadow-2xl border border-gray-200 flex flex-col max-h-[92vh]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2.5 border-b border-gray-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-gray-900">
                          Live Full-Screen Preview — localhost:3000{tabMeta.route}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setPreviewDevice("desktop")}
                            className={`px-2.5 py-1 rounded-md cursor-pointer ${
                              previewDevice === "desktop"
                                ? "bg-gray-900 text-white"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            💻 Desktop
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewDevice("mobile")}
                            className={`px-2.5 py-1 rounded-md cursor-pointer ${
                              previewDevice === "mobile"
                                ? "bg-gray-900 text-white"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            📱 Phone
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMonitorExpanded(false)}
                          className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 text-xs font-bold cursor-pointer"
                        >
                          ✕ Close Full Screen
                        </button>
                      </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-3 bg-gray-50/50">
                      <div
                        className={`mx-auto rounded-xl border border-gray-200 bg-white overflow-hidden ${
                          previewDevice === "mobile" ? "max-w-[360px]" : "w-full"
                        }`}
                      >
                        {renderScreenContent(true)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    );
  }

  function renderDrawerTab() {
    const activeCat = drawerCatId
      ? drawerNav.find((c) => c.id === drawerCatId) || null
      : null;
    const activeGrp =
      activeCat &&
      drawerGroupIdx !== null &&
      drawerGroupIdx < activeCat.groups.length
        ? activeCat.groups[drawerGroupIdx]
        : null;

    function addLinkTargetForSyncGroup(catId: string, grpId: string): {
      placement: Placement;
      rootSlug: string;
    } {
      if (catId === "occasions") {
        if (grpId === "occ-flowers") return { placement: "page-occasion", rootSlug: "flowers" };
        if (grpId === "occ-combos") return { placement: "page-occasion", rootSlug: "combos" };
        return { placement: "page-occasion", rootSlug: "cakes" };
      }
      if (grpId.endsWith("-occasion")) {
        return { placement: "page-occasion", rootSlug: catId };
      }
      return { placement: "page-filter", rootSlug: catId };
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Interactive 3-Column App Drawer Editor (☰ Menu)
            </h3>
            <p className="text-xs text-gray-500">
              Click any section in Column 1 → edit sub-menus in Column 2 → edit
              filter links in Column 3. Storefront opens all columns closed until
              clicked.
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700">
            LIVE SYNC WITH STOREFRONT ☰
          </span>
        </div>

        {/* Interactive 3-Column Editor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs min-h-[430px]">
          {/* COLUMN 1: MAIN SECTIONS */}
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600">
                1. Main Sections ({roots.length})
              </span>
              <button
                type="button"
                onClick={() => openAdd("new-page", { fromDrawer: true })}
                className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 cursor-pointer"
              >
                + Add Section
              </button>
            </div>

            <div className="flex-1 divide-y divide-gray-100 overflow-y-auto max-h-[420px]">
              {drawerNav.map((c) => {
                const isActive = activeCat?.id === c.id;
                const rootRow = roots.find((r) => r.id === c.dbId || r.slug === c.id);
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 border-l-4 transition-colors ${
                      isActive
                        ? "border-[#c8102e] bg-rose-50/50"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    {rootRow && <Thumb item={rootRow} size="w-9 h-9" />}

                    <button
                      type="button"
                      onClick={() => {
                        setAddingSubMenu(false);
                        setRenamingGroupRaw(null);
                        if (drawerCatId === c.id) {
                          setDrawerCatId(null);
                          setDrawerGroupIdx(null);
                        } else {
                          setDrawerCatId(c.id);
                          setDrawerGroupIdx(null);
                        }
                      }}
                      className="flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <p
                        className={`text-xs leading-snug break-words ${
                          isActive ? "font-bold text-[#c8102e]" : "font-semibold text-gray-900"
                        }`}
                      >
                        {c.label}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-snug break-words mt-0.5">
                        {c.href} {c.subtitle ? `• ${c.subtitle}` : ""}
                      </p>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      {rootRow && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(rootRow)}
                            className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(rootRow)}
                            className="rounded border border-rose-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete section"
                          >
                            ×
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setAddingSubMenu(false);
                          setRenamingGroupRaw(null);
                          if (drawerCatId === c.id) {
                            setDrawerCatId(null);
                            setDrawerGroupIdx(null);
                          } else {
                            setDrawerCatId(c.id);
                            setDrawerGroupIdx(null);
                          }
                        }}
                        className="p-0.5 cursor-pointer"
                        aria-label={`Toggle ${c.label}`}
                      >
                        <Chevron rotated={isActive} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: SUB-MENUS / FILTER BUCKETS */}
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600">
                2. {activeCat ? `Sub-Menus (${activeCat.groups.length})` : "Filter Sub-Menus"}
              </span>
              {activeCat && (
                <button
                  type="button"
                  onClick={() => {
                    setNewSubMenuTitle("");
                    setAddingSubMenu((v) => !v);
                  }}
                  className="rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-[11px] font-bold text-[#c8102e] hover:bg-rose-50 cursor-pointer shrink-0"
                >
                  + Add Sub-Menu
                </button>
              )}
            </div>

            {!activeCat ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                <p className="text-xs font-semibold text-gray-500">
                  ← Click a Main Section in Column 1
                </p>
                <p className="text-[11px] mt-1">
                  Its filter buckets (Flavour, Occasion, Price, etc.) will open here.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-y-auto max-h-[420px]">
                {addingSubMenu && (
                  <div className="p-2.5 bg-rose-50/70 border-b border-rose-200 space-y-2">
                    <p className="text-[10px] font-bold uppercase text-rose-700">
                      New sub-menu inside {activeCat.label}
                    </p>
                    <input
                      type="text"
                      value={newSubMenuTitle}
                      onChange={(e) => setNewSubMenuTitle(e.target.value)}
                      placeholder="e.g. Cakes by Theme"
                      className="w-full rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs focus:outline-rose-600"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAddingSubMenu(false)}
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] font-semibold text-gray-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!newSubMenuTitle.trim()}
                        onClick={() => {
                          const title = newSubMenuTitle.trim();
                          setAddingSubMenu(false);
                          openAdd("drawer-link", {
                            rootSlug: activeCat.id,
                            groupTitle: title,
                            fromDrawer: true,
                          });
                        }}
                        className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                      >
                        Create &amp; Add 1st Link →
                      </button>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-gray-100">
                  {activeCat.groups.map((grp, idx) => {
                    const isActive = drawerGroupIdx === idx;
                    const isCustom = grp.source === "drawer-custom";
                    const isRenaming =
                      isCustom && grp.rawGroupName && renamingGroupRaw === grp.rawGroupName;

                    return (
                      <div
                        key={grp.id}
                        className={`px-3 py-2.5 border-l-4 transition-colors ${
                          isActive
                            ? "border-[#c8102e] bg-rose-50/40"
                            : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        {isRenaming && activeCat.dbId && grp.rawGroupName ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={renameGroupTitle}
                              onChange={(e) => setRenameGroupTitle(e.target.value)}
                              className="w-full rounded-lg border border-rose-300 bg-white px-2 py-1 text-xs font-semibold"
                            />
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setRenamingGroupRaw(null)}
                                className="rounded border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={drawerBusy || !renameGroupTitle.trim()}
                                onClick={() =>
                                  renameDrawerGroup(
                                    activeCat.dbId!,
                                    grp.rawGroupName!,
                                    renameGroupTitle
                                  )
                                }
                                className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white cursor-pointer disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDrawerGroupIdx((prev) => (prev === idx ? null : idx))
                              }
                              className="flex-1 min-w-0 text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-xs leading-snug break-words ${
                                    isActive
                                      ? "font-bold text-[#c8102e]"
                                      : "font-semibold text-gray-800"
                                  }`}
                                >
                                  {grp.title}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  ({grp.items.length})
                                </span>
                              </div>
                              <div className="mt-0.5">
                                {isCustom ? (
                                  <span className="inline-flex items-center rounded bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                                    ✏️ Custom
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded bg-sky-50 border border-sky-200 px-1.5 py-0.2 text-[9px] font-bold text-sky-700">
                                    🔗 Auto-Sync
                                  </span>
                                )}
                              </div>
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              {isCustom && grp.rawGroupName && activeCat.dbId && (
                                <>
                                  <button
                                    type="button"
                                    disabled={drawerBusy}
                                    onClick={() => {
                                      setRenamingGroupRaw(grp.rawGroupName!);
                                      setRenameGroupTitle(grp.title);
                                    }}
                                    className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                                    title="Rename sub-menu"
                                  >
                                    ✎
                                  </button>
                                  <button
                                    type="button"
                                    disabled={drawerBusy}
                                    onClick={() =>
                                      deleteDrawerGroup(
                                        activeCat.dbId!,
                                        grp.rawGroupName!,
                                        grp.title
                                      )
                                    }
                                    className="rounded border border-rose-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    title="Delete sub-menu"
                                  >
                                    ×
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setDrawerGroupIdx((prev) => (prev === idx ? null : idx))
                                }
                                className="p-0.5 cursor-pointer"
                                aria-label={`Toggle ${grp.title}`}
                              >
                                <Chevron rotated={isActive} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {activeCat.groups.length === 0 && (
                    <p className="p-4 text-xs text-gray-400 text-center">
                      No sub-menus yet. Click &quot;+ Add Sub-Menu&quot; above.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 3: FILTER LINKS INSIDE SELECTED SUB-MENU */}
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600">
                3. {activeGrp ? `Links (${activeGrp.items.length})` : "Filter Links"}
              </span>
              {activeCat && activeGrp && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeGrp.source === "drawer-custom") {
                      openAdd("drawer-link", {
                        rootSlug: activeCat.id,
                        groupTitle: activeGrp.title,
                        fromDrawer: true,
                      });
                    } else {
                      const target = addLinkTargetForSyncGroup(activeCat.id, activeGrp.id);
                      openAdd(target.placement, {
                        rootSlug: target.rootSlug,
                        fromDrawer: true,
                      });
                    }
                  }}
                  className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 cursor-pointer shrink-0"
                >
                  + Add Link
                </button>
              )}
            </div>

            {!activeCat || !activeGrp ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                <p className="text-xs font-semibold text-gray-500">
                  ← Click a Sub-Menu in Column 2
                </p>
                <p className="text-[11px] mt-1">
                  View, edit, or add individual clickable filter links here.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-y-auto max-h-[420px]">
                <div
                  className={`px-3 py-2 text-[10px] font-semibold border-b ${
                    activeGrp.source === "drawer-custom"
                      ? "bg-amber-50/70 border-amber-100 text-amber-800"
                      : "bg-sky-50/70 border-sky-100 text-sky-800"
                  }`}
                >
                  {activeGrp.source === "drawer-custom"
                    ? `✏️ Custom drawer filter links inside "${activeGrp.title}"`
                    : activeGrp.source === "sync-occasion"
                    ? `🔗 Auto-synced with Occasion cards — edits here also update the page`
                    : `🔗 Auto-synced with Filter pills — edits here also update the page`}
                </div>

                <div className="flex-1 divide-y divide-gray-100">
                  {activeGrp.items.map((item) => {
                    const cat = item.dbId ? all.find((x) => x.id === item.dbId) : null;
                    return (
                      <div
                        key={`${item.label}-${item.href}-${item.dbId || "x"}`}
                        className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-rose-50/30"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-gray-900 leading-snug break-words">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="rounded bg-rose-100 px-1 text-[8px] font-extrabold text-[#c8102e] uppercase">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 break-all leading-snug">
                            {item.href}
                          </p>
                        </div>

                        {cat && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEdit(cat)}
                              className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(cat)}
                              className="rounded border border-rose-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Delete link"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {activeGrp.items.length === 0 && (
                    <p className="p-4 text-xs text-gray-400 text-center">
                      No links yet in &quot;{activeGrp.title}&quot;.
                    </p>
                  )}
                </div>

                <div className="p-2.5 border-t border-gray-100 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeGrp.source === "drawer-custom") {
                        openAdd("drawer-link", {
                          rootSlug: activeCat.id,
                          groupTitle: activeGrp.title,
                          fromDrawer: true,
                        });
                      } else {
                        const target = addLinkTargetForSyncGroup(
                          activeCat.id,
                          activeGrp.id
                        );
                        openAdd(target.placement, {
                          rootSlug: target.rootSlug,
                          fromDrawer: true,
                        });
                      }
                    }}
                    className="w-full rounded-xl border border-dashed border-rose-300 bg-white py-2 text-[11px] font-bold text-[#c8102e] hover:bg-rose-50 cursor-pointer"
                  >
                    + Add Link to &quot;{activeGrp.title}&quot;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------- render ----------------------- */

  const modalTitle = editing
    ? `Edit: ${editing.name}`
    : placement === "new-page"
    ? "Add New Storefront Page"
    : placement === "drawer-link"
    ? `Add Link to "${drawerGroupTitle}"`
    : "Add new";

  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-5 md:p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Categories &amp; Drawer</h2>
          <p className="text-xs text-gray-500">
            Edit each page tab, add new storefront pages, or customize the global ☰
            App Drawer. Photos upload to ImageKit.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAdd()}
          className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
        >
          + Add New
        </button>
      </div>

      {/* Tab Bar: Storefront Page Tabs + Add Page | Global App Drawer */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("home")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
            tab === "home"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-white text-gray-600 border border-rose-100 hover:bg-rose-50"
          }`}
        >
          <span>🏠</span>
          <span>Homepage</span>
        </button>

        {pageTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
              tab === t.id
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-gray-600 border border-rose-100 hover:bg-rose-50"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => openAdd("new-page")}
          className="flex items-center gap-1 rounded-xl border border-dashed border-rose-300 bg-rose-50/40 px-3 py-2 text-xs font-bold text-[#c8102e] hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <span>+</span>
          <span>Add Page</span>
        </button>

        <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => setTab("drawer")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
            tab === "drawer"
              ? "bg-gray-900 text-white shadow-xs"
              : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <span>☰</span>
          <span>App Drawer (Menu)</span>
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 py-10 text-center">Loading…</p>
      ) : tab === "home" ? (
        renderHomeTab()
      ) : tab === "drawer" ? (
        renderDrawerTab()
      ) : (
        renderPageTab(tab)
      )}

      {/* ------------------------- Wizard modal ------------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">{modalTitle}</h3>
                {!editing && placement !== "new-page" && placement !== "drawer-link" && (
                  <p className="text-[11px] text-gray-400">Step {step} / 2</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* STEP 1: where */}
            {step === 1 && !editing && (
              <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Where do you want to add it?
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setPlacement("homepage");
                    setStep(2);
                  }}
                  className="w-full flex items-center gap-3 rounded-2xl border border-rose-100 hover:border-rose-400 hover:bg-rose-50/50 p-3 text-left transition-colors cursor-pointer"
                >
                  <span className="text-2xl">🏠</span>
                  <span>
                    <span className="block text-xs font-bold text-gray-900">
                      Homepage circle
                    </span>
                    <span className="block text-[11px] text-gray-500">
                      Round icons below the search bar
                    </span>
                  </span>
                </button>

                {pageTabs.map((pt) => (
                  <React.Fragment key={pt.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPlacement("page-filter");
                        setTargetRootSlug(pt.id);
                        setStep(2);
                      }}
                      className="w-full flex items-center gap-3 rounded-2xl border border-rose-100 hover:border-rose-400 hover:bg-rose-50/50 p-3 text-left transition-colors cursor-pointer"
                    >
                      <span className="text-2xl">{pt.icon}</span>
                      <span>
                        <span className="block text-xs font-bold text-gray-900">
                          {pt.label} filter pill
                        </span>
                        <span className="block text-[11px] text-gray-500">
                          Filter chips on {pt.route}
                        </span>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPlacement("page-occasion");
                        setTargetRootSlug(pt.id);
                        setStep(2);
                      }}
                      className="w-full flex items-center gap-3 rounded-2xl border border-rose-100 hover:border-rose-400 hover:bg-rose-50/50 p-3 text-left transition-colors cursor-pointer"
                    >
                      <span className="text-2xl">🎉</span>
                      <span>
                        <span className="block text-xs font-bold text-gray-900">
                          {pt.label} occasion card
                        </span>
                        <span className="block text-[11px] text-gray-500">
                          Large cards at the top of {pt.route}
                        </span>
                      </span>
                    </button>
                  </React.Fragment>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setPlacement("new-page");
                    setStep(2);
                  }}
                  className="w-full flex items-center gap-3 rounded-2xl border border-dashed border-rose-300 bg-rose-50/40 hover:border-rose-500 hover:bg-rose-50 p-3 text-left transition-colors cursor-pointer"
                >
                  <span className="text-2xl">➕</span>
                  <span>
                    <span className="block text-xs font-bold text-[#c8102e]">
                      New Storefront Page
                    </span>
                    <span className="block text-[11px] text-gray-500">
                      Creates a new page tab &amp; App Drawer section
                    </span>
                  </span>
                </button>
              </div>
            )}

            {/* STEP 2: details */}
            {step === 2 && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {placement === "new-page"
                      ? "Page Name *"
                      : placement === "drawer-link"
                      ? "Link Label *"
                      : "Name *"}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      placement === "new-page"
                        ? "e.g. Indoor Plants"
                        : placement === "drawer-link"
                        ? "e.g. Under ₹599"
                        : "e.g. Lotus Biscoff Cake"
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-rose-600"
                  />
                  {placement === "new-page" && name.trim() && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Default route: <code className="font-mono">/{slugify(name)}</code>
                    </p>
                  )}
                </div>

                {(placement === "homepage" ||
                  placement === "drawer-link" ||
                  placement === "new-page" ||
                  placement === "root") && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {placement === "homepage" || placement === "drawer-link"
                        ? "Target URL *"
                        : "Page Route URL (optional)"}
                    </label>
                    <input
                      type="text"
                      list="link-suggestions"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder={
                        placement === "new-page"
                          ? name.trim()
                            ? `/${slugify(name)}`
                            : "/plants"
                          : "/cakes"
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    />
                    <datalist id="link-suggestions">
                      {LINK_SUGGESTIONS.map((l) => (
                        <option key={l} value={l} />
                      ))}
                    </datalist>
                  </div>
                )}

                {placement !== "homepage" && placement !== "drawer-link" && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Short subtitle (optional)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder={
                        placement === "new-page"
                          ? "e.g. Lucky Bamboo, Snake Plant & Planters"
                          : ""
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    />
                  </div>
                )}

                {placement !== "homepage" &&
                  placement !== "root" &&
                  placement !== "new-page" && (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Badge (optional)
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {["", "BESTSELLER", "TRENDING", "TOP PICK", "PREMIUM"].map(
                          (b) => (
                            <button
                              key={b || "none"}
                              type="button"
                              onClick={() => setBadge(b)}
                              className={`rounded-full px-3 py-1 text-[11px] font-bold border cursor-pointer ${
                                badge === b
                                  ? "bg-rose-600 text-white border-rose-600"
                                  : "bg-white text-gray-600 border-gray-200 hover:bg-rose-50"
                              }`}
                            >
                              {b || "None"}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {placement === "new-page" && !editing && (
                  <label className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addStripOnPageCreate}
                      onChange={(e) => setAddStripOnPageCreate(e.target.checked)}
                      className="accent-rose-600"
                    />
                    <span className="text-[11px] font-semibold text-gray-800">
                      Also add circular icon to Homepage Strip
                    </span>
                  </label>
                )}

                {placement !== "drawer-link" && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadFile(f);
                          if (url) setImageUrl(url);
                        }
                      }}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 cursor-pointer"
                    />
                    {uploading && (
                      <p className="text-[11px] text-amber-600 mt-1">Uploading…</p>
                    )}
                    {imageUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={imageUrl}
                          alt="preview"
                          className="w-12 h-12 rounded-xl object-cover border border-rose-200"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex justify-between gap-2 border-t border-rose-100">
                  {!editing && placement !== "new-page" && placement !== "drawer-link" ? (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    disabled={!name.trim() || saving || uploading}
                    onClick={save}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving…" : editing ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
