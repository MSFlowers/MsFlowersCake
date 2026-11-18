"use client";

import React, { useState, useEffect } from "react";

export interface PincodeRecord {
  id: string;
  pincode: string;
  area_name: string;
  delivery_time: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_KOLKATA_PINCODES: PincodeRecord[] = [
  { id: "p1", pincode: "700105", area_name: "Chingrighata / Salt Lake Bypass Hub", delivery_time: "45–60 Mins Express", is_active: true },
  { id: "p2", pincode: "700091", area_name: "Salt Lake Sector V / Technopolis", delivery_time: "45–60 Mins Express", is_active: true },
  { id: "p3", pincode: "700098", area_name: "Salt Lake Stadium / Beliaghata Bypass", delivery_time: "45–60 Mins Express", is_active: true },
  { id: "p4", pincode: "700106", area_name: "Salt Lake Sector III / Broadway", delivery_time: "45–60 Mins Express", is_active: true },
  { id: "p5", pincode: "700068", area_name: "Bagmari / Ultadanga Main", delivery_time: "60–90 Mins Hub Slot", is_active: true },
  { id: "p6", pincode: "700010", area_name: "Beliaghata / CIT Road", delivery_time: "45–60 Mins Express", is_active: true },
  { id: "p7", pincode: "700015", area_name: "Tangra / Seal Lane / Entally", delivery_time: "45–60 Mins Express", is_active: true },
  { id: "p8", pincode: "700054", area_name: "Phoolbagan / Kankurgachi", delivery_time: "45–60 Mins Express", is_active: true },
  { id: "p9", pincode: "700067", area_name: "Ultadanga / Bidhan Nagar Station", delivery_time: "60–90 Mins Hub Slot", is_active: true },
  { id: "p10", pincode: "700101", area_name: "Lake Town / Bangur Avenue", delivery_time: "60–90 Mins Hub Slot", is_active: true },
  { id: "p11", pincode: "700052", area_name: "VIP Road / Kaikhali Crossing", delivery_time: "60–90 Mins Hub Slot", is_active: true },
  { id: "p12", pincode: "700046", area_name: "Topsia / Tangra South Bypass", delivery_time: "45–60 Mins Express", is_active: true },
  { id: "p13", pincode: "700042", area_name: "Kasba / Ruby Hospital EM Bypass", delivery_time: "60–90 Mins Hub Slot", is_active: true },
  { id: "p14", pincode: "700107", area_name: "Anandapur / Kasba East / Ruby Area", delivery_time: "60–90 Mins Hub Slot", is_active: true },
  { id: "p15", pincode: "700156", area_name: "New Town Action Area I / Eco Park", delivery_time: "60–90 Mins Hub Slot", is_active: true },
];

export function PincodesView() {
  const [pincodes, setPincodes] = useState<PincodeRecord[]>(DEFAULT_KOLKATA_PINCODES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    pincode: "",
    area_name: "",
    delivery_time: "45–60 Mins Express",
    is_active: true,
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch from API
  const fetchPincodes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pincodes");
      const data = await res.json();
      if (data.success && Array.isArray(data.pincodes) && data.pincodes.length > 0) {
        setPincodes(data.pincodes);
      }
    } catch (err) {
      console.warn("Using default Kolkata pincodes fallback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

  const handleToggle = async (item: PincodeRecord) => {
    const updatedStatus = !item.is_active;
    setPincodes((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, is_active: updatedStatus } : p))
    );

    try {
      await fetch("/api/admin/pincodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_active: updatedStatus }),
      });
    } catch (err) {
      console.error("Toggle error", err);
    }
  };

  const handleDelete = async (id: string, pincode: string) => {
    if (!window.confirm(`Are you sure you want to remove delivery pincode ${pincode}?`)) {
      return;
    }
    setPincodes((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/admin/pincodes?id=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const code = formData.pincode.trim();
    if (!/^\d{6}$/.test(code)) {
      setFormError("Pincode must be exactly 6 digits (e.g. 700105).");
      return;
    }

    if (pincodes.some((p) => p.pincode === code)) {
      setFormError(`Pincode ${code} is already in the serviceable list.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/pincodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add pincode");
      }

      const newRecord = data.pincode || {
        id: "p_" + Date.now(),
        ...formData,
      };

      setPincodes((prev) => [newRecord, ...prev]);
      setIsModalOpen(false);
      setFormData({
        pincode: "",
        area_name: "",
        delivery_time: "45–60 Mins Express",
        is_active: true,
      });
    } catch (err: any) {
      setFormError(err.message || "Failed to add pincode");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredPincodes = pincodes.filter((item) => {
    const matchesSearch =
      item.pincode.includes(search) ||
      item.area_name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "active") return item.is_active;
    if (filter === "paused") return !item.is_active;
    return true;
  });

  const totalCount = pincodes.length;
  const activeCount = pincodes.filter((p) => p.is_active).length;
  const expressCount = pincodes.filter((p) => p.delivery_time.includes("Express")).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
            Kolkata Delivery Network
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Serviceable Delivery Pincodes
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              Kolkata Central Hub
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Orders are restricted strictly to these seeded hub pincodes. Unlisted pincodes will be blocked at checkout with a red warning indicator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPincodes}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            + Add Pincode
          </button>
        </div>
      </div>

      {/* 2. KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Hub Pincodes */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Hub Pincodes
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {totalCount}
              </span>
              <span className="text-xs font-medium text-gray-500">Kolkata Zones</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        </div>

        {/* Active For Checkout */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Active For Checkout
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {activeCount}
              </span>
              <span className="text-xs font-semibold text-emerald-700">Taking Orders</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* 45-60m Express Hubs */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              45-60m Express Hubs
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
                {expressCount}
              </span>
              <span className="text-xs font-semibold text-amber-700">Rapid Delivery</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="rounded-2xl border border-rose-100 bg-white p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by 6-digit pin or area name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50/80 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(["all", "active", "paused"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                filter === tab
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "all" ? `All (${pincodes.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Pincodes Table */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-rose-100 bg-rose-50/40 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                <th className="py-3.5 px-5">Pincode</th>
                <th className="py-3.5 px-5">Hub / Area Name</th>
                <th className="py-3.5 px-5">Speed &amp; Slot</th>
                <th className="py-3.5 px-5">Store Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredPincodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                    No serviceable delivery pincodes matched your search.
                  </td>
                </tr>
              ) : (
                filteredPincodes.map((item) => (
                  <tr key={item.id} className="hover:bg-rose-50/20 transition-colors">
                    {/* Pincode with Copy */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-rose-700 tracking-wider bg-rose-50 border border-rose-200/90 px-2.5 py-1 rounded-lg">
                          {item.pincode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.pincode)}
                          title="Copy Pincode"
                          className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer p-1 rounded-md"
                        >
                          {copiedCode === item.pincode ? (
                            <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                          ) : (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Area Name */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-gray-900">{item.area_name}</div>
                      <div className="text-[11px] text-gray-500">Kolkata Central Hub</div>
                    </td>

                    {/* Delivery Time */}
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] ${
                        item.delivery_time.includes("Express")
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {item.delivery_time}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => handleToggle(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {item.is_active ? "Active" : "Paused"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.pincode)}
                        className="text-gray-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Delete Pincode"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-rose-100 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Add Delivery Pincode</h3>
                  <p className="text-xs text-gray-500">Allow customers to order in this Kolkata area</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  6-Digit Pincode <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 700105"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 font-mono font-bold tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Hub / Area Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chingrighata / EM Bypass"
                  value={formData.area_name}
                  onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Delivery Speed Slot
                </label>
                <select
                  value={formData.delivery_time}
                  onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="45–60 Mins Express">45–60 Mins Express</option>
                  <option value="60–90 Mins Hub Slot">60–90 Mins Hub Slot</option>
                  <option value="Same-Day Scheduled">Same-Day Scheduled</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="pincodeActiveModal"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="pincodeActiveModal" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Activate immediately for live checkout validation
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {submitting ? "Adding..." : "Save Pincode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
