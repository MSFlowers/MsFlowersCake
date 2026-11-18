"use client";


import ProductsManager from "./ProductsManager";
import React, { useEffect, useMemo, useState } from "react";
import {
  AdminCoupon,
  AdminCustomer,
  AdminInquiry,
  AdminOrder,
  AdminReview,
  AdminSubscriber,
  CatalogProductRow,
  LowStockItem,
  OrderStatus,
} from "@/app/data/adminState";
import {
  BoxIcon,
  CartIcon,
  CheckCircleIcon,
  LayersIcon,
  MailIcon,
  MessageSquareIcon,
  StarIcon,
  TicketIcon,
  UsersIcon,
  WarningIcon,
} from "./AdminIcons";

const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Out for Delivery",
  "Delivered",
];

function statusBadgeClasses(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Processing":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "Out for Delivery":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "Delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
}

function resolveOrderDetails(order: AdminOrder) {
  const primarySku =
    order.sku ||
    `MS-ORD-${order.orderId.replace(/[^0-9]/g, "") || "101"}`;

  const items =
    order.items && order.items.length > 0
      ? order.items
      : order.itemsSummary
      ? order.itemsSummary
          .split("+")
          .map((part, idx, arr) => ({
            sku: idx === 0 ? primarySku : `${primarySku}-${idx + 1}`,
            name: part.trim(),
            qty: 1,
            price:
              idx === arr.length - 1
                ? Math.max(
                    0,
                    order.totalAmount -
                      Math.floor(order.totalAmount / arr.length) *
                        (arr.length - 1)
                  )
                : Math.floor(order.totalAmount / arr.length),
          }))
      : [];

  const deliveryFee = order.deliveryFee ?? 0;
  const discount = order.discount ?? 0;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return {
    primarySku,
    allSkusLabel: items.map((i) => i.sku).join(", ") || primarySku,
    items,
    subtotal,
    deliveryFee,
    discount,
    deliveryAddress:
      order.deliveryAddress ||
      `${order.area || "Kolkata"}, Kolkata - ${order.pincode || ""}`,
    recipientName: order.recipientName || order.customerName || "Customer",
    recipientPhone: order.recipientPhone || order.customerPhone || "",
    paymentMethod: order.paymentMethod || "UPI / Online",
    paymentStatus: order.paymentStatus || "Paid",
    giftMessage: order.giftMessage || "",
  };
}

function printOrderReceipt(order: AdminOrder) {
  const win = window.open("", "_blank", "width=900,height=920");
  if (!win) {
    window.print();
    return;
  }

  const details = resolveOrderDetails(order);
  const formattedAmount = order.totalAmount.toLocaleString("en-IN");
  const logoUrl = `${window.location.origin}/ms-logo.jpg`;

  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt - ${order.orderId} | MS Flowers</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 0;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      html, body {
        width: 100%;
        background: #fff;
        color: #111827;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        line-height: 1.5;
      }
      .page {
        width: 100%;
        max-width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        padding: 14mm 15mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid #be123c;
        margin-bottom: 20px;
      }
      .brand-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .brand-logo {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        object-fit: cover;
        border: 1px solid #fecdd3;
        flex-shrink: 0;
      }
      .brand {
        font-size: 22px;
        font-weight: 800;
        color: #be123c;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }
      .tagline {
        font-size: 11.5px;
        color: #4b5563;
        margin-top: 2px;
      }
      .invoice-meta {
        text-align: right;
        flex-shrink: 0;
      }
      .invoice-title {
        font-size: 17px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #111827;
      }
      .invoice-sub {
        font-size: 12px;
        color: #374151;
        margin-top: 3px;
      }
      .status-pill {
        display: inline-block;
        margin-top: 6px;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        background: #fff1f2;
        color: #be123c;
        border: 1.5px solid #be123c;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-bottom: 20px;
      }
      .info-card {
        border: 1px solid #d1d5db;
        background: #fff9fa;
        border-radius: 10px;
        padding: 13px 15px;
      }
      .card-title {
        font-size: 10.5px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #9f1239;
        margin-bottom: 7px;
      }
      .info-line {
        font-size: 12.5px;
        color: #374151;
        margin-bottom: 3px;
        word-wrap: break-word;
      }
      .info-line strong {
        color: #111827;
      }
      table {
        width: 100%;
        table-layout: fixed;
        border-collapse: collapse;
        margin-bottom: 20px;
        border: 1px solid #d1d5db;
      }
      thead th {
        background: #fff1f2;
        color: #111827;
        font-size: 10.5px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 10px 10px;
        text-align: left;
        border-bottom: 1.5px solid #be123c;
      }
      thead th.num,
      tbody td.num {
        text-align: right;
      }
      tbody td {
        padding: 10px 10px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 12.5px;
        vertical-align: middle;
        word-wrap: break-word;
      }
      .sku {
        display: inline-block;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 700;
        color: #9f1239;
        background: #fff1f2;
        border: 1px solid #fda4af;
        padding: 1px 6px;
        border-radius: 4px;
        white-space: nowrap;
      }
      .bottom-grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 18px;
        align-items: start;
        margin-bottom: 22px;
      }
      .gift-box {
        border: 1px dashed #9f1239;
        background: #fff9fa;
        border-radius: 10px;
        padding: 13px 15px;
      }
      .gift-text {
        font-size: 12.5px;
        font-style: italic;
        color: #881337;
      }
      .totals-box {
        border: 1px solid #d1d5db;
        border-radius: 10px;
        padding: 13px 15px;
      }
      .total-line {
        display: flex;
        justify-content: space-between;
        font-size: 12.5px;
        color: #374151;
        margin-bottom: 6px;
      }
      .grand-total {
        border-top: 2px solid #111827;
        margin-top: 9px;
        padding-top: 9px;
        display: flex;
        justify-content: space-between;
        font-size: 15.5px;
        font-weight: 800;
        color: #111827;
      }
      .terms-sign {
        display: grid;
        grid-template-columns: 1.4fr 0.6fr;
        gap: 20px;
        align-items: end;
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid #e5e7eb;
      }
      .terms {
        font-size: 11px;
        color: #4b5563;
        line-height: 1.55;
      }
      .terms strong {
        color: #111827;
        display: block;
        margin-bottom: 3px;
      }
      .sign-box {
        text-align: right;
        font-size: 11px;
        color: #4b5563;
      }
      .sign-line {
        border-top: 1px solid #9ca3af;
        padding-top: 5px;
        margin-top: 26px;
        font-weight: 700;
        color: #111827;
      }
      .footer {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #d1d5db;
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div>
        <div class="top-bar">
          <div class="brand-wrap">
            <img src="${logoUrl}" alt="MS Flowers Logo" class="brand-logo" />
            <div>
              <div class="brand">MS Flowers &amp; Cakes</div>
              <div class="tagline">Fresh Blooms, Cakes &amp; Celebrations &bull; Chingrighata, Kolkata</div>
              <div class="tagline" style="margin-top:4px;">Order SKU(s): <span class="sku">${details.allSkusLabel}</span></div>
            </div>
          </div>
          <div class="invoice-meta">
            <div class="invoice-title">Order Receipt</div>
            <div class="invoice-sub"><strong>${order.orderId}</strong> &bull; ${order.placedAt}</div>
            <div><span class="status-pill">${order.status}</span></div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <div class="card-title">Customer &amp; Billing</div>
            <div class="info-line"><strong>${order.customerName}</strong></div>
            <div class="info-line">Phone: ${order.customerPhone}</div>
            <div class="info-line">Payment: <strong>${details.paymentMethod}</strong> (${details.paymentStatus})</div>
          </div>
          <div class="info-card">
            <div class="card-title">Delivery Details</div>
            <div class="info-line">Recipient: <strong>${details.recipientName}</strong> (${details.recipientPhone})</div>
            <div class="info-line">${details.deliveryAddress} &ndash; ${order.pincode}</div>
            <div class="info-line">Slot: <strong>${order.slotLabel}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 6%;">#</th>
              <th style="width: 19%;">SKU</th>
              <th style="width: 41%;">Item Description</th>
              <th class="num" style="width: 8%;">Qty</th>
              <th class="num" style="width: 13%;">Unit Price</th>
              <th class="num" style="width: 13%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${details.items
              .map(
                (item, i) => `<tr>
                  <td>${i + 1}</td>
                  <td><span class="sku">${item.sku}</span></td>
                  <td><strong>${item.name}</strong></td>
                  <td class="num">${item.qty}</td>
                  <td class="num">&#8377;${item.price.toLocaleString("en-IN")}</td>
                  <td class="num"><strong>&#8377;${(item.price * item.qty).toLocaleString("en-IN")}</strong></td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <div class="bottom-grid">
          <div>
            ${
              details.giftMessage
                ? `<div class="gift-box">
                    <div class="card-title">Free Greeting Card Message</div>
                    <div class="gift-text">&ldquo;${details.giftMessage}&rdquo;</div>
                  </div>`
                : `<div class="gift-box">
                    <div class="card-title">Store Handling Note</div>
                    <div class="info-line">Handle with care. Keep fresh blooms hydrated and cakes refrigerated until delivery.</div>
                  </div>`
            }
          </div>

          <div class="totals-box">
            <div class="total-line">
              <span>Items Subtotal (${order.itemCount})</span>
              <span>&#8377;${details.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div class="total-line">
              <span>Delivery Charge</span>
              <span>${details.deliveryFee === 0 ? "FREE" : `&#8377;${details.deliveryFee.toLocaleString("en-IN")}`}</span>
            </div>
            ${
              details.discount > 0
                ? `<div class="total-line" style="color:#047857;">
                    <span>Discount</span>
                    <span>-&#8377;${details.discount.toLocaleString("en-IN")}</span>
                  </div>`
                : ""
            }
            <div class="grand-total">
              <span>Grand Total</span>
              <span>&#8377;${formattedAmount}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="terms-sign">
          <div class="terms">
            <strong>Care &amp; Delivery Terms</strong>
            &bull; Fresh flowers are perishable; please place stems in clean water immediately.<br />
            &bull; Keep cakes refrigerated and consume within 24 hours for best taste.<br />
            &bull; For any order assistance, please quote Order ID <strong>${order.orderId}</strong>.
          </div>
          <div class="sign-box">
            <div class="sign-line">MS Flowers &amp; Cakes</div>
            <div>Authorized Store Signatory</div>
          </div>
        </div>

        <div class="footer">
          <span>Thank you for celebrating with MS Flowers &amp; Cakes!</span>
          <span>Computer-generated receipt &bull; ${order.orderId}</span>
        </div>
      </div>
    </div>

    <script>
      window.onload = function() {
        window.focus();
        setTimeout(function() {
          window.print();
        }, 150);
      };
    </script>
  </body>
</html>`);
  win.document.close();
}

export function OrdersView({
  orders,
  onUpdateStatus,
}: {
  orders: AdminOrder[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder =
    orders.find((o) => o.orderId === selectedOrderId) ?? null;

  if (selectedOrder) {
    const details = resolveOrderDetails(selectedOrder);
    const activeStepIdx = ORDER_STATUSES.indexOf(selectedOrder.status);

    return (
      <div className="space-y-5">
        {/* Top Action Bar */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:px-6 sm:py-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSelectedOrderId(null)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
            >
              <span>&larr;</span>
              <span>Back to Orders</span>
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                  {selectedOrder.orderId}
                </h2>
                <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-700">
                  SKU: {details.primarySku}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                Placed {selectedOrder.placedAt} &bull; {selectedOrder.slotLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClasses(
                selectedOrder.status
              )}`}
            >
              {selectedOrder.status}
            </span>
            <button
              type="button"
              onClick={() => printOrderReceipt(selectedOrder)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
            >
              Print Receipt
            </button>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Order Fulfillment Progress
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ORDER_STATUSES.map((step, idx) => {
              const completed = idx <= activeStepIdx;
              const isCurrent = idx === activeStepIdx;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => onUpdateStatus(selectedOrder.orderId, step)}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    isCurrent
                      ? "border-rose-400 bg-rose-50/80 shadow-xs"
                      : completed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-gray-200 bg-gray-50/50 hover:border-rose-200"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                      isCurrent
                        ? "bg-rose-600 text-white"
                        : completed
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {completed && !isCurrent ? "✓" : idx + 1}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isCurrent
                        ? "text-rose-800"
                        : completed
                        ? "text-emerald-800"
                        : "text-gray-500"
                    }`}
                  >
                    {step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-Page 2-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Items & Gift Message */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-rose-100 bg-white shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Ordered Items &amp; SKUs
                  </h3>
                  <p className="text-xs text-gray-500">
                    {details.items.length} line item(s) in this order
                  </p>
                </div>
                <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                  Total Qty: {selectedOrder.itemCount}
                </span>
              </div>

              <div className="divide-y divide-rose-100/70">
                {details.items.map((item, idx) => (
                  <div
                    key={`${item.sku}-${idx}`}
                    className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-700">
                          {item.sku}
                        </span>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Qty: {item.qty} &times; &#8377;{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-gray-900">
                      &#8377;{(item.price * item.qty).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="px-5 py-4 bg-rose-50/30 border-t border-rose-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    &#8377;{details.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Delivery Charge ({selectedOrder.slotLabel})</span>
                  <span className="font-semibold text-emerald-700">
                    {details.deliveryFee === 0
                      ? "FREE"
                      : `₹${details.deliveryFee.toLocaleString("en-IN")}`}
                  </span>
                </div>
                {details.discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Promo / Combo Discount</span>
                    <span className="font-semibold">
                      -&#8377;{details.discount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-rose-200/70 flex items-center justify-between text-sm font-extrabold text-gray-900">
                  <span>Grand Total</span>
                  <span>
                    &#8377;{selectedOrder.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Gift Note / Card Message */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">
                Free Greeting Card &amp; Gift Note
              </p>
              {details.giftMessage ? (
                <p className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 text-sm italic text-rose-950">
                  &ldquo;{details.giftMessage}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  No custom gift card message attached for this order.
                </p>
              )}
            </div>
          </div>

          {/* Right Col: Customer, Delivery, Payment & Actions */}
          <div className="space-y-5">
            {/* Customer & Recipient */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs space-y-3.5">
              <h3 className="text-sm font-bold text-gray-900">
                Customer &amp; Recipient
              </h3>
              <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Ordered By
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {selectedOrder.customerName}
                </p>
                <a
                  href={`tel:${selectedOrder.customerPhone}`}
                  className="text-xs font-semibold text-rose-600 hover:underline mt-0.5 inline-block"
                >
                  {selectedOrder.customerPhone}
                </a>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Delivery Recipient
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {details.recipientName}
                </p>
                <a
                  href={`tel:${details.recipientPhone}`}
                  className="text-xs font-semibold text-rose-600 hover:underline mt-0.5 inline-block"
                >
                  {details.recipientPhone}
                </a>
              </div>
            </div>

            {/* Delivery Address & Slot */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs space-y-2.5">
              <h3 className="text-sm font-bold text-gray-900">
                Delivery Address &amp; Slot
              </h3>
              <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                {details.deliveryAddress}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-lg bg-rose-50 border border-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                  {selectedOrder.area} ({selectedOrder.pincode})
                </span>
                <span className="rounded-lg bg-sky-50 border border-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                  {selectedOrder.slotLabel}
                </span>
              </div>
            </div>

            {/* Payment & Status */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-900">
                Payment &amp; Status
              </h3>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-bold text-gray-900">
                  {details.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Payment Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-bold ${
                    details.paymentStatus === "Paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {details.paymentStatus}
                </span>
              </div>

              <div className="pt-2 border-t border-rose-100 flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-gray-600">
                  Update Status
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    onUpdateStatus(
                      selectedOrder.orderId,
                      e.target.value as OrderStatus
                    )
                  }
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer ${statusBadgeClasses(
                    selectedOrder.status
                  )}`}
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-white p-12 text-center shadow-sm">
        <CartIcon className="w-10 h-10 text-rose-300 mx-auto mb-2.5" />
        <h3 className="text-base font-bold text-gray-900">No orders received yet</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Live customer orders placed through your storefront will automatically appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-100 bg-white shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-rose-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Orders</h2>
          <p className="text-xs text-gray-500">
            Click any order to open full details page or print receipt
          </p>
        </div>
        <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700">
          {orders.length} Total Orders
        </span>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden divide-y divide-rose-100/70">
        {orders.map((order) => {
          const details = resolveOrderDetails(order);
          return (
            <div
              key={order.orderId}
              onClick={() => setSelectedOrderId(order.orderId)}
              className="p-4 space-y-2.5 hover:bg-rose-50/30 active:bg-rose-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-900">
                      {order.orderId}
                    </p>
                    <span className="rounded-md bg-rose-50 border border-rose-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-700">
                      {details.primarySku}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{order.placedAt}</p>
                </div>
                <span className="text-sm font-extrabold text-gray-900">
                  &#8377;{order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  {order.customerName} &bull; {order.area} ({order.pincode})
                </p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                  {order.itemsSummary}
                </p>
              </div>
              <div
                className="flex items-center justify-between gap-2 pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <select
                  value={order.status}
                  onChange={(e) =>
                    onUpdateStatus(order.orderId, e.target.value as OrderStatus)
                  }
                  className={`rounded-xl border px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer ${statusBadgeClasses(
                    order.status
                  )}`}
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(order.orderId)}
                    className="rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => printOrderReceipt(order)}
                    className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
                  >
                    Receipt
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-rose-50/50 text-xs font-semibold uppercase tracking-wider text-rose-900/70">
            <tr>
              <th className="px-6 py-3.5">Order ID &amp; SKU</th>
              <th className="px-6 py-3.5">Customer &amp; Area</th>
              <th className="px-6 py-3.5">Items</th>
              <th className="px-6 py-3.5">Slot</th>
              <th className="px-6 py-3.5">Amount</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100/70">
            {orders.map((order) => {
              const details = resolveOrderDetails(order);
              return (
                <tr
                  key={order.orderId}
                  onClick={() => setSelectedOrderId(order.orderId)}
                  className="hover:bg-rose-50/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                    <div>{order.orderId}</div>
                    <div className="mt-1">
                      <span className="rounded-md bg-rose-50 border border-rose-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-700">
                        {details.primarySku}
                      </span>
                    </div>
                    <div className="text-[11px] font-normal text-gray-400 mt-1">
                      {order.placedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {order.customerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.area} ({order.pincode})
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs text-xs text-gray-600">
                    {order.itemsSummary}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                    {order.slotLabel}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                    &#8377;{order.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={order.status}
                      onChange={(e) =>
                        onUpdateStatus(order.orderId, e.target.value as OrderStatus)
                      }
                      className={`rounded-xl border px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer ${statusBadgeClasses(
                        order.status
                      )}`}
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(order.orderId)}
                        className="rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => printOrderReceipt(order)}
                        className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                      >
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductsView({
  lowStock,
  onRestock,
}: {
  products?: CatalogProductRow[];
  lowStock: LowStockItem[];
  onRestock: (itemId: string) => void;
}) {
  return (
    <div className="space-y-6">
      {lowStock.some((item) => item.stock < item.threshold) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-amber-900">Low Stock Variants Need Attention</p>
            <p className="text-xs text-amber-800/80">Quickly restock floral stems or cake bases below.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock
              .filter((item) => item.stock < item.threshold)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onRestock(item.id)}
                  className="rounded-xl bg-white border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  +15 {item.productName.split(" ").slice(0, 2).join(" ")} ({item.stock} left)
                </button>
              ))}
          </div>
        </div>
      )}
      <ProductsManager />
    </div>
  );
}

export interface DbCoupon {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_order: number;
  max_discount?: number | null;
  expiry_date?: string | null;
  usage_count: number;
  is_active: boolean;
  created_at?: string;
}

export function CouponsView({
  coupons: initialCoupons,
  onToggle: legacyToggle,
}: {
  coupons?: AdminCoupon[];
  onToggle?: (id: string) => void;
}) {
  const [couponsList, setCouponsList] = useState<DbCoupon[]>([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<DbCoupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Modal Form Inputs
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "flat">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formMinOrder, setFormMinOrder] = useState("");
  const [formMaxDiscount, setFormMaxDiscount] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Load coupons from API
  async function loadCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.coupons && Array.isArray(data.coupons)) {
        setCouponsList(data.coupons);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error loading coupons:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  // Filter coupons by search query
  const filteredCoupons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return couponsList;
    return couponsList.filter(
      (c) =>
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [couponsList, searchQuery]);

  // Copy code to clipboard
  function handleCopy(code: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1800);
    }
  }

  // Quick toggle active
  async function handleToggle(coupon: DbCoupon) {
    const nextStatus = !coupon.is_active;

    // Optimistic UI update
    setCouponsList((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: nextStatus } : c))
    );
    setStats((prev) => ({
      ...prev,
      activeCoupons: nextStatus ? prev.activeCoupons + 1 : Math.max(0, prev.activeCoupons - 1),
    }));

    try {
      await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, is_active: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to toggle coupon:", err);
      loadCoupons();
    }
  }

  // Delete coupon
  async function handleDelete(id: string, code: string) {
    if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
      return;
    }

    setCouponsList((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      loadCoupons();
    } catch (err) {
      console.error("Failed to delete coupon:", err);
      loadCoupons();
    }
  }

  // Open Create Modal
  function openCreateModal() {
    setEditingCoupon(null);
    setFormCode("");
    setFormDescription("");
    setFormDiscountType("percentage");
    setFormDiscountValue("10");
    setFormMinOrder("499");
    setFormMaxDiscount("500");
    setFormExpiryDate("2027-12-31");
    setFormIsActive(true);
    setFormError("");
    setIsModalOpen(true);
  }

  // Open Edit Modal
  function openEditModal(c: DbCoupon) {
    setEditingCoupon(c);
    setFormCode(c.code);
    setFormDescription(c.description || "");
    setFormDiscountType(c.discount_type);
    setFormDiscountValue(String(c.discount_value));
    setFormMinOrder(c.min_order !== undefined ? String(c.min_order) : "0");
    setFormMaxDiscount(c.max_discount ? String(c.max_discount) : "");
    setFormExpiryDate(c.expiry_date || "");
    setFormIsActive(c.is_active);
    setFormError("");
    setIsModalOpen(true);
  }

  // Handle Save (Create or Update)
  async function handleSaveCoupon(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const trimmedCode = formCode.trim().toUpperCase();
    if (!trimmedCode) {
      setFormError("Coupon code is required");
      return;
    }

    const val = Number(formDiscountValue);
    if (isNaN(val) || val <= 0) {
      setFormError("Please enter a valid discount value");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCoupon ? editingCoupon.id : undefined,
          code: trimmedCode,
          description: formDescription.trim(),
          discount_type: formDiscountType,
          discount_value: val,
          min_order: Number(formMinOrder) || 0,
          max_discount: formMaxDiscount ? Number(formMaxDiscount) : null,
          expiry_date: formExpiryDate || null,
          is_active: formIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save coupon");
      }

      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while saving coupon");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
            Store Promotions
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Promo Coupons &amp; Discounts
          </h1>
        </div>
      </div>

      {/* Top Cards: 3 KPIs + 1 Create Button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coupons */}
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Total Coupons</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <TicketIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.totalCoupons}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Configured in store database</div>
          </div>
        </div>

        {/* Active Coupons */}
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Active Coupons</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {stats.activeCoupons}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Ready for checkout use</div>
          </div>
        </div>

        {/* Total Redemptions */}
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Total Redemptions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-blue-600 tracking-tight">
              {stats.totalRedemptions}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Times used by customers</div>
          </div>
        </div>

        {/* Action Button Card */}
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs flex flex-col justify-between">
          <button
            type="button"
            onClick={openCreateModal}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-300/40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none font-bold">+</span>
            <span>Create New Coupon</span>
          </button>
          <div className="text-[11px] text-center text-gray-400 mt-2">
            Instant sync with checkout page
          </div>
        </div>
      </div>

      {/* Main Coupons List Container */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xs">
        {/* Container Header with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TicketIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Store Promo Coupons ({filteredCoupons.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Customers enter these coupon codes on the checkout page to receive instant discounts.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupons..."
              className="w-full pl-9 pr-3.5 py-1.8 rounded-xl border border-rose-100 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 shadow-2xs"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <div className="w-8 h-8 border-3 border-rose-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Syncing coupons from store database...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-12 text-center">
            <TicketIcon className="w-10 h-10 text-rose-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-900">
              {searchQuery ? "No matching coupon found" : "No coupons in store database"}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Click &quot;+ Create New Coupon&quot; to add discount codes for customers.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-rose-100/70 pt-2">
            {filteredCoupons.map((c) => {
              const isPercentage = c.discount_type === "percentage";
              const discountPillText = isPercentage
                ? `${c.discount_value}% OFF`
                : `₹${c.discount_value} FLAT OFF`;

              return (
                <div
                  key={c.id}
                  className="py-4.5 flex flex-col gap-2.5 transition-colors hover:bg-rose-50/20 px-2 rounded-xl"
                >
                  {/* Top Line: Code, Badges, Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Code */}
                      <span className="font-mono text-sm sm:text-base font-black text-gray-900 tracking-wider">
                        {c.code}
                      </span>

                      {/* Copy Button */}
                      <button
                        type="button"
                        onClick={() => handleCopy(c.code)}
                        title="Copy coupon code"
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                      >
                        {copiedCode === c.code ? (
                          <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-1.5-.124m-7.5 10.376-3.375-3.375m3.375 3.375V11.25m-3.375 6.75A9.06 9.06 0 0 1 6.75 18m0-6.75A9.06 9.06 0 0 1 9 11.25m-2.25 0V7.875" />
                          </svg>
                        )}
                      </button>

                      {/* Discount Value Badge */}
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md ${
                          isPercentage
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {discountPillText}
                      </span>

                      {/* Live in Store Pill */}
                      {c.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live in Store
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                          Paused
                        </span>
                      )}
                    </div>

                    {/* Actions: Toggle Active, Edit, Delete */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(c)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          c.is_active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                        }`}
                      >
                        {c.is_active ? "Active" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        title="Edit coupon"
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.code)}
                        title="Delete coupon"
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Middle Line: Description */}
                  {c.description && (
                    <p className="text-xs text-gray-700 font-medium">{c.description}</p>
                  )}

                  {/* Bottom Line: Metadata */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 font-medium">
                    <span>
                      Min Cart: <strong className="text-gray-800">&#8377;{c.min_order}</strong>
                    </span>
                    {c.max_discount ? (
                      <span>
                        Max Cap: <strong className="text-gray-800">&#8377;{c.max_discount}</strong>
                      </span>
                    ) : null}
                    {c.expiry_date ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        Expires: <strong className="text-gray-800">{c.expiry_date}</strong>
                      </span>
                    ) : null}
                    <span>
                      Used: <strong className="text-orange-600">{c.usage_count || 0} times</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Create / Edit Coupon Modal (Matching Screenshot 2) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-gray-800 bg-[#141b29] text-white p-6 sm:p-7 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                  <TicketIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {editingCoupon ? "Edit Discount Coupon" : "Create New Discount Coupon"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure discount coupons for customer checkout
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 cursor-pointer transition-colors"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                {formError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              {/* Coupon Code */}
              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="E.G. WELCOME10, SAVE500"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-[#1d2638] text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-wider"
                />
              </div>

              {/* Description / Tagline */}
              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Description / Offer Tagline
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Get 10% off on your flower and cake order"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-[#1d2638] text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Discount Type + Discount Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) =>
                      setFormDiscountType(e.target.value as "percentage" | "flat")
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-[#1d2638] text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (&#8377;)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">
                    Discount Value * {formDiscountType === "percentage" ? "(%)" : "(\u20B9)"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(e.target.value)}
                    placeholder="10"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-[#1d2638] text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Min Order Value + Max Discount Cap */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">
                    Min Order Value (&#8377;)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                    placeholder="e.g. 499 (0 for no limit)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-[#1d2638] text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">
                    Max Discount Cap (&#8377;)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    placeholder="e.g. 500"
                    disabled={formDiscountType === "flat"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-[#1d2638] text-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Expiry Date + Store Status */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-[#1d2638] text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-300 font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-700 text-orange-500 focus:ring-orange-500 accent-orange-500"
                    />
                    <span>Active (Live on checkout)</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all shadow-md shadow-orange-500/20 disabled:opacity-60 cursor-pointer"
                >
                  {saving
                    ? "Saving..."
                    : editingCoupon
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewsView({
  reviews,
  onApprove,
  onDelete,
}: {
  reviews: AdminReview[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        Customer Reviews
      </h2>
      <p className="text-xs text-gray-500 mb-5">
        Approve pending reviews before they appear on product pages
      </p>
      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/20 p-12 text-center">
          <StarIcon className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">No reviews pending moderation</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Customer reviews submitted on your storefront will appear here for your review and approval.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-rose-100 bg-rose-50/20 p-4 flex flex-wrap items-start justify-between gap-4"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900">
                    {r.author}
                  </span>
                  <span className="text-xs text-gray-400">&bull; {r.city}</span>
                  <span className="text-xs font-semibold text-amber-600">
                    &#9733; {r.rating}.0
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      r.status === "pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {r.status === "pending" ? "Pending Approval" : "Approved"}
                  </span>
                </div>
                <p className="text-xs font-medium text-rose-700 mt-1">
                  {r.productName}
                </p>
                <p className="text-sm text-gray-700 mt-1.5">{r.comment}</p>
              </div>
              <div className="flex items-center gap-2">
                {r.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => onApprove(r.id)}
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InquiriesView({
  inquiries,
  onResolve,
}: {
  inquiries: AdminInquiry[];
  onResolve: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        Bulk &amp; Custom Inquiries
      </h2>
      <p className="text-xs text-gray-500 mb-5">
        Leads from Contact Us and custom event requests
      </p>
      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/20 p-12 text-center">
          <MessageSquareIcon className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">No inquiries yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Bulk orders, corporate requests and customer event inquiries will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="rounded-2xl border border-rose-100 bg-rose-50/20 p-4 flex flex-wrap items-start justify-between gap-4"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-gray-900">
                    {inq.subject}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      inq.status === "open"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {inq.status === "open" ? "Open" : "Resolved"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {inq.name} &bull; {inq.phone} &bull; {inq.date}
                </p>
                <p className="text-sm text-gray-700 mt-2">{inq.message}</p>
              </div>
              {inq.status === "open" && (
                <button
                  type="button"
                  onClick={() => onResolve(inq.id)}
                  className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface DynamicCustomerRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  orders_count: number;
  total_spent: number;
  created_at?: string;
}

export function CustomersView({
  customers: initialCustomers,
}: {
  customers?: AdminCustomer[];
}) {
  const [customersList, setCustomersList] = useState<DynamicCustomerRow[]>(() => {
    return (initialCustomers || []).map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      role: "CUSTOMER",
      orders_count: c.ordersCount,
      total_spent: c.totalSpent,
      created_at: new Date().toISOString(),
    }));
  });

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalCustomerSpend: 0,
    repeatBuyers: 0,
    newLast30Days: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch dynamic customers from DB
  async function loadCustomers(isSync = false) {
    if (isSync) setSyncing(true);
    else setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();

      if (data.customers && Array.isArray(data.customers)) {
        setCustomersList(data.customers);
        if (data.stats) {
          setStats(data.stats);
        }
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      console.error("Failed to load customers:", err);
      setErrorMsg(err.message || "Failed to load customers from database.");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customersList;
    return customersList.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.role && c.role.toLowerCase().includes(q))
    );
  }, [customersList, searchQuery]);

  function formatDate(isoString?: string) {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  }

  function getAvatarColor(name: string) {
    const colors = [
      "from-amber-500 to-orange-600",
      "from-rose-500 to-pink-600",
      "from-blue-500 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-purple-500 to-violet-600",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
            Registered Customers
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              All Users
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Auth Sync
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {customersList.length} registered users &mdash; customers and admins.
          </p>
        </div>

        {/* Search & Sync Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-rose-100 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 shadow-xs placeholder-gray-400"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>

          <button
            type="button"
            onClick={() => loadCustomers(true)}
            disabled={syncing}
            title="Sync latest customers"
            className="p-2 rounded-xl border border-rose-100 bg-white text-gray-600 hover:text-rose-600 hover:bg-rose-50/50 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${syncing ? "animate-spin text-rose-600" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => loadCustomers(true)}
            className="font-bold underline hover:no-underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. KPI Stat Cards (Matching User's Reference Screenshot) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Customers */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {stats.totalCustomers}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 mt-0.5">
              Total Customers
            </div>
          </div>
        </div>

        {/* Total Customer Spend */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold">&#8377;</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              &#8377;{stats.totalCustomerSpend.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 mt-0.5">
              Total Customer Spend
            </div>
          </div>
        </div>

        {/* Repeat Buyers */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {stats.repeatBuyers}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 mt-0.5">
              Repeat Buyers
            </div>
          </div>
        </div>

        {/* New (Last 30 Days) */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {stats.newLast30Days}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 mt-0.5">
              New (Last 30 Days)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Customers Table */}
      <div className="rounded-2xl border border-rose-100 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Syncing registered customers from database...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <UsersIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {searchQuery ? "No matching customers found" : "No registered customers yet"}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No user found matching "${searchQuery}". Try a different keyword.`
                : "Customers will appear here live when they register or place orders on your store."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-rose-50/60 text-[11px] font-bold uppercase tracking-wider text-gray-600 border-b border-rose-100">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact Phone</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Orders Placed</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100/60">
                {filteredCustomers.map((c) => {
                  const initial = (c.name?.[0] || c.email?.[0] || "U").toUpperCase();
                  const roleUpper = (c.role || "CUSTOMER").toUpperCase();

                  return (
                    <tr key={c.id} className="hover:bg-rose-50/20 transition-colors">
                      {/* Customer avatar + name + email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(
                              c.name || c.email
                            )} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                          >
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                            <div className="text-xs text-gray-400 font-normal">{c.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">
                        {c.phone || "—"}
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${
                            roleUpper === "ADMIN"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {roleUpper}
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="px-6 py-4 font-bold text-gray-900 text-xs">
                        {c.orders_count || 0} orders
                      </td>

                      {/* Total Spent */}
                      <td className="px-6 py-4 font-bold text-emerald-600 text-sm">
                        &#8377;{Number(c.total_spent || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(c.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function SubscribersView({
  subscribers,
}: {
  subscribers: AdminSubscriber[];
}) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        Newsletter Subscribers ({subscribers.length})
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Customers opted in for seasonal flower &amp; festive offers
      </p>
      {subscribers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/20 p-12 text-center">
          <MailIcon className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">No subscribers yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Customers opting into flower &amp; cake offers from your footer newsletter will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-rose-100">
          {subscribers.map((s) => (
            <div
              key={s.id}
              className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <span className="font-medium text-gray-900">{s.email}</span>
              <span className="text-xs text-gray-500">
                {s.source} &bull; {s.subscribedAt}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CmsView() {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Website &amp; CMS</h2>
        <p className="text-xs text-gray-500">
          Storefront delivery slots, Kolkata hub &amp; active banners
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
          <p className="text-xs font-semibold text-rose-700">Dispatch Hub</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            Chingrighata, Salt Lake
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Serving all major Kolkata pincodes
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
          <p className="text-xs font-semibold text-rose-700">Delivery Modes</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            90-Min Express &bull; Same-Day &bull; Midnight
          </p>
          <p className="text-xs text-gray-500 mt-1">All 3 slots active</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
          <p className="text-xs font-semibold text-rose-700">Payment Mode</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            Cash on Delivery (COD)
          </p>
          <p className="text-xs text-gray-500 mt-1">Enabled for storefront</p>
        </div>
      </div>
    </div>
  );
}
