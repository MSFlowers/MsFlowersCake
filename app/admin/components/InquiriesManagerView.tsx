"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import {
  MapPinIcon,
  EyeIcon,
  RefreshIcon,
  CheckIcon,
  MailIcon,
  PhoneIcon,
  CloseIcon,
} from "@/app/components/StorefrontIcons";

export interface DbInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  inquiry_type: string;
  location: string;
  message: string;
  status: "unresolved" | "resolved";
  created_at: string;
}

const DEFAULT_INQUIRIES: DbInquiry[] = [];

export function InquiriesManagerView() {
  const [inquiries, setInquiries] = useState<DbInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unresolved" | "resolved">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<DbInquiry | null>(null);

  const fetchInquiries = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/inquiries", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.inquiries)) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.warn("Using default inquiries fallback", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();

    // Realtime live sync on inquiries table
    let channel: any = null;
    try {
      const channelId = `admin-inquiries-live-${Math.random().toString(36).slice(2, 8)}`;
      channel = supabase
        .channel(channelId)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "inquiries",
          },
          () => {
            fetchInquiries(true);
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("Realtime inquiries listener note:", e);
    }

    // Window focus / visibility listener so switching tabs updates immediately
    const handleSync = () => {
      fetchInquiries(true);
    };
    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, [fetchInquiries]);

  const handleToggleStatus = async (inq: DbInquiry) => {
    const nextStatus = inq.status === "resolved" ? "unresolved" : "resolved";
    setInquiries((prev) =>
      prev.map((i) => (i.id === inq.id ? { ...i, status: nextStatus } : i))
    );
    if (selectedInquiry?.id === inq.id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    try {
      await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inq.id, status: nextStatus }),
      });
    } catch (err) {
      console.error("Status update error", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer inquiry?")) return;
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (selectedInquiry?.id === id) setSelectedInquiry(null);

    try {
      await fetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete inquiry error", err);
    }
  };

  const handleWhatsApp = (inq: DbInquiry) => {
    const cleanPhone = inq.phone.replace(/\D/g, "");
    const text = encodeURIComponent(
      `Hello ${inq.name}, thank you for contacting MS Flowers & Cakes regarding your inquiry: "${inq.inquiry_type}". How can we assist you today?`
    );
    window.open(`https://wa.me/91${cleanPhone}?text=${text}`, "_blank");
  };

  // Stats
  const totalCount = inquiries.length;
  const unresolvedCount = inquiries.filter((i) => i.status === "unresolved").length;
  const resolvedCount = inquiries.filter((i) => i.status === "resolved").length;

  // Filtered
  const filteredInquiries = useMemo(() => {
    if (activeTab === "unresolved") return inquiries.filter((i) => i.status === "unresolved");
    if (activeTab === "resolved") return inquiries.filter((i) => i.status === "resolved");
    return inquiries;
  }, [inquiries, activeTab]);

  return (
    <div className="space-y-6">
      {/* 1. Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
            Customer Inquiries &amp; Leads
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Inquiries &amp; Bulk Leads
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live Leads
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage corporate bulk orders, custom celebration inquiries, and event requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchInquiries(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 text-gray-500 ${refreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* 2. KPI Stat Cards (Matching Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inquiries */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Inquiries
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {totalCount}
              </span>
              <span className="text-xs font-medium text-gray-500">Leads Received</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
        </div>

        {/* Unresolved */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Unresolved Leads
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
                unresolvedCount > 0 ? "text-amber-600" : "text-gray-900"
              }`}>
                {unresolvedCount}
              </span>
              {unresolvedCount > 0 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Follow Up Needed
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        {/* Resolved */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Resolved Leads
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {resolvedCount}
              </span>
              <span className="text-xs font-semibold text-emerald-700">Completed</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Filter Buttons matching Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all" as const, label: `All Inquiries (${totalCount})` },
            { id: "unresolved" as const, label: `New & Unresolved (${unresolvedCount})` },
            { id: "resolved" as const, label: `Resolved (${resolvedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-gray-500">
          Showing {filteredInquiries.length} of {totalCount} inquiries
        </span>
      </div>

      {/* 4. Inquiries Cards Feed matching Image 3 */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-rose-100">
            <p className="text-xs text-gray-500 font-medium">
              No inquiries found in this filter tab.
            </p>
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const isResolved = inq.status === "resolved";
            const initial = inq.name.charAt(0).toUpperCase() || "C";
            const dateStr = new Date(inq.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={inq.id}
                className="rounded-3xl border border-rose-100 bg-white p-5 sm:p-6 shadow-xs hover:border-rose-200 transition-colors space-y-3.5"
              >
                {/* Header Row: Avatar + Name + Status + Tag + Location + Date + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Avatar Initial */}
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {initial}
                    </span>

                    {/* Name */}
                    <span className="font-extrabold text-sm sm:text-base text-gray-900">
                      {inq.name}
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isResolved
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <CheckIcon className="w-3 h-3 text-emerald-600" />
                          <span>Resolved</span>
                        </>
                      ) : (
                        <span>• New &amp; Unresolved</span>
                      )}
                    </span>

                    {/* Tag Pill */}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {inq.inquiry_type}
                    </span>

                    {/* Location & Date */}
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <span className="inline-flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5 text-rose-600" />
                        <span>{inq.location}</span>
                      </span>
                      <span className="mx-1">&bull;</span>
                      <span>{dateStr}</span>
                    </span>
                  </div>

                  {/* Actions Header Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(inq)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                    >
                      <EyeIcon className="w-3.5 h-3.5 text-gray-500" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(inq)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isResolved
                          ? "border border-gray-300 text-gray-700 hover:bg-gray-100"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <RefreshIcon className="w-3.5 h-3.5 text-gray-600" />
                          <span>Reopen</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-3.5 h-3.5 text-white" />
                          <span>Resolve</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(inq.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete inquiry"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Contact Row: Email, Phone, WhatsApp */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <MailIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span>{inq.email}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span>{inq.phone}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleWhatsApp(inq)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* Message Body Box */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs text-gray-800 font-medium leading-relaxed">
                  &ldquo;{inq.message}&rdquo;
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. View Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-rose-100 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Customer Inquiry
                </span>
                <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                  {selectedInquiry.inquiry_type}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                aria-label="Close modal"
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg text-sm cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
                <div className="font-bold text-gray-900 text-sm">{selectedInquiry.name}</div>
                <div className="text-gray-600">Email: {selectedInquiry.email}</div>
                <div className="text-gray-600">Phone: {selectedInquiry.phone}</div>
                <div className="text-gray-600">Location: {selectedInquiry.location}</div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100">
                <h4 className="font-bold text-gray-900 mb-1 text-xs">Inquiry Message:</h4>
                <p className="text-gray-800 leading-relaxed font-medium">
                  {selectedInquiry.message}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleWhatsApp(selectedInquiry)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Chat on WhatsApp
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedInquiry)}
                    className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs"
                  >
                    {selectedInquiry.status === "resolved" ? "Mark Unresolved" : "Mark Resolved"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
