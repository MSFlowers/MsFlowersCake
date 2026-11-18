"use client";
// @refresh reset

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAVIGATION_CATEGORIES } from "../data/navigation";
import { formatCategoriesForNav } from "../lib/db";
import { Product } from "../data/types";
import {
  CustomerUser,
  getStoredCustomer,
  logoutCustomer,
} from "../lib/customerAuth";
import {
  moveAllWishlistToCart,
  moveWishlistToCart,
  removeFromCart,
  setCartOpen,
  setPincodeInfo,
  setWishlistOpen,
  toggleWishlist,
  updateCartQuantity,
  useShopState,
} from "../data/shopState";

function getProductHref(product: Product) {
  if (!product.slug) {
    return product.id.startsWith("ck")
      ? "/cakes"
      : product.id.startsWith("cb")
      ? "/combos"
      : "/flowers";
  }
  return product.id.startsWith("ck")
    ? `/cakes/${product.slug}`
    : product.id.startsWith("cb")
    ? `/combos/${product.slug}`
    : `/flowers/${product.slug}`;
}

interface KolkataArea {
  name: string;
  pincode: string;
  tag?: string;
}

const KOLKATA_AREAS: KolkataArea[] = [
  { name: "Chingrighata", pincode: "700105", tag: "45 Min Hub" },
  { name: "Salt Lake Sec I–V", pincode: "700091" },
  { name: "New Town / Action Area", pincode: "700156" },
  { name: "Park Street / Central", pincode: "700016" },
  { name: "Ballygunge / Gariahat", pincode: "700019" },
  { name: "Lake Town / Dum Dum", pincode: "700089" },
  { name: "Tollygunge / Jadavpur", pincode: "700032" },
  { name: "Behala / New Alipore", pincode: "700034" },
  { name: "Howrah Station Area", pincode: "711101" },
];

const POPULAR_SEARCHES = [
  { label: "Red Roses Bouquet", href: "/flowers?category=roses" },
  { label: "Chocolate Truffle Cake", href: "/cakes?category=chocolate" },
  { label: "Red Roses + Cake Combo", href: "/combos?category=roses-cake" },
  { label: "Red Velvet & Butterscotch Cake", href: "/cakes?category=red-velvet" },
  { label: "Bento & Photo Cakes", href: "/cakes?category=bento" },
  { label: "Orchids & Lilies Bouquet", href: "/flowers?category=orchids" },
];

const WHATSAPP_ORDER_URL =
  "https://wa.me/916295233296?text=Hi%20MS%20Flowers%20%26%20Cake%2C%20I%20want%20to%20place%20an%20order%20in%20Kolkata";

export default function Header() {
  const {
    cart,
    wishlist,
    selectedPincode,
    selectedAreaLabel,
    cartOpen,
    wishlistOpen,
    totalCartCount,
    wishlistCount,
    itemsSubtotal,
    addonsSubtotal,
    cartSubtotal,
  } = useShopState();

  const pathname = usePathname();
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Dynamic Live Navigation from Supabase
  const [navCategories, setNavCategories] = useState(NAVIGATION_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveNav() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const json = await res.json();
          if (json.categories && json.categories.length > 0 && isMounted) {
            const formatted = formatCategoriesForNav(json.categories);
            if (formatted.length > 0) {
              setNavCategories(formatted);
            }
          }
        }
      } catch {
        // keep fallback
      }
    }
    loadLiveNav();
    return () => {
      isMounted = false;
    };
  }, []);

  // Photography-First Click-to-Expand Drawer State (Default: all closed, progressive click-only)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [mobileGroupIdx, setMobileGroupIdx] = useState<number | null>(null);
  const [activeDrawerCatId, setActiveDrawerCatId] = useState<string | null>(null);
  const [activeDrawerGroupIdx, setActiveDrawerGroupIdx] = useState<number | null>(null);

  function toggleCategory(categoryId: string) {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
    setMobileGroupIdx(null);
  }

  function closeMenu() {
    setMenuOpen(false);
    setExpandedCategory(null);
    setMobileGroupIdx(null);
    setActiveDrawerCatId(null);
    setActiveDrawerGroupIdx(null);
  }

  const activeDrawerCategory = activeDrawerCatId
    ? navCategories.find((c) => c.id === activeDrawerCatId) || null
    : null;
  const activeDrawerGroup =
    activeDrawerCategory &&
    activeDrawerGroupIdx !== null &&
    activeDrawerGroupIdx < activeDrawerCategory.groups.length
      ? activeDrawerCategory.groups[activeDrawerGroupIdx]
      : null;

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    setCustomer(getStoredCustomer());
    function onAuthChange() {
      setCustomer(getStoredCustomer());
    }
    window.addEventListener("ms_customer_auth_change", onAuthChange);

    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setAccountMenuOpen(false);
        setPincodeModalOpen(false);
        closeMenu();
        setCartOpen(false);
        setWishlistOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("ms_customer_auth_change", onAuthChange);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleCheckPincode(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = pincodeInput.trim();

    if (!/^\d{6}$/.test(cleaned)) {
      setPincodeStatus({
        type: "error",
        message: "Please enter a valid 6-digit Kolkata or Howrah pincode (e.g. 700091).",
      });
      return;
    }

    const matchedArea = KOLKATA_AREAS.find((area) => area.pincode === cleaned);
    if (cleaned.startsWith("700") || cleaned.startsWith("711")) {
      const displayLabel = matchedArea
        ? `${matchedArea.name.split(" / ")[0]}, ${cleaned}`
        : `Kolkata, ${cleaned}`;
      setPincodeInfo(cleaned, displayLabel);
      setPincodeStatus({
        type: "success",
        message: `90-Min Express & Same-Day Delivery Available for ${cleaned}.`,
      });
    } else {
      setPincodeStatus({
        type: "error",
        message:
          "Currently we deliver across Kolkata (700xxx) & Howrah (711xxx). Call +91 6295233296 for special requests.",
      });
    }
  }

  function handleSelectArea(area: KolkataArea) {
    const shortName = area.name.split(" / ")[0];
    setPincodeInfo(area.pincode, `${shortName}, ${area.pincode}`);
    setPincodeInput(area.pincode);
    setPincodeStatus({
      type: "success",
      message: `90-Min Express & Same-Day Delivery Available in ${area.name} (${area.pincode})`,
    });
    setPincodeModalOpen(false);
  }

  const filteredSearches = POPULAR_SEARCHES.filter((item) =>
    searchQuery.trim()
      ? item.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
      : true
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1680px] mx-auto px-2.5 sm:px-8 2xl:px-12 h-[74px] sm:h-[84px] py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-4 2xl:gap-8">
          {/* Left Section: Hamburger + Logo + Delivering to Pill */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 min-w-0">
            <button
              type="button"
              onClick={() => {
                setExpandedCategory(null);
                setMobileGroupIdx(null);
                setActiveDrawerCatId(null);
                setActiveDrawerGroupIdx(null);
                setMenuOpen(true);
              }}
              aria-label="Open navigation menu"
              className="text-zinc-800 p-1 sm:p-1.5 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer shrink-0"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.9}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            <Link href="/" className="shrink-0 flex items-center">
              <div
                className="relative h-[60px] w-[60px] sm:h-16 sm:w-16 2xl:h-[72px] 2xl:w-[72px] rounded-full overflow-hidden shrink-0"
                style={{ position: "relative", width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden" }}
              >
                <Image
                  src="/ms-logo.jpg"
                  alt="MS Online Flowers & Cake"
                  width={72}
                  height={72}
                  className="w-full h-full object-cover rounded-full"
                  priority
                />
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setPincodeModalOpen(true)}
              className="bg-[#f3f0fa] hover:bg-[#eae4f7] px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors cursor-pointer shrink-0"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6d4aff] shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-zinc-900 whitespace-nowrap">
                <span className="hidden sm:inline">Delivering to </span>{selectedPincode}
              </span>
              <svg
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-800 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Center Section: Search Pill */}
          <div
            ref={searchContainerRef}
            className="relative hidden md:block flex-1 max-w-[480px] 2xl:max-w-[560px] mx-auto"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(true);
              }}
              className="flex items-center w-full bg-white border border-zinc-300 focus-within:border-zinc-500 rounded-full px-4 py-2 transition-colors"
            >
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder="Search for cakes and flowers"
                aria-label="Search for cakes and flowers"
                className="text-sm text-zinc-800 placeholder:text-zinc-500 w-full focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                aria-label="Search"
                className="text-zinc-800 hover:text-zinc-950 ml-2 shrink-0 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.9}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </button>
            </form>

            {searchOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl p-3 z-50">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-zinc-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Popular Flowers &amp; Cakes
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <ul className="mt-1.5 divide-y divide-zinc-50">
                  {filteredSearches.length > 0 ? (
                    filteredSearches.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          onClick={() => {
                            setSearchQuery(item.label);
                            setSearchOpen(false);
                          }}
                          className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:bg-rose-50 hover:text-[#c8102e] transition-colors"
                        >
                          <span>{item.label}</span>
                          <span className="text-xs text-zinc-400">View</span>
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="px-2.5 py-3 text-sm text-zinc-500">
                      No quick match found. Try &quot;Roses&quot;, &quot;Truffle&quot;, or
                      &quot;Combo&quot;.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Right Section: Festive Promo Pill + 3 Utility Outline Icons */}
          <div className="flex items-center gap-2.5 sm:gap-5 lg:gap-6 shrink-0">
            <a
              href={WHATSAPP_ORDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex bg-linear-to-r from-[#f43f5e] via-[#ef4444] to-[#f43f5e] text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-xs items-center gap-1.5 hover:opacity-95 transition-opacity whitespace-nowrap"
            >
              <span className="text-amber-200 text-[11px]" aria-hidden="true">
                ✦
              </span>
              <span>Party Cakes &amp; Flowers</span>
              <span className="text-amber-200 text-[11px]" aria-hidden="true">
                ✦
              </span>
            </a>

            {/* 1. Wishlist Heart Icon */}
            <button
              type="button"
              onClick={() => setWishlistOpen(true)}
              aria-label="Wishlist"
              className="relative text-zinc-800 hover:text-[#c8102e] transition-colors cursor-pointer p-0.5"
            >
              <svg
                className="w-5 h-5 sm:w-[22px] sm:h-[22px]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c8102e] text-white text-[10px] font-extrabold flex items-center justify-center shadow-2xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* 2. Shopping Cart Icon */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative text-zinc-800 hover:text-[#c8102e] transition-colors cursor-pointer p-0.5"
            >
              <svg
                className="w-5 h-5 sm:w-[22px] sm:h-[22px]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c8102e] text-white text-[10px] font-extrabold flex items-center justify-center shadow-2xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* 3. User Profile Dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                aria-label="Account Menu"
                className="text-zinc-800 hover:text-[#c8102e] transition-colors cursor-pointer p-0.5 inline-flex items-center justify-center relative focus:outline-hidden"
              >
                {customer ? (
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg
                    className="w-5 h-5 sm:w-[22px] sm:h-[22px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-zinc-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {customer ? (
                    <>
                      {/* Customer Info Header */}
                      <div className="px-4 py-3 bg-gradient-to-br from-rose-50 to-pink-50/40 border-b border-rose-100/80 mb-1">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-900 truncate">
                              {customer.name}
                            </p>
                            <p className="text-[11px] text-zinc-500 truncate">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Links */}
                      <Link
                        href="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      >
                        <svg className="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        <span>My Orders</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          setWishlistOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                      >
                        <svg className="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span>My Wishlist</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          setPincodeModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                      >
                        <svg className="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Delivery Hub Zone</span>
                      </button>

                      <div className="my-1 border-t border-zinc-100" />

                      <button
                        type="button"
                        onClick={async () => {
                          await logoutCustomer();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Guest Header */}
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="text-xs font-bold text-zinc-900">
                          Welcome to MS Flowers
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Login to view order history &amp; instant checkout
                        </p>
                        <Link
                          href="/login"
                          onClick={() => setAccountMenuOpen(false)}
                          className="mt-2.5 w-full block text-center py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-xl shadow-xs transition-all"
                        >
                          Sign In / Register
                        </Link>
                      </div>

                      <Link
                        href="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      >
                        <svg className="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        <span>Track / My Orders</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          setPincodeModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                      >
                        <svg className="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Check Delivery Pincode</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-Out Side Menu Drawer (Progressive Click-Only Multi-Column Flyout on Desktop + Accordion Sub-Menus on Mobile) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex animate-in fade-in duration-200"
          onClick={closeMenu}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Categories navigation drawer"
            className={`w-full sm:w-[440px] ${
              !activeDrawerCategory
                ? "md:w-[350px]"
                : !activeDrawerGroup
                ? "md:w-[640px]"
                : "md:w-[900px]"
            } max-w-[96vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-250 transition-[width] ease-out z-50 border-r border-zinc-300`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header of Drawer (Refined & Balanced) */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-white shrink-0">
              <div className="flex items-center gap-3.5">
                <div
                  className="relative w-12 h-12 rounded-full overflow-hidden shrink-0"
                  style={{ position: "relative", width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden" }}
                >
                  <Image
                    src="/ms-logo.jpg"
                    alt="MS Online Flowers & Cake"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-full"
                    priority
                  />
                </div>
                <div>
                  <p className="text-base font-bold text-zinc-900 leading-tight">
                    MS Flowers &amp; Cake
                  </p>
                  <p className="text-xs text-zinc-600 font-medium mt-0.5">
                    Chingrighata, Salt Lake, Kolkata
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close navigation menu"
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer text-base shrink-0"
              >
                ✕
              </button>
            </div>

            {/* DESKTOP VIEW: Progressive Click-Only Columns */}
            <div className="hidden md:flex flex-1 min-h-0 divide-x divide-zinc-200/80 bg-white">
              {/* Column 1: Express Shortcuts + 4 Main Categories (Always visible, default all closed) */}
              <div className="w-[350px] shrink-0 flex flex-col overflow-y-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="px-3.5 pb-3 border-b border-zinc-100 grid grid-cols-2 gap-2">
                  <Link
                    href="/same-day"
                    onClick={closeMenu}
                    className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 hover:border-[#c8102e] transition-all"
                  >
                    <p className="text-[11px] font-bold text-[#c8102e] leading-tight">
                      ⚡ 90-Min Express
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight">
                      Kolkata Hub
                    </p>
                  </Link>
                  <Link
                    href="/midnight"
                    onClick={closeMenu}
                    className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 hover:border-purple-600 transition-all"
                  >
                    <p className="text-[11px] font-bold text-purple-800 leading-tight">
                      🌙 12 AM Midnight
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight">
                      Surprise Slot
                    </p>
                  </Link>
                </div>

                <p className="px-5 pt-3.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Shop By:
                </p>

                <div className="flex flex-col">
                  {navCategories.map((category) => {
                    const isActive = activeDrawerCategory?.id === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          if (activeDrawerCatId === category.id) {
                            setActiveDrawerCatId(null);
                            setActiveDrawerGroupIdx(null);
                          } else {
                            setActiveDrawerCatId(category.id);
                            setActiveDrawerGroupIdx(null);
                          }
                        }}
                        className={`w-full flex items-center justify-between gap-2.5 px-4 py-3 text-left text-sm transition-colors cursor-pointer border-l-4 ${
                          isActive
                            ? "border-[#c8102e] bg-rose-50/45 text-[#c8102e] font-bold"
                            : "border-transparent text-zinc-800 hover:bg-zinc-50 hover:text-[#c8102e] font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-zinc-200/80 shrink-0 bg-zinc-100">
                            <Image
                              src={category.imageSrc}
                              alt={category.label}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                          <span className="truncate">{category.label}</span>
                        </div>
                        <svg
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isActive ? "rotate-90 text-[#c8102e]" : "text-zinc-400"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.2}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Filter Buckets for Active Main Category (Opens only on 1st click) */}
              {activeDrawerCategory && (
                <div className="w-[290px] shrink-0 flex flex-col overflow-y-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="px-4 pb-3">
                    <Link
                      href={activeDrawerCategory.href}
                      onClick={closeMenu}
                      className="block w-full text-center rounded-full bg-zinc-100 hover:bg-rose-50 hover:text-[#c8102e] border border-zinc-200/80 hover:border-rose-200 px-4 py-2 text-xs font-bold text-zinc-800 transition-colors"
                    >
                      View All &apos;{activeDrawerCategory.label}&apos;
                    </Link>
                  </div>

                  <div className="flex flex-col">
                    {activeDrawerCategory.groups.map((group, idx) => {
                      const isActiveGroup = activeDrawerGroupIdx === idx;
                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() =>
                            setActiveDrawerGroupIdx((prev) =>
                              prev === idx ? null : idx
                            )
                          }
                          className={`w-full flex items-center justify-between gap-2 px-5 py-3 text-left text-sm transition-colors cursor-pointer border-l-4 ${
                            isActiveGroup
                              ? "border-[#c8102e] bg-rose-50/35 text-[#c8102e] font-bold"
                              : "border-transparent text-zinc-800 hover:bg-zinc-50 hover:text-[#c8102e] font-medium"
                          }`}
                        >
                          <span className="truncate">{group.title}</span>
                          <svg
                            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                              isActiveGroup ? "rotate-90 text-[#c8102e]" : "text-zinc-400"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.2}
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m8.25 4.5 7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Column 3: Clickable Filter Items Inside Active Bucket (Opens only on 2nd click) */}
              {activeDrawerGroup && (
                <div className="flex-1 min-w-[260px] flex flex-col overflow-y-auto py-3 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {activeDrawerGroup.title}
                  </p>
                  <div className="flex flex-col">
                    {activeDrawerGroup.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeMenu}
                        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-800 hover:text-[#c8102e] hover:bg-rose-50/50 transition-colors"
                      >
                        <span className="leading-snug">{item.label}</span>
                        {item.badge && (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-[#c8102e] px-1.5 py-0.5 rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* MOBILE VIEW: Click-to-Expand Category Cards with Closed Sub-Menu Accordions */}
            <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Clean Kolkata Express Delivery Cards (Balanced Contrast) */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/same-day"
                  onClick={closeMenu}
                  className="p-3 rounded-2xl bg-linear-to-br from-rose-50 via-rose-50/70 to-pink-50 border border-rose-200/80 hover:border-[#c8102e] hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#c8102e]">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                      <circle cx="12" cy="13" r="8" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4l2.5 2.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 2h4M12 2v3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l1.5-1.5" />
                    </svg>
                    <span>90-Min Express</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 font-medium mt-1 leading-tight">
                    Salt Lake &amp; Central Kolkata
                  </p>
                </Link>
                <Link
                  href="/midnight"
                  onClick={closeMenu}
                  className="p-3 rounded-2xl bg-linear-to-br from-purple-50 via-purple-50/70 to-indigo-50 border border-purple-200/80 hover:border-purple-600 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 4v2m0 0v2m0-2h2m-2 0h-2" strokeWidth={1.8} />
                      <circle cx="11.5" cy="8.5" r="0.8" fill="currentColor" />
                    </svg>
                    <span>Midnight Surprise</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 font-medium mt-1 leading-tight">
                    Exact 11:30 PM – 12:15 AM
                  </p>
                </Link>
              </div>

              {/* Visual Photography-First Category Cards */}
              <div className="space-y-2.5 pt-1">
                {navCategories.map((category) => {
                  const isExpanded = expandedCategory === category.id;

                  return (
                    <div
                      key={category.id}
                      className={`rounded-2xl transition-all border ${
                        isExpanded
                          ? "border-rose-200/90 bg-rose-50/20 shadow-xs"
                          : "border-zinc-200/80 bg-white hover:border-zinc-300 shadow-2xs"
                      }`}
                    >
                      {/* Category Header Row with Real Photography */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-3.5 text-left cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-200/90 shrink-0 bg-zinc-100 shadow-2xs">
                            <Image
                              src={category.imageSrc}
                              alt={category.label}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-800 group-hover:text-[#c8102e] leading-snug transition-colors">
                              {category.label}
                            </p>
                            <p className="text-xs text-zinc-700 font-medium mt-0.5">
                              {category.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 transition-colors shrink-0">
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 ${
                              isExpanded ? "rotate-180 text-[#c8102e]" : "text-zinc-400"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded Sub-Menus (All closed until user clicks one) */}
                      {isExpanded && (
                        <div className="px-3 pb-3.5 pt-2 space-y-2.5 border-t border-rose-100/70">
                          {/* Direct Quick Link */}
                          <Link
                            href={category.href}
                            onClick={closeMenu}
                            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-xs font-bold text-[#c8102e] transition-colors shadow-2xs"
                          >
                            <span>View All {category.label}</span>
                            <svg
                              className="w-3.5 h-3.5 text-[#c8102e] shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                              />
                            </svg>
                          </Link>

                          <div className="space-y-1.5">
                            {category.groups.map((grp, gIdx) => {
                              const isGrpOpen = mobileGroupIdx === gIdx;
                              return (
                                <div
                                  key={grp.id}
                                  className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setMobileGroupIdx(isGrpOpen ? null : gIdx)
                                    }
                                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-bold cursor-pointer transition-colors ${
                                      isGrpOpen
                                        ? "bg-rose-50/70 text-[#c8102e]"
                                        : "text-zinc-800 hover:bg-zinc-50"
                                    }`}
                                  >
                                    <span>{grp.title}</span>
                                    <svg
                                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                                        isGrpOpen ? "rotate-90 text-[#c8102e]" : "text-zinc-400"
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2.2}
                                      stroke="currentColor"
                                      aria-hidden="true"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                      />
                                    </svg>
                                  </button>
                                  {isGrpOpen && (
                                    <div className="px-2.5 pb-2.5 pt-1.5 flex flex-wrap gap-1.5 border-t border-rose-100/70 bg-rose-50/20">
                                      {grp.items.map((item) => (
                                        <Link
                                          key={item.label}
                                          href={item.href}
                                          onClick={closeMenu}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-800 hover:text-[#c8102e] hover:border-rose-300 transition-all shadow-2xs"
                                        >
                                          <span>{item.label}</span>
                                          {item.badge && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-[#c8102e] px-1.5 py-0.5 rounded-md">
                                              {item.badge}
                                            </span>
                                          )}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Local Trust Note */}
              <div className="py-2.5 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
                <p className="text-xs font-semibold text-zinc-700">
                  🌸 Handcrafted Fresh Daily in Salt Lake • Guaranteed On-Time Dispatch
                </p>
              </div>
            </div>

            {/* Bottom Support & Direct WhatsApp Order */}
            <div
              className={`p-3.5 sm:p-4 border-t border-zinc-200/80 bg-zinc-50 shrink-0 flex flex-col gap-2.5 ${
                activeDrawerCategory
                  ? "md:flex-row md:items-center md:justify-between"
                  : ""
              }`}
            >
              <div
                className={`flex text-xs text-zinc-700 font-semibold ${
                  activeDrawerCategory
                    ? "flex-col gap-0.5"
                    : "items-center justify-between"
                }`}
              >
                <span className="font-semibold text-zinc-800">
                  📍 Kolkata 90-Min Express Hub
                </span>
                <span className="text-zinc-500">Chingrighata, Salt Lake</span>
              </div>
              <a
                href={WHATSAPP_ORDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex w-full ${
                  activeDrawerCategory ? "md:w-auto md:px-5 shrink-0 whitespace-nowrap" : ""
                } items-center justify-center gap-2 bg-[#c8102e] hover:bg-[#a60c25] text-white font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer text-xs sm:text-sm`}
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
                </svg>
                <span>Order on WhatsApp (+91 6295233296)</span>
              </a>
            </div>
          </aside>
        </div>
      )}

      {/* Kolkata Delivery Pincode Modal */}
      {pincodeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPincodeModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pincode-modal-title"
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-[#f3f0fa]/60">
              <div>
                <h2 id="pincode-modal-title" className="text-lg font-bold text-zinc-900">
                  Where to deliver in Kolkata?
                </h2>
                <p className="text-xs text-zinc-600 mt-0.5">
                  India — Kolkata &amp; Howrah Hyperlocal Delivery
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPincodeModalOpen(false)}
                aria-label="Close pincode modal"
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-white hover:text-zinc-900 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  placeholder="Enter Kolkata Pincode e.g. 700091"
                  className="flex-1 rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#c8102e] focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#c8102e] hover:bg-[#a60c25] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Check
                </button>
              </form>

              {pincodeStatus && (
                <div
                  className={
                    pincodeStatus.type === "success"
                      ? "rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-emerald-800"
                      : "rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-rose-800"
                  }
                >
                  {pincodeStatus.message}
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                  Quick Select Popular Kolkata Areas
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {KOLKATA_AREAS.map((area) => (
                    <button
                      key={area.pincode}
                      type="button"
                      onClick={() => handleSelectArea(area)}
                      className="flex items-center justify-between text-left px-3 py-2.5 rounded-xl border border-zinc-200 hover:border-[#c8102e] hover:bg-rose-50/40 transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="block text-xs sm:text-sm font-semibold text-zinc-800">
                          {area.name}
                        </span>
                        <span className="block text-[11px] text-zinc-500">
                          Pincode: {area.pincode}
                        </span>
                      </div>
                      {area.tag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 shrink-0">
                          {area.tag}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Over Cart Drawer */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
          onClick={() => setCartOpen(false)}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Your Cart {totalCartCount > 0 ? `(${totalCartCount})` : ""}
                </h2>
                <p className="text-xs text-zinc-500">Delivering to: {selectedAreaLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart drawer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-[#c8102e] flex items-center justify-center text-2xl mb-4">
                  🎂
                </div>
                <h3 className="text-base font-bold text-zinc-900">Your Cart is Empty</h3>
                <p className="text-sm text-zinc-500 mt-1.5 max-w-xs">
                  Add fresh flower bouquets or freshly baked cakes to your cart, or place a quick
                  order directly on WhatsApp.
                </p>
                <div className="mt-5 flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                  <Link
                    href="/flowers"
                    onClick={() => setCartOpen(false)}
                    className="flex-1 inline-flex items-center justify-center bg-[#c8102e] hover:bg-[#a60c25] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors"
                  >
                    Browse Flowers
                  </Link>
                  <Link
                    href="/cakes"
                    onClick={() => setCartOpen(false)}
                    className="flex-1 inline-flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold px-4 py-2.5 rounded-full transition-colors"
                  >
                    Browse Cakes
                  </Link>
                </div>
                <a
                  href={WHATSAPP_ORDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors"
                >
                  Order Now on WhatsApp (+91 6295233296)
                </a>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-zinc-100">
                  {cart.map((item) => {
                    const perItemAddons = item.addons.reduce((s, a) => s + a.price, 0);
                    const lineTotal = (item.unitBasePrice + perItemAddons) * item.quantity;
                    const itemHref = getProductHref(item.product);
                    return (
                      <div key={item.cartItemId} className="pt-3 first:pt-0 flex gap-3">
                        <Link
                          href={itemHref}
                          onClick={() => setCartOpen(false)}
                          className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shrink-0"
                        >
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={itemHref}
                              onClick={() => setCartOpen(false)}
                              className="text-sm font-bold text-zinc-900 hover:text-[#c8102e] line-clamp-1"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.cartItemId)}
                              aria-label={`Remove ${item.product.name}`}
                              className="text-zinc-400 hover:text-[#c8102e] text-xs p-1 cursor-pointer shrink-0"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {item.weight && (
                              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md">
                                {item.weight}
                              </span>
                            )}
                            {item.addons.map((addon) => (
                              <span
                                key={addon.id}
                                className="text-[10px] font-semibold bg-rose-50 text-[#c8102e] px-2 py-0.5 rounded-md"
                              >
                                + {addon.name}
                                {addon.price > 0 ? ` (₹${addon.price})` : " (Free)"}
                              </span>
                            ))}
                          </div>

                          {(item.cakeMessage || item.cardMessage) && (
                            <div className="mt-1.5 text-[11px] text-zinc-600 space-y-0.5 bg-zinc-50 rounded-lg px-2.5 py-1.5 border border-zinc-200/70">
                              {item.cakeMessage && (
                                <p className="truncate">
                                  <span className="font-semibold text-zinc-800">Cake Msg:</span>{" "}
                                  {item.cakeMessage}
                                </p>
                              )}
                              {item.cardMessage && (
                                <p className="truncate">
                                  <span className="font-semibold text-zinc-800">Card Note:</span>{" "}
                                  {item.cardMessage}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2.5">
                            <div className="inline-flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.cartItemId, -1)}
                                aria-label="Decrease quantity"
                                className="w-7 h-7 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 font-bold text-sm cursor-pointer"
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-zinc-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.cartItemId, 1)}
                                aria-label="Increase quantity"
                                className="w-7 h-7 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 font-bold text-sm cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-black text-zinc-950">₹{lineTotal}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-zinc-200 bg-zinc-50/80 space-y-3 shrink-0">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-zinc-600 font-medium">
                      <span>Items Subtotal</span>
                      <span className="font-bold text-zinc-900">₹{itemsSubtotal}</span>
                    </div>
                    {addonsSubtotal > 0 && (
                      <div className="flex items-center justify-between text-zinc-600 font-medium">
                        <span>Add-ons Total</span>
                        <span className="font-bold text-zinc-900">₹{addonsSubtotal}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm font-black text-zinc-950 pt-1.5 border-t border-zinc-200">
                      <span>Estimated Total</span>
                      <span>₹{cartSubtotal}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href="/checkout"
                      onClick={() => setCartOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#c8102e] hover:bg-[#a60c25] text-white font-extrabold text-sm py-3 rounded-xl shadow-sm transition-colors"
                    >
                      Proceed to Checkout →
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCartOpen(false)}
                      className="w-full py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-800 transition-colors cursor-pointer"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="p-3.5 border-t border-zinc-100 bg-zinc-50 text-center text-xs text-zinc-500 shrink-0">
              Free greeting card included with every flower &amp; cake order
            </div>
          </aside>
        </div>
      )}

      {/* Slide-Over Wishlist Drawer */}
      {wishlistOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
          onClick={() => setWishlistOpen(false)}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Wishlist"
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Your Wishlist ({wishlistCount})
                </h2>
                <p className="text-xs text-zinc-500">Saved bouquets, cakes &amp; combos</p>
              </div>
              <button
                type="button"
                onClick={() => setWishlistOpen(false)}
                aria-label="Close wishlist drawer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {wishlist.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-[#c8102e] flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-zinc-900">Your Wishlist is Empty</h3>
                <p className="text-sm text-zinc-500 mt-1.5 max-w-xs">
                  Tap the heart icon on any flower bouquet, cake, or combo to save it for later.
                </p>
                <Link
                  href="/flowers"
                  onClick={() => setWishlistOpen(false)}
                  className="mt-5 inline-flex items-center gap-2 bg-[#c8102e] hover:bg-[#a60c25] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                >
                  Explore Flowers &amp; Cakes
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-zinc-100">
                  {wishlist.map((item) => {
                    const discountPct = Math.round(
                      ((item.originalPrice - item.price) / item.originalPrice) * 100
                    );
                    const itemHref = getProductHref(item);
                    return (
                      <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                        <Link
                          href={itemHref}
                          onClick={() => setWishlistOpen(false)}
                          className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shrink-0"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={itemHref}
                              onClick={() => setWishlistOpen(false)}
                              className="text-sm font-bold text-zinc-900 hover:text-[#c8102e] line-clamp-2 leading-snug"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggleWishlist(item)}
                              aria-label={`Remove ${item.name} from wishlist`}
                              className="text-zinc-400 hover:text-[#c8102e] text-xs p-1 cursor-pointer shrink-0"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-black text-zinc-950">₹{item.price}</span>
                            {item.originalPrice > item.price && (
                              <span className="text-xs text-zinc-400 line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                            {discountPct > 0 && (
                              <span className="text-[10px] font-bold text-emerald-700">
                                {discountPct}% OFF
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => moveWishlistToCart(item)}
                            className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-[#c8102e] text-[#c8102e] hover:text-white border border-rose-200 hover:border-[#c8102e] text-xs font-bold transition-colors cursor-pointer"
                          >
                            Move to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-zinc-200 bg-zinc-50/80 space-y-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      moveAllWishlistToCart();
                      setCartOpen(true);
                    }}
                    className="w-full py-3 rounded-xl bg-[#c8102e] hover:bg-[#a60c25] text-white font-extrabold text-sm shadow-sm transition-colors cursor-pointer"
                  >
                    Move All to Cart
                  </button>
                  <Link
                    href="/wishlist"
                    onClick={() => setWishlistOpen(false)}
                    className="w-full inline-flex items-center justify-center py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-800 transition-colors"
                  >
                    View Full Wishlist Page →
                  </Link>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* ================= MOBILE LOWER APP NAVIGATION BAR (IDEA 1) ================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-zinc-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden px-1 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-15 items-center">
          {/* 1. Home */}
          <Link
            href="/"
            className={`relative flex flex-col items-center justify-center h-full gap-1 transition-colors ${
              pathname === "/"
                ? "text-[#c8102e] font-bold"
                : "text-zinc-500 hover:text-zinc-900 font-medium"
            }`}
          >
            {pathname === "/" && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-[#c8102e]" />
            )}
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={pathname === "/" ? 2.2 : 1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <span className="text-[10px] tracking-tight leading-none">Home</span>
          </Link>

          {/* 2. Flowers (Daisy / Blossom) */}
          <Link
            href="/flowers"
            className={`relative flex flex-col items-center justify-center h-full gap-1 transition-colors ${
              pathname.startsWith("/flowers")
                ? "text-[#c8102e] font-bold"
                : "text-zinc-500 hover:text-zinc-900 font-medium"
            }`}
          >
            {pathname.startsWith("/flowers") && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-[#c8102e]" />
            )}
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={pathname.startsWith("/flowers") ? 2.2 : 1.8}
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="2.75" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2.25c1.24 0 2.25 1.01 2.25 2.25 0 1.5-2.25 4.5-2.25 4.5S9.75 6 9.75 4.5c0-1.24 1.01-2.25 2.25-2.25Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 12c0 1.24-1.01 2.25-2.25 2.25-1.5 0-4.5-2.25-4.5-2.25s3-2.25 4.5-2.25c1.24 0 2.25 1.01 2.25 2.25Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21.75c-1.24 0-2.25-1.01-2.25-2.25 0-1.5 2.25-4.5 2.25-4.5s2.25 3 2.25 4.5c0 1.24-1.01 2.25-2.25 2.25Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12c0-1.24 1.01-2.25 2.25-2.25 1.5 0 4.5 2.25 4.5 2.25s-3 2.25-4.5 2.25c-1.24 0-2.25-1.01-2.25-2.25Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m18.9 5.1-3.2 3.2m0 7.4 3.2 3.2M5.1 5.1l3.2 3.2m0 7.4-3.2 3.2"
              />
            </svg>
            <span className="text-[10px] tracking-tight leading-none">Flowers</span>
          </Link>

          {/* 3. Cakes (Celebration Cake with Flame Candle) */}
          <Link
            href="/cakes"
            className={`relative flex flex-col items-center justify-center h-full gap-1 transition-colors ${
              pathname.startsWith("/cakes")
                ? "text-[#c8102e] font-bold"
                : "text-zinc-500 hover:text-zinc-900 font-medium"
            }`}
          >
            {pathname.startsWith("/cakes") && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-[#c8102e]" />
            )}
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={pathname.startsWith("/cakes") ? 2.2 : 1.8}
              stroke="currentColor"
            >
              {/* Flame */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2.5c-.8 1-1.3 1.8-1.3 2.6a1.3 1.3 0 0 0 2.6 0c0-.8-.5-1.6-1.3-2.6Z"
                className={pathname.startsWith("/cakes") ? "fill-[#c8102e]" : "fill-amber-400"}
              />
              {/* Candle Stick */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v3" />
              {/* Cake Tier */}
              <rect x="4" y="10.5" width="16" height="8" rx="2" />
              {/* Frosting Scallop Wave */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 14c1.5 1 2.5 1 4 0s2.5-1 4 0 2.5 1 4 0 2.5-1 4 0" />
              {/* Cake Stand Plate */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 21h19" />
            </svg>
            <span className="text-[10px] tracking-tight leading-none">Cakes</span>
          </Link>

          {/* 4. Combos */}
          <Link
            href="/combos"
            className={`relative flex flex-col items-center justify-center h-full gap-1 transition-colors ${
              pathname.startsWith("/combos")
                ? "text-[#c8102e] font-bold"
                : "text-zinc-500 hover:text-zinc-900 font-medium"
            }`}
          >
            {pathname.startsWith("/combos") && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-[#c8102e]" />
            )}
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={pathname.startsWith("/combos") ? 2.2 : 1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
            <span className="text-[10px] tracking-tight leading-none">Combos</span>
          </Link>

          {/* 5. Cart */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Open Cart"
            className={`relative flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer ${
              cartOpen
                ? "text-[#c8102e] font-bold"
                : "text-zinc-500 hover:text-zinc-900 font-medium"
            }`}
          >
            {cartOpen && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-[#c8102e]" />
            )}
            <div className="relative">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={cartOpen ? 2.2 : 1.8}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#c8102e] text-white text-[9px] font-extrabold flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-none">Cart</span>
          </button>
        </div>
      </nav>
    </>
  );
}
