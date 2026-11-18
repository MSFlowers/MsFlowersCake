"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getStoredCustomer, getStoredToken } from "../lib/customerAuth";
import { useShopState } from "../data/shopState";

interface OrderItem {
  id: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  recipient_name?: string;
  recipient_phone?: string;
  delivery_address: string;
  area?: string;
  pincode: string;
  slot_type?: string;
  slot_time_window?: string;
  delivery_date?: string;
  items: OrderItem[];
  item_count: number;
  items_subtotal: number;
  coupon_code?: string;
  coupon_discount?: number;
  slot_fee?: number;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  status: "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  cake_message?: string;
  card_message?: string;
  delivery_note?: string;
  created_at: string;
}

const FULFILLMENT_STEPS = [
  { step: 1, key: "Confirmed", label: "Confirmed", sub: "Order received" },
  { step: 2, key: "Processing", label: "Processing", sub: "Preparing bouquet/cake" },
  { step: 3, key: "Shipped", label: "Shipped", sub: "Handed to express rider" },
  { step: 4, key: "Delivered", label: "Delivered", sub: "Delivered to recipient" },
];

function getStatusIndex(status: string) {
  switch (status) {
    case "Confirmed":
      return 1;
    case "Processing":
      return 2;
    case "Shipped":
      return 3;
    case "Delivered":
      return 4;
    default:
      return 1;
  }
}

export default function MyOrdersPage() {
  const { lastOrder } = useShopState();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [customer, setCustomer] = useState(getStoredCustomer());

  useEffect(() => {
    setCustomer(getStoredCustomer());
  }, []);

  const fetchOrders = async (lookupEmail?: string) => {
    try {
      setLoading(true);
      const token = getStoredToken();
      const email = lookupEmail || customer?.email;
      const url = email
        ? `/api/customer/orders?email=${encodeURIComponent(email)}`
        : "/api/customer/orders";

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders(data.orders);
      } else {
        // Fallback to local session lastOrder if available
        if (lastOrder) {
          const po = lastOrder;
          const mapped: CustomerOrder = {
            id: po.orderId,
            order_number: po.orderId,
            customer_name: po.deliveryDetails?.recipientName || "Valued Customer",
            customer_email: customer?.email || "customer@msflowers.in",
            customer_phone: po.deliveryDetails?.recipientPhone || "",
            recipient_name: po.deliveryDetails?.recipientName,
            recipient_phone: po.deliveryDetails?.recipientPhone,
            delivery_address: `${po.deliveryDetails?.flatHouse || ""}, ${po.deliveryDetails?.streetLocality || ""}`,
            area: po.deliveryDetails?.areaLabel,
            pincode: po.deliveryDetails?.pincode || "700105",
            slot_type: po.schedule?.slotType,
            slot_time_window: po.schedule?.slotTimeWindow,
            delivery_date: po.schedule?.deliveryDateLabel,
            items: po.items.map((it) => ({
              id: it.product.id,
              name: it.product.name,
              sku: (it.product as any).sku || `MS-${it.product.id.slice(0, 5).toUpperCase()}`,
              price: it.unitBasePrice,
              quantity: it.quantity,
              image: it.product.images?.[0] || "",
            })),
            item_count: po.items.reduce((s: number, it) => s + it.quantity, 0),
            items_subtotal: po.pricing?.itemsSubtotal || 0,
            coupon_code: po.pricing?.couponCode,
            coupon_discount: po.pricing?.couponDiscount || 0,
            slot_fee: po.pricing?.slotFee || 0,
            grand_total: po.pricing?.grandTotal || 0,
            payment_method: po.paymentMethod || "Cash on Delivery (COD)",
            payment_status: "Pending",
            status: "Confirmed",
            cake_message: po.personalization?.cakeMessage,
            card_message: po.personalization?.cardMessage,
            delivery_note: po.personalization?.deliveryNote,
            created_at: new Date().toISOString(),
          };
          setOrders([mapped]);
        } else {
          setOrders([]);
        }
      }
    } catch (err) {
      console.warn("Failed fetching customer orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [customer?.email, lastOrder]);

  return (
    <div className="min-h-screen bg-[#faf8f7] text-zinc-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs text-zinc-500 font-semibold mb-3">
            <Link href="/" className="hover:text-[#c8102e] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-bold">My Orders</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-serif">
                My Orders &amp; Tracking
              </h1>
              <p className="text-sm text-zinc-600 mt-1">
                Real-time fulfillment status of your fresh blooms, cakes, and gift orders across Kolkata.
              </p>
            </div>

            {customer ? (
              <div className="flex items-center gap-3 bg-white border border-rose-200/80 rounded-2xl px-4 py-2.5 shadow-xs">
                <span className="w-9 h-9 rounded-full bg-rose-600 text-white font-bold text-sm flex items-center justify-center">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="text-xs font-bold text-zinc-900">{customer.name}</div>
                  <div className="text-[11px] text-zinc-500">{customer.email}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs transition-colors"
                >
                  Sign In to View All Orders
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Guest Lookup Bar (if not logged in) */}
        {!customer && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Track Guest Orders by Email
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchEmail.trim()) fetchOrders(searchEmail.trim());
              }}
              className="flex gap-2.5 max-w-md"
            >
              <input
                type="email"
                required
                placeholder="Enter order email address..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-hidden focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Track
              </button>
            </form>
          </div>
        )}

        {/* Orders Listing */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center text-sm text-zinc-500 font-medium">
            <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200/90 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-zinc-900">No orders found</h2>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
              You haven&apos;t placed any floral or cake orders yet. Handcrafted blooms and freshly baked cakes are just a click away!
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8102e] text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
            >
              Explore Fresh Blooms
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const activeIndex = getStatusIndex(order.status);
              const isCancelled = order.status === "Cancelled";

              return (
                <div
                  key={order.id}
                  className="bg-white border border-zinc-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-zinc-50 to-rose-50/30 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-base text-zinc-950">
                          {order.order_number}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                            isCancelled
                              ? "bg-red-100 text-red-700"
                              : order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.status === "Shipped"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCancelled
                                ? "bg-red-500"
                                : order.status === "Delivered"
                                ? "bg-emerald-500"
                                : order.status === "Shipped"
                                ? "bg-indigo-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        Placed on: {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/916201069758?text=${encodeURIComponent(
                          `Hello MS Flowers, I need assistance regarding my Order ${order.order_number}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.17 1.6 6L0 24l6.23-1.63a11.93 11.93 0 0 0 5.83 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.43zM12.06 21.88h-.01c-1.8 0-3.56-.48-5.1-1.39l-.36-.21-3.79.99 1.01-3.69-.24-.38a9.92 9.92 0 0 1-1.53-5.23c0-5.5 4.47-9.97 9.98-9.97 2.66 0 5.16 1.04 7.04 2.92a9.93 9.93 0 0 1 2.92 7.05c0 5.5-4.47 9.97-9.98 9.97z" />
                        </svg>
                        WhatsApp Support
                      </a>
                    </div>
                  </div>

                  {/* 4-Step Fulfillment Stepper */}
                  {!isCancelled && (
                    <div className="p-5 sm:p-6 bg-white border-b border-zinc-100">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
                        Delivery Lifecycle
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {FULFILLMENT_STEPS.map((s) => {
                          const isDone = activeIndex >= s.step;
                          const isCurrent = activeIndex === s.step;

                          return (
                            <div
                              key={s.step}
                              className={`p-3 rounded-2xl border transition-all ${
                                isCurrent
                                  ? "bg-rose-50 border-rose-500 ring-2 ring-rose-100"
                                  : isDone
                                  ? "bg-emerald-50/60 border-emerald-300"
                                  : "bg-zinc-50 border-zinc-200 opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                    isDone
                                      ? "bg-emerald-600 text-white"
                                      : "bg-zinc-300 text-zinc-700"
                                  }`}
                                >
                                  {isDone ? "✓" : s.step}
                                </span>
                                <span className="text-xs font-bold text-zinc-900">
                                  {s.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 mt-1 pl-7">
                                {s.sub}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Details Body */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items Table */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Items in this Order ({order.items.length})
                      </h4>
                      <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-2xl overflow-hidden">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 rounded-xl object-cover border border-zinc-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-sm">
                                  🌸
                                </div>
                              )}
                              <div>
                                <h5 className="text-xs font-bold text-zinc-900 line-clamp-1">
                                  {item.name}
                                </h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {item.sku && (
                                    <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                                      {item.sku}
                                    </span>
                                  )}
                                  <span className="text-xs text-zinc-500">
                                    Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-zinc-950">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Customization Messages if any */}
                      {(order.cake_message || order.card_message || order.delivery_note) && (
                        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs space-y-1.5">
                          {order.cake_message && (
                            <p>
                              <b className="text-rose-900">🎂 Cake Message:</b>{" "}
                              <span className="text-zinc-700">&quot;{order.cake_message}&quot;</span>
                            </p>
                          )}
                          {order.card_message && (
                            <p>
                              <b className="text-rose-900">💌 Greeting Card:</b>{" "}
                              <span className="text-zinc-700">&quot;{order.card_message}&quot;</span>
                            </p>
                          )}
                          {order.delivery_note && (
                            <p>
                              <b className="text-rose-900">📝 Delivery Note:</b>{" "}
                              <span className="text-zinc-700">{order.delivery_note}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Address & Billing Summary */}
                    <div className="space-y-4">
                      {/* Destination */}
                      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                          Delivery Destination
                        </h4>
                        <div className="text-xs font-bold text-zinc-900">
                          {order.recipient_name || order.customer_name}
                        </div>
                        <div className="text-xs text-zinc-600 mt-0.5">
                          📞 {order.recipient_phone || order.customer_phone}
                        </div>
                        <div className="text-xs text-zinc-600 mt-2 leading-relaxed">
                          {order.delivery_address}
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100/70 text-rose-800">
                          <span>📍 Kolkata Hub Pin:</span>
                          <span className="font-mono">{order.pincode}</span>
                        </div>
                      </div>

                      {/* Billing Breakdown */}
                      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                          Payment &amp; Billing
                        </h4>
                        <div className="flex justify-between text-zinc-600">
                          <span>Items Subtotal:</span>
                          <span>₹{order.items_subtotal.toLocaleString("en-IN")}</span>
                        </div>
                        {order.coupon_discount ? (
                          <div className="flex justify-between text-emerald-700 font-medium">
                            <span>Coupon ({order.coupon_code || "OFFER"}):</span>
                            <span>-₹{order.coupon_discount.toLocaleString("en-IN")}</span>
                          </div>
                        ) : null}
                        {order.slot_fee ? (
                          <div className="flex justify-between text-zinc-600">
                            <span>Delivery Slot Fee:</span>
                            <span>+₹{order.slot_fee.toLocaleString("en-IN")}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between text-emerald-700 font-medium">
                            <span>Delivery Fee:</span>
                            <span>FREE (Standard)</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm font-extrabold text-zinc-950">
                          <span>Grand Total:</span>
                          <span className="text-rose-700">₹{order.grand_total.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 pt-1">
                          Payment Mode: <b>{order.payment_method}</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
