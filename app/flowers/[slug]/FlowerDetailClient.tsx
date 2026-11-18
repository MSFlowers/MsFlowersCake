"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import ProductReviewsSection from "../../components/ProductReviewsSection";
import { Product } from "../../data/types";
import { useProductReviews } from "../../data/reviewsState";
import { CartAddon, useShopState } from "../../data/shopState";

interface FlowerDetailClientProps {
  product: Product;
  related?: Product[];
}

export default function FlowerDetailClient({ product, related = [] }: FlowerDetailClientProps) {
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

  // Gallery images array
  const galleryImages =
    activeColorGallery && activeColorGallery.images.length > 0
      ? activeColorGallery.images
      : (product.images && product.images.length > 0 ? product.images : [product.image]);

  const THUMBNAIL_LABELS = ["Full View", "Close-up", "Ribbon & Wrap", "Top Angle"];

  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  // Dynamic variants support from DB
  const hasDbVariants = Boolean(product.variants && product.variants.length > 0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    hasDbVariants ? product.variants![0].id : ""
  );

  const activeVariant = hasDbVariants
    ? product.variants!.find((v) => v.id === selectedVariantId) || product.variants![0]
    : null;

  const [pincode, setPincode] = useState("700001");
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<"standard" | "express" | "midnight">("standard");
  const [addedAddons, setAddedAddons] = useState<{ [key: string]: boolean }>({
    card: true, // Free card selected by default
  });
  const [cardMessage, setCardMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"specs" | "about">("specs");
  const [addedToCart, setAddedToCart] = useState(false);
  const [buyNowClicked, setBuyNowClicked] = useState(false);
  const router = useRouter();
  const { addToCart, isProductWishlisted, toggleWishlist } = useShopState();
  const isWishlisted = isProductWishlisted(product.id);
  const { totalCount } = useProductReviews(product);

  // Addon prices
  const ADDONS = [
    {
      id: "vase",
      name: "Clear Glass Cylinder Vase",
      price: 199,
      image: "/products/flowers/purple-orchids-vase.jpg",
    },
    {
      id: "chocolates",
      name: "Cadbury Celebrations Box",
      price: 150,
      image: "/products/cakes/chocolate-truffle-cake.jpg",
    },
    {
      id: "card",
      name: "Custom Greeting Card",
      price: 0,
      freeTag: "FREE",
      image: "/trust/free-greeting-card.jpg",
    },
  ];

  // Calculate total price with addons
  const addonTotal = ADDONS.reduce((sum, item) => {
    return addedAddons[item.id] ? sum + item.price : sum;
  }, 0);

  const slotFee =
    selectedSlot === "express" ? 99 : selectedSlot === "midnight" ? 149 : 0;

  const currentBasePrice = activeVariant ? activeVariant.price : product.price;
  const currentOriginalPrice = activeVariant
    ? (activeVariant.originalPrice || activeVariant.price)
    : product.originalPrice;

  const finalPrice = currentBasePrice + addonTotal + slotFee;

  const discountPercent = Math.round(
    ((currentOriginalPrice - currentBasePrice) / currentOriginalPrice) * 100
  );

  function toggleAddon(id: string) {
    setAddedAddons((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function buildCartPayload() {
    const selectedAddons: CartAddon[] = ADDONS.filter(
      (item) => addedAddons[item.id]
    ).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
    }));

    return {
      product,
      quantity: 1,
      unitBasePrice: currentBasePrice,
      unitOriginalPrice: currentOriginalPrice,
      weight: activeVariant ? activeVariant.name : product.weight,
      selectedSlot,
      cardMessage: addedAddons["card"] ? cardMessage : undefined,
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

  // Related products
  const relatedProducts = related;

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
          <Link href="/flowers" className="hover:text-[#c8102e] transition-colors">
            Flowers
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Main Grid: Left Gallery + Right PDP Buying Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-x-10 xl:gap-x-14 lg:gap-y-4 items-start">
          {/* ================= LEFT: IMAGE GALLERY (SAME PRODUCT MULTI-ANGLE) ================= */}
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

            {/* Multi-Angle Thumbnails with Clean Sub-Labels */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3.5 pt-1">
              {galleryImages.map((img, idx) => {
                const isActive = activeImage === img;
                const label = THUMBNAIL_LABELS[idx] || `Angle ${idx + 1}`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group text-center focus:outline-none"
                  >
                    <div
                      className={`relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all bg-white ${
                        isActive
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
                        isActive
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
          </div>

          {/* ================= TRUST & PROMISE CARDS (BELOW CONSOLE ON MOBILE, LEFT COLUMN ON DESKTOP) ================= */}
          <div className="order-3 lg:order-3 lg:col-span-6 xl:col-span-5 space-y-3.5">
            {/* Trust Badges Bar Under Image */}
            <div className="grid grid-cols-3 bg-white rounded-2xl p-3 sm:p-4 border border-zinc-200/80 text-center shadow-2xs">
              <div className="flex flex-col items-center justify-center p-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5 border border-emerald-100">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3c3.5 3.5 3.5 14.5 0 18" />
                  </svg>
                </div>
                <span className="font-bold text-zinc-900 text-[11px] sm:text-xs">100% Farm Fresh</span>
                <span className="text-zinc-600 text-[10px] sm:text-xs font-semibold">Direct flower growers</span>
              </div>

              <div className="flex flex-col items-center justify-center p-1 border-x border-zinc-100">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#c8102e] flex items-center justify-center mb-1.5 border border-rose-100">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <span className="font-bold text-zinc-900 text-[11px] sm:text-xs">Free Greeting Card</span>
                <span className="text-zinc-600 text-[10px] sm:text-xs font-semibold">Personalized note</span>
              </div>

              <div className="flex flex-col items-center justify-center p-1">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-1.5 border border-purple-100">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-bold text-zinc-900 text-[11px] sm:text-xs">90-Min Express</span>
                <span className="text-zinc-600 text-[10px] sm:text-xs font-semibold">Across Kolkata</span>
              </div>
            </div>

            {/* MS Flowers Quality & Freshness Promise (Balanced Height + Professional Icons) */}
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
                      The MS Flowers Quality Promise
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium">100% Happiness, Freshness &amp; Delivery Assurance</p>
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
                    <p className="text-xs font-bold text-zinc-950">100% Replacement</p>
                    <p className="text-[11px] text-zinc-600 font-medium leading-relaxed mt-0.5">
                      Free instant replacement if blooms arrive damaged or wilted.
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200/80 text-blue-700 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-3.75 5-7.5 9.5-7.5 13.5a7.5 7.5 0 0015 0c0-4-3.75-8.5-7.5-13.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Aqua-Lock™ Hydration</p>
                    <p className="text-[11px] text-zinc-600 font-medium leading-relaxed mt-0.5">
                      Stems locked in moisture gel to preserve farm-fresh crispness.
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200/80 text-amber-700 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Artisan Quality Audit</p>
                    <p className="text-[11px] text-zinc-600 font-medium leading-relaxed mt-0.5">
                      Florists inspect bloom firmness, petal health &amp; wrap finish.
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
                      Freshly assembled in Salt Lake &amp; Chingrighata floral hubs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: BUYING CONSOLE ================= */}
          <div className="order-2 lg:order-2 lg:col-span-6 xl:col-span-7 lg:row-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 xl:p-10 border border-zinc-200/90 shadow-sm space-y-5 sm:space-y-6">
            {/* Title & Subtitle */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-950 border border-amber-200/80 text-xs font-extrabold px-2.5 py-0.5 rounded-lg shadow-2xs">
                  <svg className="w-3.5 h-3.5 fill-amber-500 text-amber-500" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {product.rating}
                </span>
                <span className="text-xs text-zinc-700 font-bold">
                  ({totalCount} verified reviews)
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
              <span className="text-[11px] sm:text-xs text-zinc-600 font-semibold">
                Inclusive of all taxes &amp; packaging
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

            {/* Flower Variant Options Selector (Dynamic from DB) */}
            {hasDbVariants && (
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-700 mb-2">
                  Select Flower Arrangement / Stems:
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

            {/* PINCODE & DELIVERY SLOT */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-800">
                  Check Delivery Time &amp; Pincode
                </label>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-zinc-300 rounded-xl focus:outline-hidden focus:border-[#c8102e] font-bold text-zinc-900 bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPincodeChecked(true)}
                  className="px-4 py-2.5 bg-zinc-950 hover:bg-[#c8102e] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>

              {pincodeChecked && (
                <div className="text-xs bg-emerald-50/90 text-emerald-950 p-3 rounded-xl border border-emerald-200 flex items-center font-medium">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-700 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Earliest slot:</strong> Today within 90 minutes</span>
                  </span>
                </div>
              )}

              {/* Delivery Slots Selection */}
              <div className="pt-2">
                <span className="text-xs font-bold text-zinc-800 block mb-2">
                  Select Delivery Slot:
                </span>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSlot("standard")}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedSlot === "standard"
                        ? "border-[#c8102e] bg-rose-50/60 shadow-xs ring-1 ring-[#c8102e]/20"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs sm:text-sm font-bold text-zinc-950">Standard</div>
                      <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v10.5" />
                      </svg>
                    </div>
                    <div className="text-[11px] text-zinc-600 font-medium leading-tight mt-0.5">Today</div>
                    <div className="text-[11px] font-black text-emerald-700 mt-1">FREE</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSlot("express")}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedSlot === "express"
                        ? "border-[#c8102e] bg-rose-50/60 shadow-xs ring-1 ring-[#c8102e]/20"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs sm:text-sm font-bold text-zinc-950">Express</div>
                      <svg className="w-3.5 h-3.5 text-purple-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-[11px] text-zinc-600 font-medium leading-tight mt-0.5">45–90 Mins</div>
                    <div className="text-[11px] font-black text-purple-800 mt-1">+₹99</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSlot("midnight")}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedSlot === "midnight"
                        ? "border-[#c8102e] bg-rose-50/60 shadow-xs ring-1 ring-[#c8102e]/20"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs sm:text-sm font-bold text-zinc-950">Midnight</div>
                      <svg className="w-3.5 h-3.5 text-indigo-700 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                    </div>
                    <div className="text-[11px] text-zinc-600 font-medium leading-tight mt-0.5">11:30–12 AM</div>
                    <div className="text-[11px] font-black text-zinc-800 mt-1">+₹149</div>
                  </button>
                </div>
              </div>
            </div>

            {/* MAKE IT SPECIAL: ADDONS */}
            <div className="pt-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-800 block mb-2">
                Make It Extra Special (Add-ons):
              </span>
              <div className="space-y-2">
                {ADDONS.map((addon) => {
                  const isChecked = !!addedAddons[addon.id];
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "border-[#c8102e] bg-rose-50/40 ring-1 ring-[#c8102e]/20"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-200 bg-zinc-100">
                          <Image
                            src={addon.image}
                            alt={addon.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-950">
                            {addon.name}
                          </div>
                          <div className="text-[11px] font-semibold text-zinc-600 mt-0.5">
                            {addon.freeTag ? (
                              <span className="text-emerald-700 font-black">INCLUDED FREE</span>
                            ) : (
                              `+₹${addon.price}`
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked
                            ? "bg-[#c8102e] border-[#c8102e] text-white"
                            : "border-zinc-300 bg-white"
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Personal Card Message Box */}
              {addedAddons["card"] && (
                <div className="mt-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-700">
                      Write Card Message (Complimentary)
                    </label>
                    <span className="text-[10px] text-zinc-400">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    placeholder="e.g. Happy Anniversary my love! From Rahul"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg bg-white focus:outline-hidden focus:border-[#c8102e] font-medium"
                  />
                </div>
              )}
            </div>

            {/* CTA BUTTONS: ADD TO CART & BUY NOW */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-600 px-1 font-semibold">
                <span>Total Payable:</span>
                <span className="text-xl font-black text-zinc-950">₹{finalPrice}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`py-3.5 px-4 rounded-xl font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    addedToCart
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-white hover:bg-rose-50 text-[#c8102e] border-2 border-[#c8102e]"
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
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className={`py-3.5 px-4 rounded-xl font-extrabold text-sm text-white transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                    buyNowClicked
                      ? "bg-emerald-600"
                      : "bg-[#c8102e] hover:bg-[#a50d26]"
                  }`}
                >
                  {buyNowClicked ? (
                    "Proceeding..."
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
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
        <section className="mt-8 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-zinc-200 shadow-sm">
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

          {/* TAB 1: SPECIFICATIONS (COMPACT 2-COLUMN TABLE) */}
          {activeTab === "specs" && (
            <div className="pt-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Arrangement Specifications
              </h3>

              {product.specs && (
                <div className="rounded-xl border border-zinc-200/80 overflow-hidden divide-y divide-zinc-200/80 bg-white">
                  {product.specs.stemCount && (
                    <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                      <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">
                        Stem Count
                      </span>
                      <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                        {product.specs.stemCount}
                      </span>
                    </div>
                  )}

                  {product.specs.flowers && product.specs.flowers.length > 0 && (
                    <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                      <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">
                        Flower Varieties
                      </span>
                      <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                        {product.specs.flowers.join(", ")}
                      </span>
                    </div>
                  )}

                  {product.specs.fillers && (
                    <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                      <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">
                        Fillers &amp; Greenery
                      </span>
                      <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                        {product.specs.fillers}
                      </span>
                    </div>
                  )}

                  {product.specs.packaging && (
                    <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                      <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">
                        Packaging Wrap
                      </span>
                      <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                        {product.specs.packaging}
                      </span>
                    </div>
                  )}

                  {product.specs.ribbon && (
                    <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                      <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">
                        Ribbon &amp; Bow
                      </span>
                      <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                        {product.specs.ribbon}
                      </span>
                    </div>
                  )}

                  {product.specs.height && (
                    <div className="grid grid-cols-12 p-3 sm:px-5 items-center hover:bg-zinc-50/50 transition-colors">
                      <span className="col-span-5 sm:col-span-4 text-xs font-semibold text-zinc-600 pr-2">
                        Bouquet Height
                      </span>
                      <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-bold text-zinc-950">
                        {product.specs.height}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ABOUT, CARE & DELIVERY INFO */}
          {activeTab === "about" && (
            <div className="pt-5 space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f7] border border-rose-100/80">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#c8102e] mb-1.5">
                  About This Arrangement
                </h4>
                <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    How to Keep Your Flowers Fresh for 5 - 7 Days
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Follow these simple steps recommended by master florists
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.careTips ? (
                    product.careTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-rose-100 text-[#c8102e] font-extrabold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">
                          {tip}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-zinc-50 text-xs sm:text-sm text-zinc-700">
                      Trim stems by 1-2 cm at a 45° angle and place them in cool, fresh water.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    MS Flowers Hand-Crafted Delivery Promise
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Safe handling from cold storage to your loved one&apos;s doorstep
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {product.deliveryInfo?.map((info, idx) => (
                    <div key={idx} className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                        {info}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 leading-relaxed flex items-start gap-3 font-medium">
                  <svg className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <span>
                    <strong>Natural Bloom Notice:</strong> Phool natural hote hain aur season ke mutabiq unka bloom stage thoda vary ho sakta hai. Hamari florist team hamesha freshly bloomed stems chun kar pack karti hai taaki delivery ke waqt maximum freshness mile.
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ================= CUSTOMER REVIEWS SECTION ================= */}
        <section className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-zinc-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-black text-zinc-950 tracking-tight">
            Customer Reviews ({totalCount})
          </h3>
          <ProductReviewsSection product={product} categoryPath="flowers" />
        </section>

        {/* ================= RELATED PRODUCTS (YOU MAY ALSO LIKE) ================= */}
        <section className="mt-12 sm:mt-14 mb-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-950">
                You May Also Like
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                Other popular hand-arranged bouquets chosen by Kolkata customers
              </p>
            </div>
            <Link
              href="/flowers"
              className="text-xs sm:text-sm font-extrabold text-[#c8102e] hover:underline whitespace-nowrap shrink-0"
            >
              View All Flowers →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
