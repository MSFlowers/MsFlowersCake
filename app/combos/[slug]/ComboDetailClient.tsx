"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductReviewsSection from "../../components/ProductReviewsSection";
import { ChocolateIcon, VaseIcon, MailIcon, CheckCircleIcon } from "../../components/StorefrontIcons";
import { Product } from "../../data/types";

import { useProductReviews } from "../../data/reviewsState";
import { CartAddon, DeliverySlotType, useShopState } from "../../data/shopState";

interface ComboDetailClientProps {
  product: Product;
  related?: Product[];
}

export default function ComboDetailClient({ product, related = [] }: ComboDetailClientProps) {
  const hasColorGalleries = Boolean(
    product.colorGalleries &&
    product.colorGalleries.length > 0 &&
    product.colorGalleries.some((cg) => cg.images && cg.images.length > 0)
  );
  const [selectedColorId, setSelectedColorId] = useState<string>(
    hasColorGalleries ? product.colorGalleries![0].id : ""
  );

  const activeColorGallery = hasColorGalleries
    ? product.colorGalleries!.find((cg) => cg.id === selectedColorId)
    : null;

  const images =
    activeColorGallery && activeColorGallery.images.length > 0
      ? activeColorGallery.images
      : (product.images && product.images.length > 0 ? product.images : [product.image]);

  const [activeImage, setActiveImage] = useState(images[0]);

  // Dynamic variants support from DB
  const hasDbVariants = Boolean(product.variants && product.variants.length > 0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    hasDbVariants ? product.variants![0].id : ""
  );

  const activeVariant = hasDbVariants
    ? product.variants!.find((v) => v.id === selectedVariantId) || product.variants![0]
    : null;

  const [pincode, setPincode] = useState("700001");
  const [isPincodeValid, setIsPincodeValid] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState("Standard");
  const [cakeMessage, setCakeMessage] = useState("");
  const [cardMessage, setCardMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"specs" | "about">("specs");
  const [addedToCart, setAddedToCart] = useState(false);
  const [buyNowClicked, setBuyNowClicked] = useState(false);
  const router = useRouter();
  const { addToCart, isProductWishlisted, toggleWishlist } = useShopState();
  const isWishlisted = isProductWishlisted(product.id);
  const { totalCount, avgRating } = useProductReviews(product);

  // Addons state
  const [addons, setAddons] = useState({
    chocolateBox: false,
    vase: false,
    card: true,
  });

  const addonPrices = {
    chocolateBox: 150,
    vase: 199,
    card: 0,
  };

  const addonTotal =
    (addons.chocolateBox ? addonPrices.chocolateBox : 0) +
    (addons.vase ? addonPrices.vase : 0) +
    (addons.card ? addonPrices.card : 0);

  const currentBasePrice = activeVariant ? activeVariant.price : product.price;
  const currentOriginalPrice = activeVariant
    ? (activeVariant.originalPrice || activeVariant.price)
    : product.originalPrice;

  const totalPrice = currentBasePrice + addonTotal;

  const discountPercent = Math.round(
    ((currentOriginalPrice - currentBasePrice) / currentOriginalPrice) * 100
  );

  function buildCartPayload() {
    const mappedSlot: DeliverySlotType =
      selectedSlot === "Express"
        ? "express"
        : selectedSlot === "Midnight"
        ? "midnight"
        : "standard";

    const selectedAddons: CartAddon[] = [];
    if (addons.chocolateBox) {
      selectedAddons.push({
        id: "chocolateBox",
        name: "Cadbury Celebrations Box",
        price: addonPrices.chocolateBox,
      });
    }
    if (addons.vase) {
      selectedAddons.push({
        id: "vase",
        name: "Clear Glass Cylinder Vase",
        price: addonPrices.vase,
      });
    }
    if (addons.card) {
      selectedAddons.push({
        id: "card",
        name: "Custom Greeting Card",
        price: 0,
      });
    }

    return {
      product,
      quantity: 1,
      unitBasePrice: currentBasePrice,
      unitOriginalPrice: currentOriginalPrice,
      weight: activeVariant ? activeVariant.name : product.weight,
      selectedSlot: mappedSlot,
      cakeMessage,
      cardMessage: addons.card ? cardMessage : undefined,
      addons: selectedAddons,
    };
  }

  function handleAddToCart() {
    addToCart(buildCartPayload());
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }

  function handleBuyNow() {
    addToCart(buildCartPayload());
    setBuyNowClicked(true);
    router.push("/checkout");
  }

  const relatedCombos = related;

  return (
    <div className="min-h-screen bg-[#faf8f7] text-zinc-900 font-sans">
      <Header />

      <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 mb-5 sm:mb-7 font-semibold">
          <Link href="/" className="hover:text-[#c8102e] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/combos" className="hover:text-[#c8102e] transition-colors">
            Combos
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Main Grid: Left Gallery + Right PDP Buying Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-x-10 xl:gap-x-14 lg:gap-y-4 items-start">
          {/* ================= LEFT: IMAGE GALLERY (MULTI-ANGLE) ================= */}
          <div className="order-1 lg:col-span-6 xl:col-span-5 space-y-3 sm:space-y-4">
            {/* Main Large Hero Image */}
            <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl bg-white border border-zinc-200/90 shadow-sm overflow-hidden group">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-zinc-700 hover:text-[#c8102e] shadow-sm border border-zinc-200/70 flex items-center justify-center transition-colors cursor-pointer z-10"
              >
                <svg
                  className={`w-5 h-5 transition-colors ${
                    isWishlisted ? "fill-[#c8102e] text-[#c8102e]" : "fill-none"
                  }`}
                  viewBox="0 0 24 24"
                  strokeWidth={1.9}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </button>
            </div>

            {/* Thumbnails Row with Clean Sub-Labels */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3.5 pt-1">
                {images.map((img, idx) => {
                  const isSelected = activeImage === img;
                  const labels = ["Full Duo", "Flowers Angle", "Cake View", "Details"];
                  const label = labels[idx] || `View ${idx + 1}`;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group text-center focus:outline-none"
                    >
                      <div
                        className={`relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all bg-white ${
                          isSelected
                            ? "border-[#c8102e] ring-2 ring-rose-200 shadow-sm"
                            : "border-zinc-200/80 hover:border-zinc-400 opacity-85 group-hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} - ${label}`}
                          fill
                          sizes="120px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] font-semibold tracking-tight leading-tight truncate w-full px-0.5 transition-colors ${
                          isSelected
                            ? "text-[#c8102e] font-bold"
                            : "text-zinc-500 group-hover:text-zinc-800"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================= TRUST & PROMISE CARDS (BELOW CONSOLE ON MOBILE, LEFT COLUMN ON DESKTOP) ================= */}
          <div className="order-3 lg:order-3 lg:col-span-6 xl:col-span-5 space-y-3.5">
            {/* Trust Badges Bar Under Image */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs grid grid-cols-3 text-center">
              <div className="flex flex-col items-center justify-center p-1">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z" />
                  </svg>
                </div>
                <span className="font-bold text-zinc-900 text-[11px] sm:text-xs">Synchronized</span>
                <span className="text-zinc-600 text-[10px] sm:text-xs font-semibold">One Single Drop</span>
              </div>

              <div className="flex flex-col items-center justify-center p-1 border-x border-zinc-100">
                <div className="w-9 h-9 rounded-full bg-rose-50 text-[#c8102e] flex items-center justify-center mb-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <span className="font-bold text-zinc-900 text-[11px] sm:text-xs">Free Greeting Card</span>
                <span className="text-zinc-600 text-[10px] sm:text-xs font-semibold">Personalized note</span>
              </div>

              <div className="flex flex-col items-center justify-center p-1">
                <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mb-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span className="font-bold text-zinc-900 text-[11px] sm:text-xs">90-Min Express</span>
                <span className="text-zinc-600 text-[10px] sm:text-xs font-semibold">Across Kolkata</span>
              </div>
            </div>

            {/* MS Celebration Combo Promise (Balanced Height + Professional Vector Icons) */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#c8102e] border border-rose-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-zinc-950 tracking-tight">
                      The MS Celebration Combo Promise
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Dual Freshness, 100% Intact & Synchronized</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 shrink-0">
                  <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              </div>

              {/* 4 Feature Pillars Grid with Sleek Compact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                {/* Pillar 1 */}
                <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200/80 text-emerald-700 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">100% Dual Replacement</p>
                    <p className="text-[11px] text-zinc-600 font-medium leading-relaxed mt-0.5">
                      Free replacement if either flowers or cake arrive damaged.
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200/80 text-blue-700 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Single-Rider Handover</p>
                    <p className="text-[11px] text-zinc-600 font-medium leading-relaxed mt-0.5">
                      Delivered together in one drop so the surprise is never broken.
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200/80 text-amber-700 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-3.75 5-7.5 9.5-7.5 13.5a7.5 7.5 0 0015 0c0-4-3.75-8.5-7.5-13.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Dual Climate Packaging</p>
                    <p className="text-[11px] text-zinc-600 font-medium leading-relaxed mt-0.5">
                      Hydration pouch for blooms + insulated box for the cake.
                    </p>
                  </div>
                </div>

                {/* Pillar 4 */}
                <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200/80 text-[#c8102e] shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Handcrafted in Kolkata</p>
                    <p className="text-[11px] text-zinc-600 font-medium leading-relaxed mt-0.5">
                      Freshly assembled in Salt Lake & Chingrighata hubs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Complimentary Combo Kit Card */}
            <div className="bg-gradient-to-r from-amber-50/70 via-rose-50/40 to-white border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-amber-200 text-amber-700 shadow-2xs flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black text-zinc-950">Free Celebration Kit in Every Combo</p>
                  <span className="text-[10px] font-black text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                    FREE (₹0)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 font-medium leading-relaxed mt-0.5">
                  Includes personalized message card, cake knife & sparkle candles set.
                </p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: BUYING CONSOLE ================= */}
          <div className="order-2 lg:order-2 lg:col-span-6 xl:col-span-7 lg:row-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 xl:p-10 border border-zinc-200/90 shadow-sm space-y-5 sm:space-y-6">
            {/* Title & Subtitle */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-950 border border-amber-200/80 text-xs font-extrabold px-2.5 py-0.5 rounded-lg shadow-2xs">
                  <svg className={`w-3.5 h-3.5 ${totalCount > 0 ? "fill-amber-500 text-amber-500" : "fill-zinc-300 text-zinc-300"}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {totalCount > 0 ? avgRating.toFixed(1) : "New"}
                </span>
                <span className="text-xs text-zinc-700 font-bold">
                  {totalCount > 0 ? `(${totalCount} verified customer reviews)` : "(No reviews yet)"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight leading-snug">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="mt-1.5 text-sm sm:text-base text-zinc-600 font-medium leading-relaxed">
                  {product.tagline}
                </p>
              )}
            </div>

            {/* Price Block */}
            <div className="p-3.5 sm:p-4 bg-rose-50/60 rounded-2xl border border-rose-100 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-zinc-950">
                  ₹{currentBasePrice}
                </span>
                <span className="text-sm text-zinc-400 line-through font-semibold">
                  ₹{currentOriginalPrice}
                </span>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Save {discountPercent}%
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-600">
                Inclusive of all taxes & combo packaging
              </span>
            </div>

            {/* Color Shade Swatches (Dynamic from DB) */}
            {hasColorGalleries && (
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-700 mb-2">
                  Select Shade / Color:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {product.colorGalleries!.map((cg) => {
                    const isSel = cg.id === selectedColorId;
                    return (
                      <button
                        key={cg.id}
                        type="button"
                        onClick={() => {
                          setSelectedColorId(cg.id);
                          if (cg.images && cg.images.length > 0) setActiveImage(cg.images[0]);
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          isSel
                            ? "border-[#c8102e] bg-rose-50 text-[#c8102e] shadow-xs"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: cg.colorCode }}
                        />
                        <span>{cg.colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Combo Variant Options Selector (Dynamic from DB) */}
            {hasDbVariants && (
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-700 mb-2">
                  Select Combo Edition / Pack:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.variants!.map((v) => {
                    const isSel = v.id === activeVariant?.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col justify-between text-left gap-1 cursor-pointer transition-all ${
                          isSel
                            ? "border-[#c8102e] bg-rose-50/70 text-[#c8102e] shadow-xs"
                            : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300"
                        }`}
                      >
                        <span>{v.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-950">₹{v.price}</span>
                          {v.originalPrice && v.originalPrice > v.price && (
                            <span className="text-[10px] text-zinc-400 line-through">₹{v.originalPrice}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pincode & Delivery Checker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 uppercase tracking-wider">
                <span>Check Delivery Time & Pincode</span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={pincode}
                    maxLength={6}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit Kolkata pincode"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-900 focus:outline-hidden focus:border-[#c8102e] focus:ring-2 focus:ring-rose-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsPincodeValid(pincode.length === 6)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold cursor-pointer transition-colors"
                >
                  Verify
                </button>
              </div>

              {isPincodeValid && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center text-xs font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Earliest Slot: Synchronized delivery within 90 mins
                  </span>
                </div>
              )}
            </div>

            {/* Select Delivery Slot */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-700 mb-2">
                Select Delivery Slot:
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { id: "Standard", title: "Standard", sub: "Today", price: "FREE" },
                  { id: "Express", title: "Express", sub: "45–90 Mins", price: "+₹99" },
                  { id: "Midnight", title: "Midnight", sub: "11:30–12 AM", price: "+₹149" },
                ].map((slot) => {
                  const isSelected = selectedSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#c8102e] bg-rose-50/60 ring-1 ring-rose-200"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold text-zinc-950 mb-0.5">
                        <span>{slot.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 font-medium leading-tight">{slot.sub}</p>
                      <span className="text-[11px] font-black text-[#c8102e] mt-1 block">
                        {slot.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cake Message Input */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                  Message on Cake (Icing):
                </label>
                <span className="text-[11px] text-zinc-500 font-semibold whitespace-nowrap shrink-0">Max 25 chars</span>
              </div>
              <input
                type="text"
                maxLength={25}
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                placeholder="e.g. Happy Anniversary Mom & Dad"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e] focus:ring-2 focus:ring-rose-100"
              />
            </div>

            {/* Celebration Add-ons */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-700 mb-2">
                Make it Extra Special (Combo Upgrades):
              </label>
              <div className="space-y-2.5">
                {/* Addon 1: Celebrations Chocolate Box */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/90 hover:border-zinc-300 bg-white cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800 font-bold text-xs">
                      <ChocolateIcon className="w-5 h-5 text-amber-800" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-zinc-950">Cadbury Celebrations Box</p>
                      <p className="text-xs text-zinc-500 font-medium">+₹150</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={addons.chocolateBox}
                    onChange={(e) => setAddons({ ...addons, chocolateBox: e.target.checked })}
                    className="w-4 h-4 accent-[#c8102e] rounded"
                  />
                </label>

                {/* Addon 2: Glass Vase */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/90 hover:border-zinc-300 bg-white cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      <VaseIcon className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-zinc-950">Clear Glass Cylinder Vase</p>
                      <p className="text-xs text-zinc-500 font-medium">+₹199</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={addons.vase}
                    onChange={(e) => setAddons({ ...addons, vase: e.target.checked })}
                    className="w-4 h-4 accent-[#c8102e] rounded"
                  />
                </label>

                {/* Addon 3: Personalized Greeting Card */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50/30 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 text-[#c8102e] flex items-center justify-center text-xs">
                      <MailIcon className="w-5 h-5 text-[#c8102e]" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-zinc-950">Custom Greeting Card</p>
                      <p className="text-xs font-black text-emerald-800 uppercase">Included Free</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={addons.card}
                    onChange={(e) => setAddons({ ...addons, card: e.target.checked })}
                    className="w-4 h-4 accent-[#c8102e] rounded"
                  />
                </label>
              </div>

              {addons.card && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    placeholder="Write card message (e.g. Happy Anniversary with all my heart! Love Rahul)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#c8102e] focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              )}
            </div>

            {/* Total Payable & CTAs */}
            <div className="pt-2 border-t border-zinc-150 space-y-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-600">
                  Total Payable:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-zinc-950">
                  ₹{totalPrice}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    addedToCart
                      ? "bg-emerald-600 text-white border-2 border-emerald-600 shadow-md"
                      : "border-2 border-[#c8102e] text-[#c8102e] hover:bg-rose-50"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className={`w-full py-3.5 px-4 rounded-xl text-white text-xs sm:text-sm font-black transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                    buyNowClicked
                      ? "bg-emerald-600"
                      : "bg-[#c8102e] hover:bg-rose-700"
                  }`}
                >
                  {buyNowClicked ? (
                    "Proceeding..."
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      Buy Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= LOWER SECTION: 2-WAY SWITCH (SPECS vs ABOUT & CARE) ================= */}
        <section className="mt-8 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-zinc-200/90 shadow-sm">
          {/* 2-Button Pill Toggle Switch */}
          <div className="grid grid-cols-2 gap-1.5 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200/80">
            {[
              { id: "specs", label: "Specifications" },
              { id: "about", label: "About & Care" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as "specs" | "about")}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-extrabold transition-all text-center cursor-pointer ${
                    isActive
                      ? "bg-[#c8102e] text-white shadow-xs"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Specifications (Compact 2-Column Table) */}
          {activeTab === "specs" && (
            <div className="pt-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Combo Package Breakdown
              </h4>

              <div className="rounded-xl border border-zinc-200/80 overflow-hidden divide-y divide-zinc-200/80 bg-white">
                {product.specs?.stemCount && (
                  <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                    <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">Floral Bouquet</span>
                    <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                      {product.specs.stemCount}
                    </span>
                  </div>
                )}

                {product.specs?.flavour && (
                  <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                    <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">Cake Flavour & Weight</span>
                    <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                      {product.specs.flavour}
                    </span>
                  </div>
                )}

                {product.specs?.packaging && (
                  <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                    <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">Packaging</span>
                    <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                      {product.specs.packaging}
                    </span>
                  </div>
                )}

                {product.specs?.ribbon && (
                  <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                    <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">Ribbon Detail</span>
                    <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                      {product.specs.ribbon}
                    </span>
                  </div>
                )}

                {product.specs?.height && (
                  <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                    <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">Dimensions</span>
                    <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                      {product.specs.height}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: About, Care & Delivery Policy */}
          {activeTab === "about" && (
            <div className="pt-5 space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f7] border border-rose-100/80">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#c8102e] mb-1.5">
                  About This Celebration Combo
                </h4>
                <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                  Celebration Care & Storage Guide
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.careTips?.map((tip, idx) => (
                    <div key={idx} className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-rose-100 text-[#c8102e] font-extrabold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                  Synchronized Delivery & Arrival Guarantee
                </h4>
                <div className="space-y-2.5">
                  {product.deliveryInfo?.map((info, idx) => (
                    <div key={idx} className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">{info}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ================= CUSTOMER REVIEWS SECTION ================= */}
        <section className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-zinc-200/90 shadow-sm">
          <h3 className="text-base sm:text-lg font-black text-zinc-950 tracking-tight">
            Customer Reviews ({totalCount})
          </h3>
          <ProductReviewsSection product={product} categoryPath="combos" />
        </section>

        {/* ================= LOWER: RELATED COMBOS ================= */}
        {relatedCombos.length > 0 && (
          <section className="mt-12 sm:mt-14">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                  You May Also Like
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-0.5">
                  Other popular celebration pairings chosen by Kolkata customers
                </p>
              </div>
              <Link
                href="/combos"
                className="text-xs sm:text-sm font-bold text-[#c8102e] hover:underline whitespace-nowrap shrink-0"
              >
                View All Combos
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedCombos.map((relCombo) => (
                <Link
                  key={relCombo.id}
                  href={`/combos/${relCombo.slug}`}
                  className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs hover:shadow-md transition-all p-3 group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 mb-3">
                    <Image
                      src={relCombo.image}
                      alt={relCombo.name}
                      fill
                      sizes="220px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-950 truncate group-hover:text-[#c8102e] transition-colors">
                    {relCombo.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm sm:text-base font-black text-zinc-950">₹{relCombo.price}</span>
                    <span className="text-xs text-zinc-400 line-through">₹{relCombo.originalPrice}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
