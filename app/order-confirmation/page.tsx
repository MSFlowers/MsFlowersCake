"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useShopState } from "../data/shopState";

export default function OrderConfirmationPage() {
  const { lastOrder, hydrated } = useShopState();

  return (
    <div className="min-h-screen bg-[#faf8f7] text-zinc-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!hydrated ? (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-12 text-center text-sm text-zinc-500 font-medium">
            Loading order details...
          </div>
        ) : !lastOrder ? (
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs p-8 sm:p-14 text-center">
            <h1 className="text-2xl font-black text-zinc-950">No Recent Order Found</h1>
            <p className="text-sm text-zinc-600 mt-2 max-w-md mx-auto">
              It looks like you haven&apos;t placed an order yet, or your session order details are
              unavailable.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#c8102e] hover:underline"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Top Confirmation Card */}
            <section className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs p-6 sm:p-9 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Order Confirmed
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 font-medium mt-2 max-w-lg mx-auto">
                Thank you! Your order has been received by our Chingrighata, Salt Lake hub.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs sm:text-sm font-extrabold text-zinc-900">
                  Order ID: {lastOrder.orderId}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-xs sm:text-sm font-semibold text-zinc-700">
                  Placed on {lastOrder.placedAt}
                </span>
              </div>
            </section>

            {/* 2. Status & Payment Strip */}
            <section className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Order Status:
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  {lastOrder.status}
                </span>
              </div>

              <div className="text-xs sm:text-sm font-semibold text-zinc-700">
                <span className="text-zinc-500">Payment Mode: </span>
                <span className="font-bold text-zinc-950">
                  Cash on Delivery (Amount to pay on delivery: ₹{lastOrder.pricing.grandTotal})
                </span>
              </div>
            </section>

            {/* 3. Delivery & Schedule Details */}
            <section className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xs p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#c8102e]">
                  Delivering To
                </h2>
                <div className="text-sm text-zinc-800 space-y-1">
                  <p className="font-extrabold text-zinc-950 text-base">
                    {lastOrder.deliveryDetails.recipientName}
                  </p>
                  <p className="font-semibold text-zinc-700">
                    Mobile: +91 {lastOrder.deliveryDetails.recipientPhone}
                  </p>
                  <p className="text-zinc-600 leading-relaxed pt-1">
                    {lastOrder.deliveryDetails.flatHouse},{" "}
                    {lastOrder.deliveryDetails.streetLocality}
                    {lastOrder.deliveryDetails.landmark
                      ? `, Near ${lastOrder.deliveryDetails.landmark}`
                      : ""}
                    <br />
                    Kolkata / Howrah — {lastOrder.deliveryDetails.pincode}
                  </p>
                </div>

                {lastOrder.deliveryDetails.isGift && (
                  <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                        Ordered By (Sender):
                      </span>
                      {lastOrder.deliveryDetails.keepSurprise && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 border border-rose-200 text-[#c8102e] px-2 py-0.5 rounded-full">
                          Anonymous Surprise Gift
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-zinc-900">
                      {lastOrder.deliveryDetails.senderName}
                    </p>
                    {lastOrder.deliveryDetails.senderPhone && (
                      <p className="text-xs font-semibold text-zinc-600">
                        Sender Mobile: +91 {lastOrder.deliveryDetails.senderPhone}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 md:border-l md:border-zinc-100 md:pl-6">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#c8102e]">
                  Scheduled Slot &amp; Personalization
                </h2>
                <div className="text-sm space-y-1.5">
                  <p className="font-bold text-zinc-950">
                    {lastOrder.schedule.deliveryDateLabel}
                  </p>
                  <p className="text-zinc-700 font-semibold">
                    {lastOrder.schedule.slotType === "express"
                      ? "90-Min Express Delivery"
                      : lastOrder.schedule.slotType === "midnight"
                      ? "Midnight Surprise Slot"
                      : "Standard Same-Day Slot"}{" "}
                    • {lastOrder.schedule.slotTimeWindow}
                  </p>
                </div>

                {(lastOrder.personalization.occasion ||
                  lastOrder.personalization.cakeMessage ||
                  lastOrder.personalization.cardMessage ||
                  lastOrder.personalization.deliveryNote) && (
                  <div className="pt-2 space-y-1.5 text-xs bg-zinc-50 rounded-2xl p-3.5 border border-zinc-200/70">
                    {lastOrder.personalization.occasion && (
                      <p>
                        <span className="font-bold text-zinc-800">Occasion: </span>
                        <span className="text-zinc-700">{lastOrder.personalization.occasion}</span>
                      </p>
                    )}
                    {lastOrder.personalization.cakeMessage && (
                      <p>
                        <span className="font-bold text-zinc-800">Message on Cake: </span>
                        <span className="text-zinc-700">
                          &ldquo;{lastOrder.personalization.cakeMessage}&rdquo;
                        </span>
                      </p>
                    )}
                    {lastOrder.personalization.cardMessage && (
                      <p>
                        <span className="font-bold text-zinc-800">Greeting Card Note: </span>
                        <span className="text-zinc-700">
                          &ldquo;{lastOrder.personalization.cardMessage}&rdquo;
                        </span>
                      </p>
                    )}
                    {lastOrder.personalization.deliveryNote && (
                      <p>
                        <span className="font-bold text-zinc-800">Delivery Note: </span>
                        <span className="text-zinc-700">
                          {lastOrder.personalization.deliveryNote}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* 4. Items Ordered & Bill Summary */}
            <section className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xs p-5 sm:p-7 space-y-5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 pb-3 border-b border-zinc-100">
                Items Ordered
              </h2>

              <div className="divide-y divide-zinc-100 space-y-4">
                {lastOrder.items.map((item) => {
                  const perItemAddons = item.addons.reduce((s, a) => s + a.price, 0);
                  const lineTotal = (item.unitBasePrice + perItemAddons) * item.quantity;
                  return (
                    <div key={item.cartItemId} className="pt-4 first:pt-0 flex items-start gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm sm:text-base font-bold text-zinc-950">
                              {item.product.name}
                            </p>
                            <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                              Qty: {item.quantity}
                              {item.weight ? ` • Weight: ${item.weight}` : ""}
                            </p>
                          </div>
                          <span className="text-sm sm:text-base font-black text-zinc-950 shrink-0">
                            ₹{lineTotal}
                          </span>
                        </div>

                        {item.addons.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.addons.map((addon) => (
                              <span
                                key={addon.id}
                                className="text-[11px] font-semibold bg-rose-50 text-[#c8102e] px-2 py-0.5 rounded-md"
                              >
                                + {addon.name}
                                {addon.price > 0 ? ` (₹${addon.price})` : " (Free)"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bill Summary */}
              <div className="pt-4 border-t border-zinc-200 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-zinc-600 font-medium">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-zinc-900">
                    ₹{lastOrder.pricing.itemsSubtotal}
                  </span>
                </div>
                {lastOrder.pricing.addonsSubtotal > 0 && (
                  <div className="flex items-center justify-between text-zinc-600 font-medium">
                    <span>Add-ons</span>
                    <span className="font-bold text-zinc-900">
                      ₹{lastOrder.pricing.addonsSubtotal}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-zinc-600 font-medium">
                  <span>Delivery Slot</span>
                  <span
                    className={`font-bold ${
                      lastOrder.pricing.slotFee === 0 ? "text-emerald-700" : "text-zinc-900"
                    }`}
                  >
                    {lastOrder.pricing.slotFee === 0
                      ? "FREE"
                      : `+₹${lastOrder.pricing.slotFee}`}
                  </span>
                </div>
                {lastOrder.pricing.couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>
                      Coupon Discount
                      {lastOrder.pricing.couponCode ? ` (${lastOrder.pricing.couponCode})` : ""}
                    </span>
                    <span>−₹{lastOrder.pricing.couponDiscount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-200 text-base font-black text-zinc-950">
                  <span>Total Payable on Delivery</span>
                  <span>₹{lastOrder.pricing.grandTotal}</span>
                </div>
              </div>
            </section>

            {/* 5. Simple Bottom Link Only */}
            <div className="pt-2 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#c8102e] hover:underline"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
