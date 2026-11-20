"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BoxIcon, CartIcon } from "./AdminIcons";
import { CheckIcon } from "@/app/components/StorefrontIcons";

export interface DbOrderItem {
  sku?: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
  weight?: string;
  cakeMessage?: string;
  cardMessage?: string;
}

export interface DbOrder {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  delivery_address: string;
  area?: string | null;
  pincode: string;
  slot_type: string;
  slot_time_window?: string | null;
  delivery_date?: string | null;
  items: DbOrderItem[];
  item_count: number;
  items_subtotal: number;
  coupon_code?: string | null;
  coupon_discount: number;
  slot_fee: number;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  status: "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  cake_message?: string | null;
  card_message?: string | null;
  delivery_note?: string | null;
  occasion?: string | null;
  created_at: string;
  updated_at: string;
}

function OrderProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
        <BoxIcon className="w-5 h-5 text-rose-400" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export function printOfficialPackingSlip(order: DbOrder) {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank", "width=880,height=1000");
  if (!win) return;

  const logoUrl = `${window.location.origin}/ms-logo.jpg`;

  const itemsHtml = (order.items || [])
    .map(
      (it, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#fafafa'};">
        <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;vertical-align:middle;">
          <div style="font-weight:700;font-size:13px;color:#0f172a;">${it.name}</div>
          <div style="font-size:11px;color:#64748b;font-family:monospace;margin-top:3px;">
            SKU: <strong style="color:#ea580c;">${it.sku || `MS-ITM-0${idx + 1}`}</strong>
            ${it.weight ? ` &bull; Weight: <strong>${it.weight}</strong>` : ""}
          </div>
          ${it.cakeMessage ? `<div style="font-size:11px;color:#9f1239;margin-top:2px;">Cake Piping: <em>"${it.cakeMessage}"</em></div>` : ""}
          ${it.cardMessage ? `<div style="font-size:11px;color:#1e3a8a;margin-top:2px;">Card Note: <em>"${it.cardMessage}"</em></div>` : ""}
        </td>
        <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#334155;vertical-align:middle;">&#8377;${it.price}</td>
        <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:800;font-size:13px;color:#0f172a;vertical-align:middle;">x${it.qty}</td>
        <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:800;font-size:14px;color:#059669;vertical-align:middle;">&#8377;${it.price * it.qty}</td>
      </tr>`
    )
    .join("");

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Official Dispatch Slip - ${order.order_number}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 12mm 8mm 12mm;
    }
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: #ffffff;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .slip-container {
      min-height: calc(100vh - 16px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16px 20px;
      position: relative;
      background: transparent;
    }
    /* Logo Watermark in background */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 440px;
      height: 440px;
      opacity: 0.055;
      pointer-events: none;
      z-index: -1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .watermark img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 16px;
      margin-bottom: 18px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #fecdd3;
      box-shadow: 0 2px 8px rgba(200, 16, 46, 0.08);
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #c8102e;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-top: 3px;
    }
    .brand-meta {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    .order-box {
      text-align: right;
    }
    .order-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      background: #f1f5f9;
      color: #475569;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 4px;
    }
    .order-id {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      font-family: monospace;
      letter-spacing: 0.5px;
    }
    .order-meta {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .order-status-pill {
      display: inline-block;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      padding: 2px 10px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11px;
      margin-top: 4px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 12px;
      line-height: 1.6;
    }
    .card-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 6px;
      letter-spacing: 0.6px;
    }
    .personalization-card {
      background: #fff1f2;
      border: 1px solid #fecdd3;
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 12px;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .personalization-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #9f1239;
      letter-spacing: 0.6px;
      margin-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 10px 14px;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 10px;
      color: #475569;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }
    .summary-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 20px;
    }
    .instructions-box {
      flex: 1;
      background: #fefce8;
      border: 1px dashed #fde047;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 11px;
      color: #713f12;
      line-height: 1.5;
    }
    .instructions-title {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
      color: #854d0e;
    }
    .totals {
      width: 300px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 12px;
      line-height: 1.8;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
    }
    .grand {
      font-size: 15px;
      font-weight: 900;
      color: #059669;
      border-top: 2px solid #e2e8f0;
      padding-top: 6px;
      margin-top: 4px;
    }
    .signatures-block {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 14px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      margin-top: auto;
      margin-bottom: 14px;
    }
    .sign-box {
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
      background: #fafafa;
    }
    .sign-title {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .sign-line {
      border-top: 1px solid #94a3b8;
      font-size: 10px;
      color: #64748b;
      padding-top: 4px;
    }
    .footer {
      text-align: center;
      border-top: 2px solid #e2e8f0;
      padding-top: 12px;
      font-size: 10px;
      color: #64748b;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <!-- Watermark Element -->
  <div class="watermark">
    <img src="${logoUrl}" alt="MS Flowers Watermark" />
  </div>

  <div class="slip-container">
    <div>
      <!-- Top Brand Header -->
      <div class="header">
        <div class="brand-section">
          <img src="${logoUrl}" alt="MS Flowers &amp; Cakes Logo" class="brand-logo" />
          <div>
            <div class="brand-title">MS Flowers &amp; Cakes</div>
            <div class="brand-sub">Kolkata Premier Floral &amp; Cake Boutique &bull; 90-Min Express Dispatch</div>
            <div class="brand-meta">Central Hub: Chingrighata, Salt Lake Bypass, Kolkata &bull; Helpline: +91 6295233296</div>
          </div>
        </div>
        <div class="order-box">
          <div class="order-badge">OFFICIAL DISPATCH SLIP</div>
          <div class="order-id">${order.order_number}</div>
          <div class="order-meta">Placed: ${order.created_at ? order.created_at.slice(0, 16).replace("T", " ") : new Date().toISOString().slice(0, 10)}</div>
          <div class="order-status-pill">${order.status}</div>
        </div>
      </div>

      <!-- Customer & Delivery Info Grid -->
      <div class="grid">
        <div class="card">
          <div class="card-title">Customer / Sender Information</div>
          <div style="font-size:13px;"><strong>${order.customer_name}</strong></div>
          <div>Mobile: <strong>${order.customer_phone}</strong></div>
          <div>Email: ${order.customer_email}</div>
          ${order.recipient_name && order.recipient_name !== order.customer_name ? `
            <div style="margin-top:6px;padding-top:6px;border-top:1px dashed #cbd5e1;">
              Gift Recipient: <strong>${order.recipient_name}</strong> (${order.recipient_phone})
            </div>
          ` : ""}
        </div>

        <div class="card">
          <div class="card-title">Delivery Location &amp; Time Slot</div>
          <div style="font-size:13px;"><strong>${order.delivery_address}</strong></div>
          <div>Area: <strong>${order.area || "Kolkata Central"}</strong> &bull; Pincode: <strong style="color:#c8102e;background:#ffe4e6;padding:1px 6px;border-radius:4px;">${order.pincode}</strong></div>
          <div style="margin-top:6px;color:#c8102e;font-weight:800;">
            Delivery Slot: ${order.slot_time_window || order.slot_type}
          </div>
          <div>Scheduled Date: <strong>${order.delivery_date || "Today"}</strong></div>
        </div>
      </div>

      <!-- Personalization / Messages (if any) -->
      ${order.cake_message || order.card_message ? `
        <div class="personalization-card">
          <div class="personalization-title">Celebration Personalization Instructions</div>
          ${order.cake_message ? `<div>Cake Piping Text: <strong style="color:#9f1239;">"${order.cake_message}"</strong></div>` : ""}
          ${order.card_message ? `<div>Greeting Card Note: <em>"${order.card_message}"</em></div>` : ""}
        </div>
      ` : ""}

      <!-- Ordered Items Table -->
      <table>
        <thead>
          <tr>
            <th>Product Details &amp; SKU</th>
            <th style="text-align:center;">Unit Price</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Instructions & Billing Summary -->
      <div class="summary-section">
        <div class="instructions-box">
          <div class="instructions-title">Dispatch &amp; Handling Protocol</div>
          <div>&bull; Fresh florals must be maintained upright in water stem vials.</div>
          <div>&bull; Handcrafted celebration cake: store below 18&deg;C, do not tilt or stack.</div>
          <div>&bull; Rider must verify recipient contact (+91 ${order.recipient_phone || order.customer_phone}) before arrival.</div>
          ${order.delivery_note ? `<div style="margin-top:4px;font-weight:700;color:#991b1b;">Note: "${order.delivery_note}"</div>` : ""}
        </div>

        <div class="totals">
          <div class="total-row"><span>Items Subtotal:</span><span>&#8377;${order.items_subtotal}</span></div>
          ${order.coupon_discount > 0 ? `<div class="total-row" style="color:#059669;"><span>Coupon Discount (${order.coupon_code || "OFFER"}):</span><span>-&#8377;${order.coupon_discount}</span></div>` : ""}
          <div class="total-row"><span>Delivery Slot Fee:</span><span>${order.slot_fee === 0 ? '<strong style="color:#059669;">FREE</strong>' : `&#8377;${order.slot_fee}`}</span></div>
          <div class="total-row grand">
            <span>Total Payable:</span>
            <span>&#8377;${order.grand_total}</span>
          </div>
          <div style="font-size:11px;color:#64748b;text-align:right;margin-top:2px;">
            Payment: <strong>${order.payment_method}</strong> (${order.payment_status || "Pending"})
          </div>
        </div>
      </div>
    </div>

    <!-- Official Signatures Block -->
    <div>
      <div class="signatures-block">
        <div class="sign-box">
          <div class="sign-title">Hub Dispatcher</div>
          <div class="sign-line">Quality Checked &amp; Sealed</div>
        </div>
        <div class="sign-box">
          <div class="sign-title">Delivery Executive</div>
          <div class="sign-line">Signature &amp; Dispatch Time</div>
        </div>
        <div class="sign-box">
          <div class="sign-title">Recipient Acknowledgment</div>
          <div class="sign-line">Signature / Received in Good Condition</div>
        </div>
      </div>

      <!-- Official Footer -->
      <div class="footer">
        Thank you for choosing <strong>MS Flowers &amp; Cakes Kolkata</strong> &bull; Authorized Dispatch Slip &bull; Central Hub: Chingrighata, Salt Lake Bypass, Kolkata &bull; Helpline: +91 6295233296 &bull; support@msflowers.in
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.focus();
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`);
  win.document.close();
}

export function OrdersView({
  orders: initialOrders,
  onUpdateStatus,
}: {
  orders?: any[];
  onUpdateStatus?: (orderId: string, status: any) => void;
}) {
  const [ordersList, setOrdersList] = useState<DbOrder[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalVolume: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadOrders(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.orders && Array.isArray(data.orders)) {
        setOrdersList(data.orders);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId: string, nextStatus: string) {
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus as any } : null));
    }

    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      loadOrders();
    }
  }

  function handleOpenWhatsApp(order: DbOrder) {
    const phone = (order.customer_phone || "").replace(/\D/g, "");
    if (!phone) return;
    const msg = `Hello ${order.customer_name},\nThis is an update regarding your MS Flowers order ${order.order_number}.\nStatus: ${order.status}\nDelivery Address: ${order.delivery_address}\nTotal: ₹${order.grand_total} (${order.payment_method})\nThank you for choosing MS Flowers Kolkata!`;
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ordersList;
    return ordersList.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.delivery_address.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
    );
  }, [ordersList, searchQuery]);

  // ---------------------------------------------------------------------------
  // View A: Detailed Order View (Matching Images 2, 3, 4)
  // ---------------------------------------------------------------------------
  if (selectedOrder) {
    const LIFECYCLE_STEPS: Array<"Confirmed" | "Processing" | "Shipped" | "Delivered"> = [
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
    ];

    const currentStepIndex =
      selectedOrder.status === "Cancelled"
        ? -1
        : LIFECYCLE_STEPS.indexOf(selectedOrder.status as any);

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Navigation & Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.8 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
            >
              <span>Back to Orders</span>
            </button>
            <span className="text-xs font-bold text-gray-500">
              <span className="text-rose-600 font-mono font-black">{selectedOrder.order_number}</span>
              <span className="mx-1.5">&bull;</span>
              <span>{selectedOrder.customer_name}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => printOfficialPackingSlip(selectedOrder)}
              className="px-3.5 py-1.8 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
              </svg>
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenWhatsApp(selectedOrder)}
              className="px-3.5 py-1.8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Order Main Banner Header */}
        <div className="rounded-3xl border border-rose-100 bg-white text-gray-900 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
              <BoxIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 font-mono">
                  Order {selectedOrder.order_number}
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Placed on {selectedOrder.created_at ? selectedOrder.created_at.replace("T", " ").slice(0, 19) : "Recently"} &bull; {selectedOrder.item_count} Products ({selectedOrder.item_count} total units)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Fulfillment Status
              </span>
              <span className="text-xs font-bold text-emerald-600">
                &bull; {selectedOrder.status}
              </span>
            </div>
            <select
              value={selectedOrder.status}
              onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* 2 Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols wide): Products Table + Lifecycle */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Ordered Products & SKU Numbers */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-orange-500 font-bold text-base">&bull;</span>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">
                  Ordered Products &amp; SKU Numbers
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-rose-100">
                    <tr>
                      <th className="px-4 py-3">Product Details</th>
                      <th className="px-4 py-3">SKU Code</th>
                      <th className="px-4 py-3 text-center">Unit Price</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/60">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/20 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <OrderProductThumbnail src={item.image} alt={item.name} />
                            <div>
                              <div className="font-bold text-gray-900 text-xs sm:text-sm">{item.name}</div>
                              <div className="text-[11px] text-gray-400">Item ID: itm-0{idx + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 font-mono font-bold text-[11px]">
                            {item.sku || `MS-FL-0${idx + 1}`}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-gray-700">
                          &#8377;{item.price}
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-gray-900">
                          x{item.qty}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-emerald-600 text-sm">
                          &#8377;{item.price * item.qty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Order Fulfillment Lifecycle Stepper */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500 font-bold text-base">&bull;</span>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">
                  Order Fulfillment Lifecycle
                </h2>
              </div>

              {selectedOrder.status === "Cancelled" ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
                  This order was marked as Cancelled.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LIFECYCLE_STEPS.map((stepName, sIdx) => {
                    const isDone = sIdx <= currentStepIndex;
                    const isCurrent = sIdx === currentStepIndex;

                    return (
                      <button
                        key={stepName}
                        type="button"
                        onClick={() => handleStatusChange(selectedOrder.id, stepName)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-orange-50 border-orange-300 ring-2 ring-orange-200 shadow-sm"
                            : isDone
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              isDone ? "bg-emerald-600 text-white" : "bg-gray-300 text-gray-700"
                            }`}
                          >
                            {isDone ? <CheckIcon className="w-3 h-3 text-white" /> : sIdx + 1}
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              isCurrent ? "text-orange-900" : isDone ? "text-emerald-900" : "text-gray-500"
                            }`}
                          >
                            {sIdx + 1}. {stepName}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 pl-7">
                          {sIdx === 0
                            ? "Order received"
                            : sIdx === 1
                            ? "Packaging in hub"
                            : sIdx === 2
                            ? "Handed to rider"
                            : "Delivered to door"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Personalization Messages */}
            {(selectedOrder.cake_message || selectedOrder.card_message || selectedOrder.delivery_note) && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs text-xs space-y-2">
                <h3 className="font-bold uppercase tracking-wider text-rose-800 text-[11px]">
                  Celebration Personalization &amp; Delivery Instructions
                </h3>
                {selectedOrder.cake_message && (
                  <div>
                    <span className="font-semibold text-gray-700">Cake Piping: </span>
                    <span className="font-bold text-gray-900">&ldquo;{selectedOrder.cake_message}&rdquo;</span>
                  </div>
                )}
                {selectedOrder.card_message && (
                  <div>
                    <span className="font-semibold text-gray-700">Greeting Card: </span>
                    <span className="italic text-gray-800">&ldquo;{selectedOrder.card_message}&rdquo;</span>
                  </div>
                )}
                {selectedOrder.delivery_note && (
                  <div>
                    <span className="font-semibold text-gray-700">Rider Note: </span>
                    <span className="text-gray-800">{selectedOrder.delivery_note}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Customer Info, Address & Billing Summary */}
          <div className="space-y-6">
            {/* Customer Information Card */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-500 font-bold">&bull;</span>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
                  Customer Information
                </h2>
              </div>

              <div>
                <div className="font-bold text-gray-900 text-sm">{selectedOrder.customer_name}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  <span>{selectedOrder.customer_phone}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{selectedOrder.customer_email}</div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp(selectedOrder)}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-emerald-200"
              >
                <span>WhatsApp Customer</span>
              </button>
            </div>

            {/* Delivery Address Card */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold">&bull;</span>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
                  Delivery Address
                </h2>
              </div>
              <p className="text-xs text-gray-800 font-medium leading-relaxed">
                {selectedOrder.delivery_address}
              </p>
              <div className="pt-2 border-t border-rose-100 text-xs text-gray-500 flex items-center gap-2">
                <span className="font-bold text-rose-600">Slot:</span>
                <span>{selectedOrder.slot_time_window || selectedOrder.slot_type}</span>
              </div>
            </div>

            {/* Payment & Billing Summary Card */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">&#8377;</span>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
                  Payment &amp; Billing Summary
                </h2>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Payment Mode:</span>
                <span className="font-bold text-gray-900">{selectedOrder.payment_method}</span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-rose-100 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-gray-900">&#8377;{selectedOrder.items_subtotal}</span>
                </div>
                {selectedOrder.coupon_discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>Coupon ({selectedOrder.coupon_code || "OFFER"}):</span>
                    <span>-&#8377;{selectedOrder.coupon_discount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-gray-600">
                  <span>Shipping Fee:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedOrder.slot_fee === 0 ? "FREE" : `+₹${selectedOrder.slot_fee}`}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-rose-100 text-base font-black">
                  <span className="text-gray-900">Grand Total:</span>
                  <span className="text-emerald-600">&#8377;{selectedOrder.grand_total}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => printOfficialPackingSlip(selectedOrder)}
                className="w-full py-2.8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition-all shadow-md shadow-orange-300/40 cursor-pointer"
              >
                Print Official Packing Slip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // View B: Orders List View (Matching Image 1)
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
            Orders Management
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Customer Orders ({ordersList.length})
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Database Live
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track and update fulfillment statuses in real-time.
          </p>
        </div>

        {/* Refresh & Volume Metric */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl border border-rose-100 bg-white hover:bg-rose-50 text-gray-700 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
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

          <div className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-xs">
            Total Volume: <span className="text-emerald-400 font-extrabold">&#8377;{stats.totalVolume.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Orders Cards List */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-rose-100">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading live customer orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-rose-100">
          <CartIcon className="w-10 h-10 text-rose-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">No customer orders yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Live orders placed through the checkout page will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const dateStr = order.created_at ? order.created_at.slice(0, 19).replace("T", " ") : "2026-11-18";
            const firstItem = order.items?.[0];

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-rose-100 bg-white text-gray-900 p-5 sm:p-6 shadow-xs space-y-4 hover:border-rose-200 transition-colors"
              >
                {/* Header: Order Number + Date + Status Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm sm:text-base font-extrabold text-rose-700 tracking-wider">
                      {order.order_number}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${
                        order.status === "Delivered"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : order.status === "Cancelled"
                          ? "bg-red-50 border-red-300 text-red-800"
                          : order.status === "Shipped"
                          ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                          : "bg-amber-50 border-amber-300 text-amber-800"
                      }`}
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* 3 Columns: Customer, Address, Payment & Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Customer
                    </span>
                    <div className="font-bold text-gray-900 text-sm">{order.customer_name}</div>
                    <div className="text-gray-500 mt-0.5">{order.customer_phone}</div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Delivery Address
                    </span>
                    <div className="text-gray-700 leading-relaxed font-medium">
                      {order.delivery_address} - <strong className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-mono font-bold">{order.pincode}</strong>
                    </div>
                  </div>

                  {/* Payment & Items */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Payment &amp; Items
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-emerald-600">
                        &#8377;{order.grand_total}
                      </span>
                      {order.coupon_code && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                          {order.coupon_code} (-&#8377;{order.coupon_discount})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {order.payment_method}
                    </div>

                    {/* Item tag */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-[10px]">
                        {firstItem?.sku || "MS-FL-01"}
                      </span>
                      <span className="text-gray-800 font-semibold truncate max-w-[180px]">
                        {firstItem?.name || "Handcrafted Blooms"}
                      </span>
                      <span className="text-gray-500 font-bold">x{firstItem?.qty || 1}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Order Details Page (SKU &amp; Billing)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => printOfficialPackingSlip(order)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Print Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(order)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
