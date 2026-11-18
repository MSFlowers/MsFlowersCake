"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "../data/types";
import { useShopState } from "../data/shopState";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isProductWishlisted, toggleWishlist, addToCart } = useShopState();
  const isWishlisted = isProductWishlisted(product.id);
  const [addedToCart, setAddedToCart] = useState(false);

  const productUrl = product.slug
    ? product.id.startsWith("ck")
      ? `/cakes/${product.slug}`
      : product.id.startsWith("cb")
      ? `/combos/${product.slug}`
      : `/flowers/${product.slug}`
    : product.id.startsWith("ck")
    ? "/cakes"
    : product.id.startsWith("cb")
    ? "/combos"
    : "/flowers";

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  function handleAddToCart() {
    addToCart({
      product,
      quantity: 1,
      weight:
        product.weight ||
        (product.id.startsWith("ck-") && product.category !== "bento"
          ? "500g"
          : undefined),
    });
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:border-rose-200 transition-all duration-300 overflow-hidden flex flex-col group">
      {/* 100% Clean Product Image */}
      <div className="relative aspect-square w-full bg-[#fdf9f7] overflow-hidden">
        <Link href={productUrl} className="block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Subtle Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-zinc-600 hover:text-[#c8102e] shadow-xs flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <svg
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? "fill-[#c8102e] text-[#c8102e]" : "fill-none"
            }`}
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
        </button>
      </div>

      {/* Ultra-Clean Minimalist Luxury Body */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between">
        {/* Title (Consistent 2-Line Height for Perfect Alignment) */}
        <Link href={productUrl} className="block">
          <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-[#c8102e] transition-colors leading-snug line-clamp-2 h-8 sm:h-9">
            {product.name}
          </h3>
        </Link>

        {/* Price Row */}
        <div className="pt-2 flex items-baseline gap-1.5">
          <span className="text-sm sm:text-base font-bold text-zinc-950">
            ₹{product.price}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[11px] sm:text-xs text-zinc-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-[10px] font-bold text-emerald-700 ml-auto">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Minimalist Full-Width Luxury Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full mt-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer text-center ${
            addedToCart
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-zinc-50 hover:bg-[#c8102e] text-zinc-800 hover:text-white border border-zinc-200/90 hover:border-[#c8102e] active:scale-[0.98]"
          }`}
        >
          {addedToCart ? "✓ Added" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
