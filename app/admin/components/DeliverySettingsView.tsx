"use client";

import React, { useState, useEffect } from "react";
import { SparklesIcon } from "@/app/components/StorefrontIcons";

export interface DeliverySettingsData {
  id: string;
  free_delivery_threshold: number;
  standard_delivery_fee: number;
  express_delivery_fee: number;
  midnight_delivery_fee: number;
  estimated_timeline: string;
  dispatch_hub_name: string;
  dispatch_hub_address: string;
  support_phone?: string;
  support_email?: string;
}

const DEFAULT_SETTINGS: DeliverySettingsData = {
  id: "default",
  free_delivery_threshold: 999,
  standard_delivery_fee: 49,
  express_delivery_fee: 99,
  midnight_delivery_fee: 149,
  estimated_timeline: "Within 90 Minutes Express / Same-Day (Kolkata)",
  dispatch_hub_name: "Kolkata Central Hub",
  dispatch_hub_address: "Chingrighata Central Hub, Salt Lake Bypass, Kolkata - 700105",
  support_phone: "6201069758",
  support_email: "contact@msflowers.in",
};

export function DeliverySettingsView() {
  const [settings, setSettings] = useState<DeliverySettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [freeThreshold, setFreeThreshold] = useState<number>(999);
  const [standardFee, setStandardFee] = useState<number>(49);
  const [estimatedTimeline, setEstimatedTimeline] = useState(
    "Within 90 Minutes Express / Same-Day (Kolkata)"
  );
  const [dispatchAddress, setDispatchAddress] = useState(
    "Chingrighata Central Hub, Salt Lake Bypass, Kolkata - 700105"
  );

  async function loadSettings() {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/delivery-settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setFreeThreshold(Number(data.settings.free_delivery_threshold) || 999);
        setStandardFee(Number(data.settings.standard_delivery_fee) || 49);
        setEstimatedTimeline(
          data.settings.estimated_timeline ||
            "Within 90 Minutes Express / Same-Day (Kolkata)"
        );
        setDispatchAddress(
          data.settings.dispatch_hub_address ||
            "Chingrighata Central Hub, Salt Lake Bypass, Kolkata - 700105"
        );
      }
    } catch (err: any) {
      console.error("Failed to load delivery settings:", err);
      setErrorMsg("Failed to load settings from database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleResetDefaults() {
    if (!confirm("Reset delivery rates and dispatch hub to system defaults?")) return;
    setFreeThreshold(DEFAULT_SETTINGS.free_delivery_threshold);
    setStandardFee(DEFAULT_SETTINGS.standard_delivery_fee);
    setEstimatedTimeline(DEFAULT_SETTINGS.estimated_timeline);
    setDispatchAddress(DEFAULT_SETTINGS.dispatch_hub_address);
    setSuccessMsg("Reset back to default values. Click 'Save All Changes' to apply.");
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        free_delivery_threshold: freeThreshold,
        standard_delivery_fee: standardFee,
        estimated_timeline: estimatedTimeline,
        dispatch_hub_address: dispatchAddress,
        dispatch_hub_name: "Kolkata Central Hub",
      };

      const res = await fetch("/api/admin/delivery-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings((prev) => ({ ...prev, ...payload }));
      setSuccessMsg("Delivery and logistics settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 4500);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setErrorMsg(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  // Interactive Live Preview Calculations
  const sampleCartUnder = 599;
  const underGap = Math.max(0, freeThreshold - sampleCartUnder);

  return (
    <div className="space-y-6 text-gray-900 animate-in fade-in duration-200">
      {/* Toast Notifications */}
      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-rose-700 hover:text-rose-900 font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Top Banner Card */}
      <div className="rounded-3xl border border-rose-100 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v10.875" />
            </svg>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Delivery &amp; Logistics Configuration
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Configure free shipping threshold, standard delivery charges, and dispatch hub details. Changes apply instantly to the Cart Drawer and Checkout calculation.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving || loading}
            className="px-4 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-gray-700 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-extrabold transition-all shadow-md shadow-rose-300/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2-Column Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Configuration Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-rose-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            {/* Form Section Header */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-rose-100">
              <span className="text-rose-600">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              </span>
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900">
                Shipping Rates &amp; Free Delivery
              </h2>
            </div>

            {/* Field 1: Free Delivery Threshold */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900">
                  Free Delivery Threshold (&#8377;)
                </label>
                <span className="text-[11px] font-bold text-rose-600">
                  Min order for &#8377;0 shipping
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                  &#8377;
                </span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 rounded-2xl border border-rose-200/80 bg-rose-50/20 text-gray-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white transition-all shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed pt-0.5">
                Orders at or above this amount qualify for automatic <strong className="text-rose-700">FREE Delivery</strong> at checkout and in the cart progress bar.
              </p>
            </div>

            {/* Field 2: Standard Delivery Fee */}
            <div className="space-y-1.5 pt-2 border-t border-rose-100/70">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900">
                  Standard Delivery Fee (&#8377;)
                </label>
                <span className="text-[11px] font-semibold text-gray-500">
                  Applied below threshold
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                  &#8377;
                </span>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={standardFee}
                  onChange={(e) => setStandardFee(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 rounded-2xl border border-rose-200/80 bg-rose-50/20 text-gray-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white transition-all shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed pt-0.5">
                Flat delivery charge added to order total when cart value is less than &#8377;{freeThreshold}.
              </p>
            </div>

            {/* Field 3: Estimated Delivery Timeline */}
            <div className="space-y-1.5 pt-2 border-t border-rose-100/70">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <label className="text-gray-900">Estimated Delivery Timeline</label>
              </div>
              <input
                type="text"
                value={estimatedTimeline}
                onChange={(e) => setEstimatedTimeline(e.target.value)}
                placeholder="e.g. Within 90 Minutes Express / Same-Day"
                className="w-full px-4 py-3 rounded-2xl border border-rose-200/80 bg-rose-50/20 text-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white transition-all shadow-2xs"
              />
              <p className="text-[11px] text-gray-500 leading-relaxed pt-0.5">
                Shown to customers on the checkout and tracking confirmation screen.
              </p>
            </div>

            {/* Field 4: Dispatch Hub Location */}
            <div className="space-y-1.5 pt-2 border-t border-rose-100/70">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <label className="text-gray-900">Dispatch Hub Location (Central Hub Address)</label>
              </div>
              <textarea
                rows={2}
                value={dispatchAddress}
                onChange={(e) => setDispatchAddress(e.target.value)}
                placeholder="e.g. Chingrighata Central Hub, Salt Lake Bypass, Kolkata - 700105"
                className="w-full px-4 py-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/20 text-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white transition-all shadow-2xs"
              />
              <p className="text-[11px] text-gray-500 leading-relaxed pt-0.5">
                Printed on shipping invoices and dispatch notes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Customer Preview & Usage Guide (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card A: Live Customer Simulation Preview */}
          <div className="rounded-3xl border border-rose-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="text-rose-500 text-sm">&#10022;</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Live Customer Preview
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Active Logic
              </span>
            </div>

            {/* Simulation 1: Under Threshold */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-950">
                  Cart: &#8377;{sampleCartUnder} (Under &#8377;{freeThreshold})
                </span>
                <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200/70">
                  +&#8377;{standardFee} Fee
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-900/80">
                <span>Customer Pays Delivery:</span>
                <span className="font-bold text-amber-950">&#8377;{standardFee}</span>
              </div>
              <div className="pt-2 border-t border-amber-200/70 text-[11px] font-mono text-amber-900">
                Cart alert: <span className="text-amber-800 font-bold">&ldquo;Add &#8377;{underGap} more for FREE Delivery&rdquo;</span>
              </div>
            </div>

            {/* Simulation 2: At or Above Threshold */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-emerald-950">
                  Cart: &#8377;{freeThreshold}+ (Eligible)
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  FREE DELIVERY
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-900/80">
                <span>Customer Pays Delivery:</span>
                <span className="font-bold text-emerald-700">&#8377;0 (FREE)</span>
              </div>
              <div className="pt-2 border-t border-emerald-200/70 text-[11px] font-mono text-emerald-900">
                Cart alert: <span className="text-emerald-700 font-bold inline-flex items-center gap-1"><SparklesIcon className="w-3.5 h-3.5 text-emerald-600" /> &ldquo;Yay! You unlocked FREE Fast Delivery!&rdquo;</span>
              </div>
            </div>

            {/* Dispatch & Timeline Info */}
            <div className="space-y-2 pt-2 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="leading-snug">
                  <strong className="text-gray-900">Dispatch:</strong> {dispatchAddress}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="leading-snug">
                  <strong className="text-gray-900">Timeline:</strong> {estimatedTimeline}
                </span>
              </div>
            </div>
          </div>

          {/* Card B: Where is this used? */}
          <div className="rounded-3xl border border-rose-100 bg-white p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Where is this used?
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>Cart Drawer progress bar &amp; payable total calculation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>Checkout order summary &amp; final payment amount</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>Homepage Trust Strip banner (&ldquo;Free Delivery on &#8377;{freeThreshold}+&rdquo;)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>Official order confirmation &amp; packing slip generation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
