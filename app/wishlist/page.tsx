"use client";

import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { useShopState } from "../data/shopState";

export default function WishlistPage() {
  const {
    wishlist,
    wishlistCount,
    hydrated,
    moveAllWishlistToCart,
    clearWishlist,
    setCartOpen,
  } = useShopState();

  return (
    <div className="min-h-screen bg-[#faf8f7] text-zinc-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1680px] w-full mx-auto px-3 sm:px-8 2xl:px-12 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 mb-6 font-semibold">
          <Link href="/" className="hover:text-[#c8102e] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-950">Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200/80 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#c8102e]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#c8102e]">
                Saved Favorites
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Your Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
            </h1>
            <p className="text-sm text-zinc-600 font-medium mt-1">
              Keep your favorite bouquets, celebration cakes, and combos ready to order anytime.
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={clearWishlist}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-xs sm:text-sm font-bold text-zinc-700 transition-colors cursor-pointer"
              >
                Clear Wishlist
              </button>
              <button
                type="button"
                onClick={() => {
                  moveAllWishlistToCart();
                  setCartOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#c8102e] hover:bg-[#a60c25] text-white text-xs sm:text-sm font-extrabold shadow-xs transition-colors cursor-pointer"
              >
                Move All to Cart
              </button>
            </div>
          )}
        </div>

        {!hydrated ? (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-12 text-center text-sm text-zinc-500 font-medium">
            Loading your saved wishlist...
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs p-8 sm:p-14 text-center max-w-2xl mx-auto my-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-[#c8102e] flex items-center justify-center mx-auto mb-4">
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
            <h2 className="text-xl font-black text-zinc-950">Your Wishlist is Empty</h2>
            <p className="text-sm text-zinc-600 mt-2 max-w-md mx-auto">
              Tap the heart icon on any fresh bouquet, designer cake, or combo to save it here for
              your next celebration in Kolkata.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/flowers"
                className="px-5 py-2.5 rounded-xl bg-[#c8102e] hover:bg-[#a60c25] text-white text-xs sm:text-sm font-bold transition-colors"
              >
                Browse Fresh Flowers
              </Link>
              <Link
                href="/cakes"
                className="px-5 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-xs sm:text-sm font-bold transition-colors"
              >
                Browse Celebration Cakes
              </Link>
              <Link
                href="/combos"
                className="px-5 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-xs sm:text-sm font-bold transition-colors"
              >
                Explore Combos
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
