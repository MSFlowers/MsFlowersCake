"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_STORE_SETTINGS } from "@/app/data/siteDefaults";
import {
  PhoneIcon,
  MapPinIcon,
  MailIcon,
  ClockIcon,
  MoonIcon,
  LightbulbIcon,
  SparklesIcon,
} from "@/app/components/StorefrontIcons";

export interface StoreSettingsData {
  id: string;
  store_name: string;
  tagline: string;
  support_phone: string;
  support_email: string;
  address: string;
  operating_hours: string;
  midnight_hours: string;
  whatsapp_number: string;
  whatsapp_url: string;
  facebook_url: string;
  instagram_url: string;
  copyright_text: string;
  handcrafted_text: string;
}

export function StoreSettingsView() {
  const [settings, setSettings] = useState<StoreSettingsData>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [storeName, setStoreName] = useState(DEFAULT_STORE_SETTINGS.store_name);
  const [tagline, setTagline] = useState(DEFAULT_STORE_SETTINGS.tagline);
  const [supportPhone, setSupportPhone] = useState(DEFAULT_STORE_SETTINGS.support_phone);
  const [supportEmail, setSupportEmail] = useState(DEFAULT_STORE_SETTINGS.support_email);
  const [address, setAddress] = useState(DEFAULT_STORE_SETTINGS.address);
  const [operatingHours, setOperatingHours] = useState(DEFAULT_STORE_SETTINGS.operating_hours);
  const [midnightHours, setMidnightHours] = useState(DEFAULT_STORE_SETTINGS.midnight_hours);
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_STORE_SETTINGS.whatsapp_number);
  const [whatsappUrl, setWhatsappUrl] = useState(DEFAULT_STORE_SETTINGS.whatsapp_url);
  const [facebookUrl, setFacebookUrl] = useState(DEFAULT_STORE_SETTINGS.facebook_url);
  const [instagramUrl, setInstagramUrl] = useState(DEFAULT_STORE_SETTINGS.instagram_url);
  const [copyrightText, setCopyrightText] = useState(DEFAULT_STORE_SETTINGS.copyright_text);
  const [handcraftedText, setHandcraftedText] = useState(DEFAULT_STORE_SETTINGS.handcrafted_text);

  async function loadSettings() {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/store-settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setStoreName(data.settings.store_name || DEFAULT_STORE_SETTINGS.store_name);
        setTagline(data.settings.tagline || DEFAULT_STORE_SETTINGS.tagline);
        setSupportPhone(data.settings.support_phone || DEFAULT_STORE_SETTINGS.support_phone);
        setSupportEmail(data.settings.support_email || DEFAULT_STORE_SETTINGS.support_email);
        setAddress(data.settings.address || DEFAULT_STORE_SETTINGS.address);
        setOperatingHours(data.settings.operating_hours || DEFAULT_STORE_SETTINGS.operating_hours);
        setMidnightHours(data.settings.midnight_hours || DEFAULT_STORE_SETTINGS.midnight_hours);
        setWhatsappNumber(data.settings.whatsapp_number || DEFAULT_STORE_SETTINGS.whatsapp_number);
        setWhatsappUrl(data.settings.whatsapp_url || DEFAULT_STORE_SETTINGS.whatsapp_url);
        setFacebookUrl(data.settings.facebook_url || DEFAULT_STORE_SETTINGS.facebook_url);
        setInstagramUrl(data.settings.instagram_url || DEFAULT_STORE_SETTINGS.instagram_url);
        setCopyrightText(data.settings.copyright_text || DEFAULT_STORE_SETTINGS.copyright_text);
        setHandcraftedText(data.settings.handcrafted_text || DEFAULT_STORE_SETTINGS.handcrafted_text);
      }
    } catch (err: any) {
      console.error("Failed to load store settings:", err);
      setErrorMsg("Failed to load settings from database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleResetDefaults() {
    if (!confirm("Reset all store, footer and contact settings back to original defaults?")) return;
    setStoreName(DEFAULT_STORE_SETTINGS.store_name);
    setTagline(DEFAULT_STORE_SETTINGS.tagline);
    setSupportPhone(DEFAULT_STORE_SETTINGS.support_phone);
    setSupportEmail(DEFAULT_STORE_SETTINGS.support_email);
    setAddress(DEFAULT_STORE_SETTINGS.address);
    setOperatingHours(DEFAULT_STORE_SETTINGS.operating_hours);
    setMidnightHours(DEFAULT_STORE_SETTINGS.midnight_hours);
    setWhatsappNumber(DEFAULT_STORE_SETTINGS.whatsapp_number);
    setWhatsappUrl(DEFAULT_STORE_SETTINGS.whatsapp_url);
    setFacebookUrl(DEFAULT_STORE_SETTINGS.facebook_url);
    setInstagramUrl(DEFAULT_STORE_SETTINGS.instagram_url);
    setCopyrightText(DEFAULT_STORE_SETTINGS.copyright_text);
    setHandcraftedText(DEFAULT_STORE_SETTINGS.handcrafted_text);
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
        store_name: storeName,
        tagline: tagline,
        support_phone: supportPhone,
        support_email: supportEmail,
        address: address,
        operating_hours: operatingHours,
        midnight_hours: midnightHours,
        whatsapp_number: whatsappNumber,
        whatsapp_url: whatsappUrl,
        facebook_url: facebookUrl,
        instagram_url: instagramUrl,
        copyright_text: copyrightText,
        handcrafted_text: handcraftedText,
      };

      const res = await fetch("/api/admin/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings((prev) => ({ ...prev, ...payload }));
      setSuccessMsg("Store settings, Footer & Contact details saved successfully!");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setErrorMsg(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Actions */}
      <div className="rounded-2xl border border-rose-100 bg-linear-to-r from-rose-50/60 via-white to-pink-50/40 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-200 shrink-0">
              <svg className="w-6 h-6 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 8.878 3.5h6.244a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  Store &amp; CMS Configuration
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                Configure Kolkata florist hub contact details, operating timings, footer story &amp; copyright, and official social media handles. Changes instantly update the storefront Footer and Contact Us page.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={saving || loading}
              className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving || loading}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Contact Details & Florist Hub */}
          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-rose-50">
              <span className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Contact &amp; Kolkata Florist Hub
                </h3>
                <p className="text-xs text-gray-500">
                  Customer care phone, email, hub address, and daily service timings
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Support Phone / Calling Desk
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+91 6295233296"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Shown in Header, Footer &amp; Contact Us call button</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="rohit62952332@gmail.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-1">Inquiry notifications &amp; storefront contact email</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Florist &amp; Bakery Hub Physical Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Chingrighata, Salt Lake, Kolkata, West Bengal - 700105"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">Physical location displayed in Footer and Contact Us hub card</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Daily Operating Hours
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="Open Daily: 8:00 AM – 11:30 PM"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-1">e.g. Open Daily: 8:00 AM – 11:30 PM</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Midnight Delivery Hours Note
                </label>
                <input
                  type="text"
                  value={midnightHours}
                  onChange={(e) => setMidnightHours(e.target.value)}
                  placeholder="Midnight Delivery Available (Till 12:30 AM)"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-1">Highlighted midnight delivery banner &amp; badge</p>
              </div>
            </div>
          </div>

          {/* Card 2: Social Media & Messaging Channels */}
          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-rose-50">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Social Media &amp; Messaging Links
                </h3>
                <p className="text-xs text-gray-500">
                  Official WhatsApp order number, direct chat link, and social profiles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 6295233296"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-1">Displayed on WhatsApp order pills and badges</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  WhatsApp Direct Chat URL
                </label>
                <input
                  type="url"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  placeholder="https://wa.me/916295233296"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-1">Target link for WhatsApp order buttons</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Facebook Page URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://www.facebook.com/profile.php?id=..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Linked in Footer social icons and Contact Us page</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/msflowers_kolkata"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-1">Official Instagram page handle</p>
              </div>
            </div>
          </div>

          {/* Card 3: Footer Brand Details & Copyright */}
          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-rose-50">
              <span className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Footer Brand Story &amp; Copyright
                </h3>
                <p className="text-xs text-gray-500">
                  Brand name, mission tagline, copyright notice, and handcrafted signature
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Storefront Display Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="MS Flowers & Cake"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Brand Tagline &amp; Story (Footer Summary)
              </label>
              <textarea
                rows={3}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Kolkata’s trusted boutique destination for fresh handpicked flower bouquets, artisanal celebration cakes, and romantic flower + cake combos."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all leading-relaxed"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">Displayed prominently under the logo on the website footer</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  placeholder="© 2026 MS: Online Flowers and Cake Delivery in Kolkata. All rights reserved."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Handcrafted Signature
                </label>
                <input
                  type="text"
                  value={handcraftedText}
                  onChange={(e) => setHandcraftedText(e.target.value)}
                  placeholder="Handcrafted in Chingrighata, Salt Lake, Kolkata"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:bg-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Customer Preview (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-rose-100 bg-linear-to-b from-rose-50/40 to-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Live Customer Preview
                </h3>
              </div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                Real-Time
              </span>
            </div>

            {/* Preview 1: Footer Brand & Contact Card */}
            <div className="rounded-2xl bg-zinc-950 text-white p-4 space-y-3.5 border border-zinc-800 text-xs shadow-md">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-zinc-800">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-rose-600 shrink-0 text-xs shadow-xs">
                  MS
                </div>
                <div>
                  <p className="font-extrabold text-white text-xs">{storeName || "MS Flowers & Cake"}</p>
                  <p className="text-[9px] uppercase tracking-widest text-rose-400 font-bold">ONLINE DELIVERY IN KOLKATA</p>
                </div>
              </div>

              <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-3">
                {tagline || "Kolkata’s trusted boutique destination for fresh handpicked flower bouquets, artisanal celebration cakes, and romantic flower + cake combos."}
              </p>

              {/* Social Buttons Simulation */}
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z" />
                  </svg>
                  <span>WhatsApp Order</span>
                </span>
                <span className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white text-[10px]">
                  f
                </span>
                <span className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white text-[10px]">
                  <PhoneIcon className="w-3.5 h-3.5 text-zinc-300" />
                </span>
              </div>

              {/* Florist Hub Block */}
              <div className="pt-2 border-t border-zinc-800 space-y-2 text-[11px] text-zinc-300">
                <p className="flex items-start gap-1.5 text-zinc-400">
                  <MapPinIcon className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300 line-clamp-2">{address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <PhoneIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="font-medium text-white">{supportPhone}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MailIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-zinc-300 truncate">{supportEmail}</span>
                </p>
                <p className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <ClockIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{operatingHours}</span>
                </p>
                <p className="flex items-center gap-1.5 text-[10px] text-amber-300 font-medium">
                  <MoonIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  <span>{midnightHours}</span>
                </p>
              </div>

              {/* Bottom Copyright Preview */}
              <div className="pt-2 border-t border-zinc-900 text-[9px] text-zinc-500 space-y-1">
                <p>{copyrightText}</p>
                <p className="text-zinc-400">{handcraftedText}</p>
              </div>
            </div>

            {/* Preview 2: Contact Us Page Strip Simulation */}
            <div className="rounded-2xl bg-white border border-rose-200/80 p-4 space-y-2.5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Contact Us Page Pill Preview
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                  <PhoneIcon className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Call Store Desk</p>
                    <p className="font-bold text-gray-900 text-xs truncate">{supportPhone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <svg className="w-4 h-4 text-emerald-600 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">WhatsApp Helpdesk</p>
                    <p className="font-bold text-emerald-900 text-xs truncate">{whatsappNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-100">
                  <MailIcon className="w-4 h-4 text-gray-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Email Support</p>
                    <p className="font-bold text-gray-900 text-xs truncate">{supportEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl bg-amber-50/60 border border-amber-200/80 p-3.5 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <LightbulbIcon className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Pro Tip</span>
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                When you click <strong>Save All Changes</strong>, the new phone number, WhatsApp link, and Kolkata florist hub address will immediately apply across the customer storefront.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
