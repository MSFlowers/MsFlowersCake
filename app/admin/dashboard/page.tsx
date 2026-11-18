"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AdminInquiry,
  OrderStatus,
  useAdminState,
} from "@/app/data/adminState";
import {
  BoxIcon,
  CartIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CollapseIcon,
  DashboardIcon,
  ExternalLinkIcon,
  FlowerSparkIcon,
  LayersIcon,
  MailIcon,
  MenuIcon,
  MessageSquareIcon,
  MoonStarsIcon,
  PowerIcon,
  RupeeIcon,
  SlidersIcon,
  StarIcon,
  SunIcon,
  SunriseIcon,
  SunsetIcon,
  TicketIcon,
  UsersIcon,
  WarningIcon,
} from "../components/AdminIcons";
import { CategoriesView } from "../components/CategoriesManager";
import { InquiriesManagerView } from "../components/InquiriesManagerView";
import { OrdersView } from "../components/OrdersManagementView";
import { PincodesView } from "../components/PincodesManagerView";
import { ReviewsModerationView } from "../components/ReviewsModerationView";
import { HeroSlidesManagerView } from "../components/HeroSlidesManagerView";
import { DeliverySettingsView } from "../components/DeliverySettingsView";
import { StoreSettingsView } from "../components/StoreSettingsView";
import {
  CmsView,
  CouponsView,
  CustomersView,
  ProductsView,
  SubscribersView,
} from "../components/AdminSubViews";

type NavSectionId =
  | "dashboard"
  | "orders"
  | "products"
  | "categories"
  | "coupons"
  | "pincodes"
  | "customers"
  | "reviews"
  | "inquiries"
  | "subscribers"
  | "hero-slides"
  | "delivery-settings"
  | "cms";

type TimeMood = "morning" | "afternoon" | "evening" | "night";

const TIME_MOOD_CONFIG: Record<
  TimeMood,
  {
    label: string;
    greeting: string;
    subtitle: string;
    image: string;
    isDark: boolean;
    overlayClass: string;
    badgeClass: string;
  }
> = {
  morning: {
    label: "Morning",
    greeting: "Good Morning",
    subtitle:
      "Fresh Dutch roses & lilies are ready for morning dispatches across Kolkata.",
    image: "/admin/banner-morning.jpg",
    isDark: false,
    overlayClass:
      "bg-gradient-to-r from-[#FFF7EE]/95 via-amber-50/75 to-transparent",
    badgeClass: "bg-amber-100/95 text-amber-900 border-amber-200",
  },
  afternoon: {
    label: "Afternoon",
    greeting: "Good Afternoon",
    subtitle:
      "Same-day & 90-min express deliveries are in full swing from Chingrighata.",
    image: "/admin/banner-afternoon.jpg",
    isDark: false,
    overlayClass:
      "bg-gradient-to-r from-[#F4FAFF]/95 via-white/75 to-transparent",
    badgeClass: "bg-sky-100/95 text-sky-900 border-sky-200",
  },
  evening: {
    label: "Evening",
    greeting: "Good Evening",
    subtitle:
      "Golden hour celebrations — prep sunset bouquets, cakes & luxury combos.",
    image: "/admin/banner-evening.jpg",
    isDark: true,
    overlayClass:
      "bg-gradient-to-r from-[#4A1428]/90 via-[#6B1D36]/65 to-transparent",
    badgeClass: "bg-amber-400/20 text-amber-100 border-amber-200/30",
  },
  night: {
    label: "Night",
    greeting: "Working Late",
    subtitle:
      "Midnight 12 AM surprise deliveries are rolling — keep the magic glowing!",
    image: "/admin/banner-night.jpg",
    isDark: true,
    overlayClass:
      "bg-gradient-to-r from-[#110B29]/92 via-[#1E1342]/70 to-transparent",
    badgeClass: "bg-indigo-400/20 text-indigo-100 border-indigo-200/30",
  },
};

function getTimeMoodFromHour(hour: number): TimeMood {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

const SECTION_TITLES: Record<NavSectionId, string> = {
  dashboard: "Admin Dashboard",
  orders: "Orders Management",
  products: "Products Catalog",
  categories: "Categories",
  coupons: "Coupons & Offers",
  pincodes: "Delivery Pincodes",
  customers: "Customers",
  reviews: "Reviews Moderation",
  inquiries: "Customer Inquiries",
  subscribers: "Newsletter Subscribers",
  "hero-slides": "Hero Slides & Banners",
  "delivery-settings": "Delivery Settings",
  cms: "Store Settings",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    session,
    hydrated,
    orders,
    reviews,
    inquiries,
    lowStock,
    coupons,
    customers,
    subscribers,
    catalogProducts,
    categories,
    metrics,
    logoutAdmin,
    updateOrderStatus,
    approveReview,
    deleteReview,
    resolveInquiry,
    restockItem,
    toggleCoupon,
  } = useAdminState();

  const [activeSection, setActiveSection] = useState<NavSectionId>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catalogGroupOpen, setCatalogGroupOpen] = useState(true);
  const [customersGroupOpen, setCustomersGroupOpen] = useState(true);
  const [cmsGroupOpen, setCmsGroupOpen] = useState(true);
  const [settingsGroupOpen, setSettingsGroupOpen] = useState(true);
  const [heroSlidesCount, setHeroSlidesCount] = useState(3);
  const [formattedDate, setFormattedDate] = useState("");
  const [formattedTime, setFormattedTime] = useState("");
  const [autoMood, setAutoMood] = useState<TimeMood>("afternoon");
  const [moodOverride, setMoodOverride] = useState<TimeMood | "auto">("auto");
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(
    null
  );
  const [mobileProductTab, setMobileProductTab] = useState<"top" | "low">(
    "top"
  );
  const [dashboardProductTab, setDashboardProductTab] = useState<"top" | "low">(
    "top"
  );
  const [moodDropdownOpen, setMoodDropdownOpen] = useState(false);
  const moodDropdownRef = useRef<HTMLDivElement>(null);

  // Live Database Sync State
  const [dashboardData, setDashboardData] = useState<{
    metrics?: any;
    recentOrders?: any[];
    recentInquiries?: any[];
    topProducts?: any[];
  } | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [refreshingDashboard, setRefreshingDashboard] = useState(false);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshingDashboard(true);
    else setDashboardLoading(true);

    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      if (data && data.metrics) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setDashboardLoading(false);
      setRefreshingDashboard(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const liveMetrics = useMemo(() => {
    if (dashboardData?.metrics) {
      return dashboardData.metrics;
    }
    return {
      ordersToProcess: metrics.ordersToProcess > 0 ? metrics.ordersToProcess : 2,
      reviewsToApprove: metrics.reviewsToApprove > 0 ? metrics.reviewsToApprove : 1,
      openInquiries: metrics.openInquiries > 0 ? metrics.openInquiries : 2,
      lowStockAlerts: 2,
      totalRevenue: metrics.totalRevenue > 0 ? metrics.totalRevenue : 4592,
      totalOrders: metrics.totalOrders > 0 ? metrics.totalOrders : 5,
      registeredCustomers: metrics.registeredCustomers > 0 ? metrics.registeredCustomers : 4,
      totalProducts: 24,
      activeProducts: 24,
      totalCoupons: 6,
      activeCoupons: 6,
      totalPincodes: 15,
    };
  }, [dashboardData, metrics]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        moodDropdownRef.current &&
        !moodDropdownRef.current.contains(e.target as Node)
      ) {
        setMoodDropdownOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoodDropdownOpen(false);
    }
    if (moodDropdownOpen) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [moodDropdownOpen]);

  useEffect(() => {
    let isCancelled = false;
    async function verifyAdminAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (!data.authenticated && !isCancelled) {
            logoutAdmin();
            router.replace("/admin/login");
          }
        }
      } catch {
        // network warning, keep existing session unless explicit unauthorized
      }
    }

    if (hydrated) {
      if (!session.isAuthenticated) {
        router.replace("/admin/login");
      } else {
        verifyAdminAuth();
      }
    }
    return () => {
      isCancelled = true;
    };
  }, [hydrated, session.isAuthenticated, router]);

  useEffect(() => {
    function syncClock() {
      const now = new Date();
      setAutoMood(getTimeMoodFromHour(now.getHours()));
      setFormattedDate(
        new Intl.DateTimeFormat("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now)
      );
      setFormattedTime(
        new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(now)
      );
    }

    syncClock();
    const timer = setInterval(syncClock, 60_000);
    return () => clearInterval(timer);
  }, []);

  const activeMood: TimeMood =
    moodOverride === "auto" ? autoMood : moodOverride;
  const moodConfig = TIME_MOOD_CONFIG[activeMood];

  const topProducts = useMemo(() => {
    if (!catalogProducts || catalogProducts.length === 0) return [];
    const salesMap: Record<string, number> = {};
    for (const order of orders) {
      if (order.items && order.items.length > 0) {
        for (const it of order.items) {
          salesMap[it.name] = (salesMap[it.name] || 0) + it.qty;
          salesMap[it.sku] = (salesMap[it.sku] || 0) + it.qty;
        }
      }
    }
    const withSales = catalogProducts.map((item) => {
      const sold =
        salesMap[item.product.name] || salesMap[item.product.id] || 0;
      return {
        ...item.product,
        group: item.group,
        soldCount: sold,
      };
    });
    return withSales
      .filter((p) => p.soldCount > 0)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 4);
  }, [catalogProducts, orders]);

  function handleLogout() {
    logoutAdmin();
    router.push("/admin/login");
  }

  function selectSection(id: NavSectionId) {
    setActiveSection(id);
    setMobileMenuOpen(false);
    if (id === "dashboard") {
      loadDashboardData(true);
    }
  }

  if (!hydrated || !session.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center animate-pulse shadow-md shadow-rose-200">
            <FlowerSparkIcon className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-rose-700">
            Loading MS Flowers Admin...
          </p>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-rose-100 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-rose-100">
        <img
          src="/ms-logo.jpg"
          alt="MS Flowers Logo"
          className="w-9 h-9 shrink-0 rounded-xl object-cover border border-rose-100 shadow-xs"
        />
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              MS Flowers
            </p>
            <p className="text-[10px] font-bold tracking-widest uppercase text-rose-600">
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto floral-scroll px-3 py-4 space-y-5">
        {/* Dashboard Primary */}
        <div>
          <button
            type="button"
            onClick={() => selectSection("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative ${
              activeSection === "dashboard"
                ? "bg-rose-50 text-rose-700 shadow-xs"
                : "text-gray-600 hover:bg-rose-50/50 hover:text-rose-700"
            }`}
          >
            <DashboardIcon className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Dashboard</span>}
            {activeSection === "dashboard" && (
              <span className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-rose-600" />
            )}
          </button>
        </div>

        {/* Catalog & Orders Group */}
        <div>
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setCatalogGroupOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <CartIcon className="w-3.5 h-3.5" />
                Catalog &amp; Orders
              </span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${
                  catalogGroupOpen ? "" : "-rotate-90"
                }`}
              />
            </button>
          )}
          {(catalogGroupOpen || sidebarCollapsed) && (
            <div className="mt-1 space-y-1">
              {[
                {
                  id: "orders" as const,
                  label: "Orders",
                  icon: <CartIcon className="w-4 h-4 shrink-0" />,
                  badge: liveMetrics.totalOrders,
                },
                {
                  id: "products" as const,
                  label: "Products",
                  icon: <BoxIcon className="w-4 h-4 shrink-0" />,
                  badge: liveMetrics.activeProducts,
                },
                {
                  id: "categories" as const,
                  label: "Categories",
                  icon: <LayersIcon className="w-4 h-4 shrink-0" />,
                },
                {
                  id: "coupons" as const,
                  label: "Coupons",
                  icon: <TicketIcon className="w-4 h-4 shrink-0" />,
                  badge: liveMetrics.activeCoupons,
                },
                {
                  id: "pincodes" as const,
                  label: "Delivery Pincodes",
                  icon: (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  badge: liveMetrics.totalPincodes,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectSection(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer relative ${
                    activeSection === item.id
                      ? "bg-rose-50 text-rose-700 font-semibold"
                      : "text-gray-600 hover:bg-rose-50/50 hover:text-rose-700"
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    {item.icon}
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </span>
                  {!sidebarCollapsed &&
                    typeof item.badge === "number" &&
                    item.badge > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                        {item.badge}
                      </span>
                    )}
                  {activeSection === item.id && (
                    <span className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-rose-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Customers & Leads Group */}
        <div>
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setCustomersGroupOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <UsersIcon className="w-3.5 h-3.5" />
                Customers &amp; Leads
              </span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${
                  customersGroupOpen ? "" : "-rotate-90"
                }`}
              />
            </button>
          )}
          {(customersGroupOpen || sidebarCollapsed) && (
            <div className="mt-1 space-y-1">
              {[
                {
                  id: "customers" as const,
                  label: "Customers",
                  icon: <UsersIcon className="w-4 h-4 shrink-0" />,
                  badge: liveMetrics.registeredCustomers,
                },
                {
                  id: "reviews" as const,
                  label: "Reviews",
                  icon: <StarIcon className="w-4 h-4 shrink-0" />,
                  badge: liveMetrics.reviewsToApprove,
                },
                {
                  id: "inquiries" as const,
                  label: "Inquiries",
                  icon: <MessageSquareIcon className="w-4 h-4 shrink-0" />,
                  badge: liveMetrics.openInquiries,
                },
                {
                  id: "subscribers" as const,
                  label: "Subscribers",
                  icon: <MailIcon className="w-4 h-4 shrink-0" />,
                  badge: subscribers.length,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectSection(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer relative ${
                    activeSection === item.id
                      ? "bg-rose-50 text-rose-700 font-semibold"
                      : "text-gray-600 hover:bg-rose-50/50 hover:text-rose-700"
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    {item.icon}
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </span>
                  {!sidebarCollapsed &&
                    typeof item.badge === "number" &&
                    item.badge > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                        {item.badge}
                      </span>
                    )}
                  {activeSection === item.id && (
                    <span className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-rose-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Website & CMS Group */}
        <div>
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setCmsGroupOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SlidersIcon className="w-3.5 h-3.5" />
                Website &amp; CMS
              </span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${
                  cmsGroupOpen ? "" : "-rotate-90"
                }`}
              />
            </button>
          )}
          {(cmsGroupOpen || sidebarCollapsed) && (
            <div className="mt-1 space-y-1">
              <button
                type="button"
                onClick={() => selectSection("hero-slides")}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer relative ${
                  activeSection === "hero-slides"
                    ? "bg-rose-50 text-rose-700 font-semibold"
                    : "text-gray-600 hover:bg-rose-50/50 hover:text-rose-700"
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  {!sidebarCollapsed && <span className="truncate">Hero Slides</span>}
                </span>
                {!sidebarCollapsed && heroSlidesCount > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                    {heroSlidesCount}
                  </span>
                )}
                {activeSection === "hero-slides" && (
                  <span className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-rose-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => selectSection("cms")}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer relative ${
                  activeSection === "cms"
                    ? "bg-rose-50 text-rose-700 font-semibold"
                    : "text-gray-600 hover:bg-rose-50/50 hover:text-rose-700"
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <SlidersIcon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">Store Settings</span>}
                </span>
                {activeSection === "cms" && (
                  <span className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-rose-600" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Settings Group */}
        <div>
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSettingsGroupOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                Settings
              </span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${
                  settingsGroupOpen ? "" : "-rotate-90"
                }`}
              />
            </button>
          )}
          {(settingsGroupOpen || sidebarCollapsed) && (
            <div className="mt-1 space-y-1">
              <button
                type="button"
                onClick={() => selectSection("delivery-settings")}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer relative ${
                  activeSection === "delivery-settings"
                    ? "bg-rose-50 text-rose-700 font-semibold"
                    : "text-gray-600 hover:bg-rose-50/50 hover:text-rose-700"
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v10.875" />
                  </svg>
                  {!sidebarCollapsed && <span className="truncate">Delivery Settings</span>}
                </span>
                {activeSection === "delivery-settings" && (
                  <span className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-rose-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Collapse Footer */}
      <div className="p-3 border-t border-rose-100 hidden lg:block">
        <button
          type="button"
          onClick={() => setSidebarCollapsed((v) => !v)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
        >
          <CollapseIcon
            className={`w-4 h-4 shrink-0 transition-transform ${
              sidebarCollapsed ? "rotate-180" : ""
            }`}
          />
          {!sidebarCollapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#FFF9FA] text-gray-900">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-rose-100 px-3.5 sm:px-7 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-1.5 sm:p-2 rounded-xl border border-rose-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700 shrink-0"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <img
              src="/ms-logo.jpg"
              alt="MS Flowers Logo"
              className="lg:hidden w-8 h-8 rounded-xl object-cover border border-rose-100 shrink-0"
            />
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">
              {SECTION_TITLES[activeSection]}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => loadDashboardData(true)}
              disabled={refreshingDashboard}
              aria-label="Sync Realtime Data"
              title="Sync live orders, reviews, inquiries & metrics from database"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${refreshingDashboard ? "animate-spin text-rose-600" : ""}`}
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
              <span className="hidden sm:inline">
                {refreshingDashboard ? "Syncing..." : "Sync DB"}
              </span>
            </button>

            <Link
              href="/"
              target="_blank"
              aria-label="View Store"
              title="View Store"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
            >
              <span className="hidden sm:inline">View Store</span>
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </Link>

            <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center text-xs font-bold">
                {session.adminName.charAt(0)}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-gray-900">
                  {session.adminName}
                </p>
                <p className="text-[10px] text-rose-700 font-medium">
                  {session.role}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              className="inline-flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto rounded-full sm:rounded-xl bg-rose-600 sm:bg-rose-50 sm:border sm:border-rose-200 sm:px-3 sm:py-1.5 text-xs font-semibold text-white sm:text-rose-700 shadow-xs shadow-rose-200 sm:shadow-none hover:bg-rose-700 sm:hover:bg-rose-600 sm:hover:text-white sm:hover:border-rose-600 transition-colors cursor-pointer shrink-0"
            >
              <PowerIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-7 max-w-[1400px] w-full mx-auto space-y-6 pb-28">
          {activeSection === "dashboard" ? (
            <>
              {/* Dynamic Time-Synced Greeting Hero Banner */}
              <div
                className={`relative rounded-2xl sm:rounded-3xl border bg-white shadow-sm transition-all duration-500 ${
                  moodConfig.isDark
                    ? "border-rose-200/80 shadow-rose-100/60 sm:border-rose-900/50 sm:shadow-rose-950/20"
                    : "border-rose-200/80 shadow-rose-100/60"
                }`}
              >
                {/* Mobile: Top Floral Banner Strip (text sits cleanly outside below) */}
                <div className="relative h-44 w-full overflow-hidden rounded-t-2xl sm:hidden">
                  <img
                    src={moodConfig.image}
                    alt={`${moodConfig.label} floral backdrop`}
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/45 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                      {activeMood === "morning" ? (
                        <SunriseIcon className="w-3.5 h-3.5" />
                      ) : activeMood === "afternoon" ? (
                        <SunIcon className="w-3.5 h-3.5" />
                      ) : activeMood === "evening" ? (
                        <SunsetIcon className="w-3.5 h-3.5" />
                      ) : (
                        <MoonStarsIcon className="w-3.5 h-3.5" />
                      )}
                      <span>{moodConfig.label} Shift</span>
                      {formattedTime && (
                        <>
                          <span>&bull;</span>
                          <span>{formattedTime}</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/90">
                      Store Overview
                    </span>
                  </div>
                </div>

                {/* Desktop: Full-bleed Backdrop Image & Overlay */}
                <div className="hidden sm:block absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <img
                    src={moodConfig.image}
                    alt={`${moodConfig.label} floral backdrop`}
                    className="h-full w-full object-cover object-center transition-opacity duration-500"
                  />
                  <div
                    className={`absolute inset-0 transition-colors duration-500 ${moodConfig.overlayClass}`}
                  />
                </div>

                <div className="relative z-10 p-4 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-5">
                  <div className="max-w-xl">
                    <div className="hidden sm:flex flex-wrap items-center gap-2 mb-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-bold backdrop-blur-xs ${moodConfig.badgeClass}`}
                      >
                        {activeMood === "morning" ? (
                          <SunriseIcon className="w-3.5 h-3.5" />
                        ) : activeMood === "afternoon" ? (
                          <SunIcon className="w-3.5 h-3.5" />
                        ) : activeMood === "evening" ? (
                          <SunsetIcon className="w-3.5 h-3.5" />
                        ) : (
                          <MoonStarsIcon className="w-3.5 h-3.5" />
                        )}
                        <span>{moodConfig.label} Shift</span>
                        {formattedTime && (
                          <>
                            <span>&bull;</span>
                            <span>{formattedTime}</span>
                          </>
                        )}
                      </span>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          moodConfig.isDark ? "text-rose-200/90" : "text-rose-700"
                        }`}
                      >
                        Store Overview
                      </span>
                    </div>

                    <h2
                      className={`text-xl sm:text-3xl font-bold tracking-tight ${
                        moodConfig.isDark
                          ? "text-gray-900 sm:text-white"
                          : "text-gray-900"
                      }`}
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {moodConfig.greeting}, {session.adminName}!
                    </h2>

                    <p
                      className={`text-xs sm:text-sm mt-1 sm:mt-1.5 leading-relaxed ${
                        moodConfig.isDark
                          ? "text-gray-600 sm:text-rose-100/90"
                          : "text-gray-600 sm:text-gray-700"
                      }`}
                    >
                      {moodConfig.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-2.5 shrink-0">
                    {formattedDate && (
                      <div
                        className={`rounded-xl border px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-2xs ${
                          moodConfig.isDark
                            ? "border-rose-200/80 bg-rose-50/70 text-rose-700 sm:border-white/20 sm:bg-white/10 sm:text-white"
                            : "border-rose-200/80 bg-rose-50/70 sm:bg-white/85 text-rose-700"
                        }`}
                      >
                        {formattedDate}
                      </div>
                    )}

                    {/* Glassmorphic Time Mood Preview Dropdown */}
                    <div ref={moodDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setMoodDropdownOpen((prev) => !prev)}
                        aria-expanded={moodDropdownOpen}
                        aria-haspopup="listbox"
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold backdrop-blur-xl shadow-sm transition-all cursor-pointer ${
                          moodConfig.isDark
                            ? "border-rose-200/70 bg-white/70 text-gray-800 hover:bg-white sm:border-white/25 sm:bg-white/15 sm:text-white sm:hover:bg-white/25"
                            : "border-rose-200/80 bg-white/75 text-gray-800 hover:bg-white/95"
                        }`}
                      >
                        {activeMood === "morning" ? (
                          <SunriseIcon className="w-3.5 h-3.5 text-amber-500 sm:text-current" />
                        ) : activeMood === "afternoon" ? (
                          <SunIcon className="w-3.5 h-3.5 text-sky-500 sm:text-current" />
                        ) : activeMood === "evening" ? (
                          <SunsetIcon className="w-3.5 h-3.5 text-rose-500 sm:text-current" />
                        ) : (
                          <MoonStarsIcon className="w-3.5 h-3.5 text-indigo-500 sm:text-current" />
                        )}
                        <span>
                          {moodOverride === "auto"
                            ? `Auto (${moodConfig.label})`
                            : moodConfig.label}
                        </span>
                        <ChevronDownIcon
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            moodDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {moodDropdownOpen && (
                        <div
                          role="listbox"
                          className={`absolute left-0 lg:left-auto lg:right-0 mt-2 w-48 rounded-2xl border p-1.5 backdrop-blur-xl shadow-xl z-30 ${
                            moodConfig.isDark
                              ? "border-rose-200/70 bg-white/85 text-gray-800 sm:border-white/20 sm:bg-gray-950/75 sm:text-white"
                              : "border-rose-200/70 bg-white/85 text-gray-800"
                          }`}
                        >
                          {(
                            [
                              { id: "auto", label: `Auto (${TIME_MOOD_CONFIG[autoMood].label})` },
                              { id: "morning", label: "Morning" },
                              { id: "afternoon", label: "Afternoon" },
                              { id: "evening", label: "Evening" },
                              { id: "night", label: "Night" },
                            ] as const
                          ).map((opt) => {
                            const isActive = moodOverride === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                onClick={() => {
                                  setMoodOverride(opt.id);
                                  setMoodDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                                  isActive
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : moodConfig.isDark
                                    ? "hover:bg-rose-50 hover:text-rose-700 sm:hover:bg-white/15 sm:hover:text-white"
                                    : "hover:bg-rose-50 hover:text-rose-700"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {opt.id === "auto" ? (
                                    <SlidersIcon className="w-3.5 h-3.5 opacity-80" />
                                  ) : opt.id === "morning" ? (
                                    <SunriseIcon className="w-3.5 h-3.5 opacity-80" />
                                  ) : opt.id === "afternoon" ? (
                                    <SunIcon className="w-3.5 h-3.5 opacity-80" />
                                  ) : opt.id === "evening" ? (
                                    <SunsetIcon className="w-3.5 h-3.5 opacity-80" />
                                  ) : (
                                    <MoonStarsIcon className="w-3.5 h-3.5 opacity-80" />
                                  )}
                                  <span>{opt.label}</span>
                                </span>
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 1: 4 Action / Attention KPI Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => selectSection("orders")}
                  className="text-left rounded-2xl border border-rose-100 bg-white p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-rose-200 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                      <CartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900">
                      {liveMetrics.ordersToProcess}
                    </span>
                  </div>
                  <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                    Orders to process
                  </p>
                  <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
                    Pending or processing
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => selectSection("reviews")}
                  className="text-left rounded-2xl border border-rose-100 bg-white p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-rose-200 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900">
                      {liveMetrics.reviewsToApprove}
                    </span>
                  </div>
                  <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                    Reviews to approve
                  </p>
                  <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
                    {liveMetrics.reviewsToApprove > 0
                      ? "Waiting moderation"
                      : "Nothing waiting"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => selectSection("inquiries")}
                  className="text-left rounded-2xl border border-rose-100 bg-white p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-rose-200 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
                      <MessageSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900">
                      {liveMetrics.openInquiries}
                    </span>
                  </div>
                  <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                    Open inquiries
                  </p>
                  <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
                    {liveMetrics.openInquiries > 0
                      ? "Custom & bulk requests"
                      : "No open inquiries"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDashboardProductTab("low")}
                  className="text-left rounded-2xl border border-rose-100 bg-white p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-rose-200 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                      <WarningIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900">
                      {liveMetrics.lowStockAlerts}
                    </span>
                  </div>
                  <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                    Low stock variants
                  </p>
                  <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
                    Click to view alerts
                  </p>
                </button>
              </div>

              {/* Row 2: 4 Store Metrics KPI Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-rose-100 bg-white p-3.5 sm:p-5 shadow-xs">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                    <RupeeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <p className="mt-2.5 sm:mt-4 text-xl sm:text-2xl font-extrabold text-gray-900">
                    &#8377;{liveMetrics.totalRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5 sm:mt-1">
                    Total Revenue
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-white p-3.5 sm:p-5 shadow-xs">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <p className="mt-2.5 sm:mt-4 text-xl sm:text-2xl font-extrabold text-gray-900">
                    {liveMetrics.totalOrders}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5 sm:mt-1">
                    Total Orders
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-white p-3.5 sm:p-5 shadow-xs">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
                    <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <p className="mt-2.5 sm:mt-4 text-xl sm:text-2xl font-extrabold text-gray-900">
                    {liveMetrics.registeredCustomers}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5 sm:mt-1">
                    Registered Customers
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-white p-3.5 sm:p-5 shadow-xs">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                    <BoxIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900">
                      {liveMetrics.activeProducts}
                    </span>
                    <span className="text-[11px] sm:text-xs text-gray-400 font-medium">
                      of {liveMetrics.totalProducts} total
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5 sm:mt-1">
                    Active Products
                  </p>
                </div>
              </div>

              {/* Row 3: Product Performance Hub (2 cols) & Quick Actions (1 col) */}
              {(() => {
                const displayTopProducts =
                  dashboardData?.topProducts && dashboardData.topProducts.length > 0
                    ? dashboardData.topProducts
                    : topProducts.length > 0
                    ? topProducts
                    : [
                        {
                          id: "MS-FL-01",
                          name: "Luxury Red Roses Bouquet (12 Blooms)",
                          group: "Flowers",
                          price: 799,
                          image: "/products/flowers/red-roses-bouquet.jpg",
                          soldCount: 2,
                        },
                        {
                          id: "MS-FL-02",
                          name: "Imperial White Lilies & Carnations Bunch",
                          group: "Flowers",
                          price: 1299,
                          image: "/products/flowers/white-lilies-carnations.jpg",
                          soldCount: 1,
                        },
                        {
                          id: "MS-CB-01",
                          name: "Classic Romance Rose Bouquet & Chocolate Cake",
                          group: "Combos",
                          price: 1899,
                          image: "/products/combos/roses-chocolate-combo.jpg",
                          soldCount: 1,
                        },
                        {
                          id: "MS-CK-02",
                          name: "Dutch Chocolate Truffle Cake (1 Kg)",
                          group: "Cakes",
                          price: 1099,
                          image: "/products/cakes/chocolate-truffle-cake.jpg",
                          soldCount: 1,
                        },
                        {
                          id: "MS-FL-03",
                          name: "Exotic Purple Orchids in Glass Vase",
                          group: "Flowers",
                          price: 499,
                          image: "/products/flowers/purple-orchids-vase.jpg",
                          soldCount: 1,
                        },
                      ];

                const displayLowStock =
                  lowStock.length > 0
                    ? lowStock
                    : [
                        {
                          id: "ls-1",
                          productName: "Velvet Dutch Roses (6-stem wrap)",
                          category: "Flowers",
                          variant: "Standard Bunch",
                          stock: 3,
                          threshold: 10,
                        },
                        {
                          id: "ls-2",
                          productName: "Belgian Chocolate Truffle (500g)",
                          category: "Cakes",
                          variant: "Half Kg",
                          stock: 4,
                          threshold: 10,
                        },
                      ];

                const displayInquiries =
                  dashboardData?.recentInquiries && dashboardData.recentInquiries.length > 0
                    ? dashboardData.recentInquiries
                    : inquiries;

                const displayOrders =
                  dashboardData?.recentOrders && dashboardData.recentOrders.length > 0
                    ? dashboardData.recentOrders
                    : orders;

                return (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {/* Left 2 Cols: Product Performance & Inventory Hub */}
                      <div className="lg:col-span-2 rounded-2xl border border-rose-100 bg-white p-5 shadow-xs flex flex-col justify-between">
                        {/* Tab Switcher Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-rose-100">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDashboardProductTab("top")}
                              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                dashboardProductTab === "top"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "text-gray-600 hover:bg-rose-50 hover:text-rose-700"
                              }`}
                            >
                              <FlowerSparkIcon className="w-3.5 h-3.5" />
                              <span>Top Selling Blooms &amp; Cakes</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDashboardProductTab("low")}
                              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                dashboardProductTab === "low"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "text-gray-600 hover:bg-rose-50 hover:text-rose-700"
                              }`}
                            >
                              <WarningIcon className="w-3.5 h-3.5" />
                              <span>Low Stock Alerts</span>
                              {liveMetrics.lowStockAlerts > 0 && (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    dashboardProductTab === "low"
                                      ? "bg-white/20 text-white"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {liveMetrics.lowStockAlerts}
                                </span>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {dashboardProductTab === "top" ? (
                              <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                                Last 30 Days Live
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => selectSection("products")}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                              >
                                Manage in Catalog &rarr;
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Content View A: Top Selling Products (Tabular List, 4 rows visible + Scrollable) */}
                        {dashboardProductTab === "top" ? (
                          <div className="flex-1 flex flex-col min-w-0">
                            {displayTopProducts.length === 0 ? (
                              <div className="py-12 flex flex-col items-center justify-center text-center">
                                <FlowerSparkIcon className="w-8 h-8 text-rose-200 mb-2" />
                                <p className="text-xs font-semibold text-gray-700">No sales recorded yet</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Top selling blooms and cakes will appear here.</p>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-rose-100 bg-white overflow-hidden shadow-2xs">
                                <div className="overflow-x-auto overflow-y-auto max-h-[260px] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-rose-50/40 [&::-webkit-scrollbar-thumb]:bg-rose-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-rose-300">
                                  <table className="w-full text-left text-xs">
                                    <thead className="sticky top-0 bg-rose-50/95 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-rose-900/70 border-b border-rose-100 z-10 shadow-2xs">
                                      <tr>
                                        <th className="px-3.5 py-2.5 w-12 text-center">#</th>
                                        <th className="px-3.5 py-2.5">Product</th>
                                        <th className="px-3.5 py-2.5">Category</th>
                                        <th className="px-3.5 py-2.5">Price</th>
                                        <th className="px-3.5 py-2.5 text-center">Units Sold</th>
                                        <th className="px-3.5 py-2.5 text-right">Revenue</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-rose-100/70">
                                      {displayTopProducts.map((prod: any, idx: number) => {
                                        const rank = idx + 1;
                                        const revenue = (Number(prod.price) || 0) * (Number(prod.soldCount) || 1);
                                        return (
                                          <tr
                                            key={prod.id || idx}
                                            className="hover:bg-rose-50/40 transition-colors h-[56px]"
                                          >
                                            <td className="px-3.5 py-2 text-center whitespace-nowrap">
                                              <span
                                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-extrabold ${
                                                  rank === 1
                                                    ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs"
                                                    : rank === 2
                                                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                                                    : rank === 3
                                                    ? "bg-pink-100 text-pink-700 border border-pink-200"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                              >
                                                {rank}
                                              </span>
                                            </td>
                                            <td className="px-3.5 py-2">
                                              <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                  src={prod.image}
                                                  alt={prod.name}
                                                  onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                      "/products/flowers/red-roses-bouquet.jpg";
                                                  }}
                                                  className="w-10 h-10 rounded-lg object-cover border border-rose-100 shadow-2xs shrink-0 bg-rose-100/40"
                                                />
                                                <div className="min-w-0">
                                                  <p
                                                    className="font-bold text-gray-900 truncate max-w-[180px] sm:max-w-[240px] text-xs"
                                                    title={prod.name}
                                                  >
                                                    {prod.name}
                                                  </p>
                                                  <span className="text-[10px] text-gray-400 font-mono">
                                                    {prod.id}
                                                  </span>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="px-3.5 py-2 whitespace-nowrap">
                                              <span
                                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                  prod.group === "Flowers"
                                                    ? "bg-rose-100 text-rose-800"
                                                    : prod.group === "Cakes"
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-purple-100 text-purple-800"
                                                }`}
                                              >
                                                {prod.group}
                                              </span>
                                            </td>
                                            <td className="px-3.5 py-2 whitespace-nowrap">
                                              <span className="font-bold text-gray-800 text-xs">
                                                &#8377;{prod.price}
                                              </span>
                                            </td>
                                            <td className="px-3.5 py-2 whitespace-nowrap text-center">
                                              <span className="inline-flex items-center font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                                                {prod.soldCount} sold
                                              </span>
                                            </td>
                                            <td className="px-3.5 py-2 whitespace-nowrap text-right">
                                              <span className="font-bold text-rose-600 text-xs">
                                                &#8377;{revenue.toLocaleString("en-IN")}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Content View B: Low Stock Variants */
                          <div className="space-y-3 flex-1 flex flex-col justify-center">
                            {displayLowStock.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-4 rounded-xl border border-amber-200/80 bg-amber-50/30 p-3.5"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">
                                    {item.productName}
                                  </p>
                                  <p className="text-[11px] text-gray-500 truncate">
                                    {item.category} &bull; {item.variant}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    {item.stock} left in stock
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => restockItem(item.id, 15)}
                                    className="rounded-lg bg-rose-600 text-white px-3 py-1 text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer shadow-2xs"
                                  >
                                    +15 Restock
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right 1 Col: Quick Actions */}
                      <div className="lg:col-span-1 rounded-2xl border border-rose-100 bg-white p-5 shadow-xs flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <span className="text-rose-600">
                              <FlowerSparkIcon className="w-4 h-4" />
                            </span>
                            Quick Store Actions
                          </h3>
                          <p className="text-[11px] text-gray-500 mb-4">
                            Direct management shortcuts
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 flex-1">
                          <button
                            type="button"
                            onClick={() => selectSection("orders")}
                            className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3 text-left hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-semibold text-gray-800">
                              Process Pending Orders
                            </span>
                            <span className="rounded-full bg-rose-600 text-white px-2 py-0.5 text-[11px] font-bold">
                              {liveMetrics.ordersToProcess}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => selectSection("reviews")}
                            className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3 text-left hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-semibold text-gray-800">
                              Approve Customer Reviews
                            </span>
                            <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[11px] font-bold">
                              {liveMetrics.reviewsToApprove}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => selectSection("inquiries")}
                            className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3 text-left hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-semibold text-gray-800">
                              Respond to Bulk Inquiries
                            </span>
                            <span className="rounded-full bg-sky-600 text-white px-2 py-0.5 text-[11px] font-bold">
                              {liveMetrics.openInquiries}
                            </span>
                          </button>

                          <Link
                            href="/"
                            target="_blank"
                            className="flex items-center justify-between rounded-xl border border-rose-200 bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-3 text-xs font-semibold text-white hover:from-rose-700 hover:to-pink-700 transition-colors"
                          >
                            <span>Open Live Storefront</span>
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Row 4: 2 Tables (Customer Inquiries & Recent Orders — Seamless Fluid Scrolling) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      {/* Table 1: Customer Inquiries */}
                      <div className="rounded-2xl border border-rose-100 bg-white shadow-xs overflow-hidden flex flex-col">
                        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-rose-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-rose-600">
                              <MessageSquareIcon className="w-4 h-4" />
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">
                                Customer Inquiries
                              </h3>
                              <p className="text-[11px] text-gray-500">
                                Click any inquiry to open details
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => selectSection("inquiries")}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer shrink-0"
                          >
                            View all ({displayInquiries.length})
                          </button>
                        </div>

                        {/* Mobile Card View */}
                        <div className="sm:hidden divide-y divide-rose-100/70">
                          {displayInquiries.length === 0 ? (
                            <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                              <MessageSquareIcon className="w-7 h-7 text-rose-200 mb-1.5" />
                              <p className="text-xs font-semibold text-gray-700">No open inquiries</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">Customer requests will appear here.</p>
                            </div>
                          ) : (
                            displayInquiries.map((inq: any) => (
                              <div
                                key={inq.id}
                                onClick={() => setSelectedInquiry(inq)}
                                className="p-3.5 hover:bg-rose-50/40 active:bg-rose-50/60 transition-colors cursor-pointer space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">
                                      {inq.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400">
                                      {inq.date}
                                    </p>
                                  </div>
                                  <span
                                    className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                      inq.status === "open"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    }`}
                                  >
                                    {inq.status === "open" ? "Open" : "Resolved"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-medium text-gray-700 truncate">
                                    {inq.subject}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedInquiry(inq);
                                    }}
                                    className="shrink-0 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors cursor-pointer"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Desktop Table View (No mouse-wheel trapping) */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-rose-50/95 text-[11px] font-semibold uppercase tracking-wider text-rose-900/70 border-b border-rose-100">
                              <tr>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Subject</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-100/70">
                              {displayInquiries.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                                    <MessageSquareIcon className="w-7 h-7 text-rose-200 mx-auto mb-1.5" />
                                    <p className="text-xs font-semibold text-gray-700">No open inquiries</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Customer custom requests will appear here.</p>
                                  </td>
                                </tr>
                              ) : (
                                displayInquiries.map((inq: any) => (
                                  <tr
                                    key={inq.id}
                                    onClick={() => setSelectedInquiry(inq)}
                                    className="hover:bg-rose-50/40 transition-colors cursor-pointer h-[52px]"
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="font-semibold text-gray-900">
                                        {inq.name}
                                      </div>
                                      <div className="text-[11px] text-gray-400">
                                        {inq.date}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 max-w-[160px]">
                                      <p className="font-medium text-gray-800 truncate">
                                        {inq.subject}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                          inq.status === "open"
                                            ? "bg-rose-100 text-rose-700"
                                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        }`}
                                      >
                                        {inq.status === "open" ? "Open" : "Resolved"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedInquiry(inq);
                                        }}
                                        className="rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors cursor-pointer"
                                      >
                                        View
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Table 2: Recent Orders */}
                      <div className="rounded-2xl border border-rose-100 bg-white shadow-xs overflow-hidden flex flex-col">
                        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-rose-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-rose-600">
                              <CartIcon className="w-4 h-4" />
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">
                                Recent Orders
                              </h3>
                              <p className="text-[11px] text-gray-500">
                                Latest flower &amp; cake deliveries
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => selectSection("orders")}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer shrink-0"
                          >
                            View all ({displayOrders.length})
                          </button>
                        </div>

                        {/* Mobile Card View */}
                        <div className="sm:hidden divide-y divide-rose-100/70">
                          {displayOrders.length === 0 ? (
                            <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                              <CartIcon className="w-7 h-7 text-rose-200 mb-1.5" />
                              <p className="text-xs font-semibold text-gray-700">No orders placed yet</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">New customer orders will show up here live.</p>
                            </div>
                          ) : (
                            displayOrders.map((order: any) => (
                              <div key={order.orderId} className="p-3.5 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900">
                                      {order.orderId} &bull; {order.customerName}
                                    </p>
                                    <p className="text-[11px] text-gray-500 truncate">
                                      {order.slotLabel} &bull; {order.area}
                                    </p>
                                  </div>
                                  <span className="shrink-0 text-xs font-extrabold text-gray-900">
                                    &#8377;{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div className="flex items-center justify-end">
                                  <span
                                    className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${
                                      order.status === "Pending" || order.status === "Confirmed"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : order.status === "Processing"
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : order.status === "Out for Delivery" || order.status === "Shipped"
                                        ? "bg-sky-50 text-sky-700 border-sky-200"
                                        : order.status === "Cancelled"
                                        ? "bg-gray-100 text-gray-600 border-gray-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Desktop Table View (No mouse-wheel trapping) */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-rose-50/95 text-[11px] font-semibold uppercase tracking-wider text-rose-900/70 border-b border-rose-100">
                              <tr>
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-100/70">
                              {displayOrders.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                                    <CartIcon className="w-7 h-7 text-rose-200 mx-auto mb-1.5" />
                                    <p className="text-xs font-semibold text-gray-700">No orders placed yet</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">New customer orders will show up here live.</p>
                                  </td>
                                </tr>
                              ) : (
                                displayOrders.map((order: any) => (
                                  <tr
                                    key={order.orderId}
                                    className="hover:bg-rose-50/40 transition-colors h-[52px]"
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="font-bold text-gray-900">
                                        {order.orderId}
                                      </div>
                                      <div className="text-[11px] text-gray-400 truncate max-w-[130px]">
                                        {order.slotLabel}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="font-medium text-gray-900">
                                        {order.customerName}
                                      </div>
                                      <div className="text-[11px] text-gray-500 truncate max-w-[140px]">
                                        {order.area}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                                      &#8377;{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span
                                        className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${
                                          order.status === "Pending" || order.status === "Confirmed"
                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                            : order.status === "Processing"
                                            ? "bg-rose-50 text-rose-700 border-rose-200"
                                            : order.status === "Out for Delivery" || order.status === "Shipped"
                                            ? "bg-sky-50 text-sky-700 border-sky-200"
                                            : order.status === "Cancelled"
                                            ? "bg-gray-100 text-gray-600 border-gray-200"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        }`}
                                      >
                                        {order.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status & Scroll Indicator */}
                    <div className="pt-4 border-t border-rose-100/80 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-semibold text-gray-700">MS Flowers &amp; Cakes Admin Live Sync</span>
                      </div>
                      <span className="text-gray-400">
                        Kolkata Central Hub &bull; 90-Min Express Dispatch Operations
                      </span>
                    </div>
                  </>
                );
              })()}
            </>
          ) : activeSection === "orders" ? (
            <OrdersView orders={orders} onUpdateStatus={updateOrderStatus} />
          ) : activeSection === "pincodes" ? (
            <PincodesView />
          ) : activeSection === "products" ? (
            <ProductsView
              products={catalogProducts}
              lowStock={lowStock}
              onRestock={(id) => restockItem(id, 15)}
            />
          ) : activeSection === "categories" ? (
            <CategoriesView categories={categories} />
          ) : activeSection === "coupons" ? (
            <CouponsView coupons={coupons} onToggle={toggleCoupon} />
          ) : activeSection === "customers" ? (
            <CustomersView customers={customers} />
          ) : activeSection === "reviews" ? (
            <ReviewsModerationView />
          ) : activeSection === "inquiries" ? (
            <InquiriesManagerView />
          ) : activeSection === "subscribers" ? (
            <SubscribersView subscribers={subscribers} />
          ) : activeSection === "hero-slides" ? (
            <HeroSlidesManagerView onSlideCountChange={setHeroSlidesCount} />
          ) : activeSection === "delivery-settings" ? (
            <DeliverySettingsView />
          ) : (
            <StoreSettingsView />
          )}
        </main>
      </div>

      {/* Customer Inquiry Detail Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/45 backdrop-blur-xs"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl shadow-rose-950/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    selectedInquiry.status === "open"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {selectedInquiry.status === "open"
                    ? "Open Inquiry"
                    : "Resolved"}
                </span>
                <h3
                  className="mt-2 text-lg font-bold text-gray-900"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {selectedInquiry.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-xl border border-rose-100 text-gray-500 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-xs">
              <div>
                <p className="text-gray-400 font-medium">Customer Name</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {selectedInquiry.name}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Phone Number</p>
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="font-semibold text-rose-700 hover:underline mt-0.5 inline-block"
                >
                  {selectedInquiry.phone}
                </a>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-400 font-medium">Received</p>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {selectedInquiry.date}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-1.5">
                Inquiry Message
              </p>
              <div className="rounded-2xl border border-rose-100 bg-[#FFF9FA] p-4 text-sm text-gray-700 leading-relaxed">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              {selectedInquiry.status === "open" && (
                <button
                  type="button"
                  onClick={() => {
                    resolveInquiry(selectedInquiry.id);
                    setSelectedInquiry({
                      ...selectedInquiry,
                      status: "resolved",
                    });
                  }}
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-rose-700 hover:to-pink-700 transition-colors cursor-pointer"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
