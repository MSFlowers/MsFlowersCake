"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Product } from "./types";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Out for Delivery"
  | "Delivered";

export interface AdminOrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface AdminOrder {
  orderId: string;
  sku?: string;
  customerName: string;
  customerPhone: string;
  recipientName?: string;
  recipientPhone?: string;
  area: string;
  pincode: string;
  deliveryAddress?: string;
  itemsSummary: string;
  itemCount: number;
  items?: AdminOrderItem[];
  totalAmount: number;
  deliveryFee?: number;
  discount?: number;
  paymentMethod?: string;
  paymentStatus?: "Paid" | "COD Pending";
  giftMessage?: string;
  slotLabel: string;
  status: OrderStatus;
  placedAt: string;
}

export interface AdminReview {
  id: string;
  productName: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  status: "pending" | "approved";
}

export interface AdminInquiry {
  id: string;
  name: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: "open" | "resolved";
}

export interface LowStockItem {
  id: string;
  productName: string;
  category: string;
  variant: string;
  stock: number;
  threshold: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountLabel: string;
  minOrder: number;
  usageCount: number;
  active: boolean;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  ordersCount: number;
  totalSpent: number;
}

export interface AdminSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  adminName: string;
  adminEmail: string;
  role: string;
  token?: string;
}

export interface CatalogProductRow {
  product: Product;
  group: "Flowers" | "Cakes" | "Combos";
}

export interface AdminCategoryRow {
  id: string;
  label: string;
  count: number;
  group: string;
}

interface AdminStoreState {
  session: AdminSession;
  orders: AdminOrder[];
  reviews: AdminReview[];
  inquiries: AdminInquiry[];
  lowStock: LowStockItem[];
  coupons: AdminCoupon[];
  customers: AdminCustomer[];
  subscribers: AdminSubscriber[];
  catalogProducts: CatalogProductRow[];
  categories: AdminCategoryRow[];
  hydrated: boolean;
}

const SESSION_KEY = "ms_admin_session_v1";
const DATA_KEY = "ms_admin_data_v3";

const DEFAULT_SESSION: AdminSession = {
  isAuthenticated: false,
  adminName: "Admin",
  adminEmail: "",
  role: "Administrator",
};

const SERVER_SNAPSHOT: AdminStoreState = {
  session: DEFAULT_SESSION,
  orders: [],
  reviews: [],
  inquiries: [],
  lowStock: [],
  coupons: [],
  customers: [],
  subscribers: [],
  catalogProducts: [],
  categories: [],
  hydrated: false,
};

let memoryState: AdminStoreState = { ...SERVER_SNAPSHOT };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function persistSession(session: AdminSession) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors
  }
}

function persistData(state: AdminStoreState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DATA_KEY,
      JSON.stringify({
        orders: state.orders,
        reviews: state.reviews,
        inquiries: state.inquiries,
        lowStock: state.lowStock,
        coupons: state.coupons,
        customers: state.customers,
        subscribers: state.subscribers,
        catalogProducts: state.catalogProducts,
        categories: state.categories,
      })
    );
  } catch {
    // ignore storage errors
  }
}

function hydrateAdminStore() {
  if (typeof window === "undefined" || memoryState.hydrated) return;

  let nextSession = DEFAULT_SESSION;
  let nextOrders: AdminOrder[] = [];
  let nextReviews: AdminReview[] = [];
  let nextInquiries: AdminInquiry[] = [];
  let nextLowStock: LowStockItem[] = [];
  let nextCoupons: AdminCoupon[] = [];
  let nextCustomers: AdminCustomer[] = [];
  let nextSubscribers: AdminSubscriber[] = [];
  let nextProducts: CatalogProductRow[] = [];
  let nextCategories: AdminCategoryRow[] = [];

  try {
    // Clear legacy mock data key from localStorage if present
    window.localStorage.removeItem("ms_admin_data_v2");
    window.localStorage.removeItem("ms_admin_data_v3");

    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession) as Partial<AdminSession>;
      if (parsed.isAuthenticated) {
        nextSession = {
          isAuthenticated: true,
          adminName: parsed.adminName || "Admin",
          adminEmail: parsed.adminEmail || "admin@msflowers.in",
          role: parsed.role || "Administrator",
        };
      }
    }

    const rawData = window.localStorage.getItem(DATA_KEY);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed.orders)) nextOrders = parsed.orders;
      if (Array.isArray(parsed.reviews)) nextReviews = parsed.reviews;
      if (Array.isArray(parsed.inquiries)) nextInquiries = parsed.inquiries;
      if (Array.isArray(parsed.lowStock)) nextLowStock = parsed.lowStock;
      if (Array.isArray(parsed.coupons)) nextCoupons = parsed.coupons;
      if (Array.isArray(parsed.customers)) nextCustomers = parsed.customers;
      if (Array.isArray(parsed.subscribers)) nextSubscribers = parsed.subscribers;
      if (Array.isArray(parsed.catalogProducts)) nextProducts = parsed.catalogProducts;
      if (Array.isArray(parsed.categories)) nextCategories = parsed.categories;
    }
  } catch {
    // fallback to empty state
  }

  memoryState = {
    session: nextSession,
    orders: nextOrders,
    reviews: nextReviews,
    inquiries: nextInquiries,
    lowStock: nextLowStock,
    coupons: nextCoupons,
    customers: nextCustomers,
    subscribers: nextSubscribers,
    catalogProducts: nextProducts,
    categories: nextCategories,
    hydrated: true,
  };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return memoryState;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function loginAdmin(email: string, name?: string, token?: string) {
  const cleanEmail = email.trim().toLowerCase() || "admin@msflowers.in";
  const derivedName =
    name?.trim() ||
    (cleanEmail.startsWith("admin")
      ? "Admin"
      : cleanEmail.split("@")[0].replace(/[._-]/g, " "));

  const session: AdminSession = {
    isAuthenticated: true,
    adminName: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
    adminEmail: cleanEmail,
    role: "Administrator",
    token: token || "",
  };
  memoryState = { ...memoryState, session, hydrated: true };
  persistSession(session);
  emit();
}

export function logoutAdmin() {
  memoryState = { ...memoryState, session: DEFAULT_SESSION };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(SESSION_KEY);
      fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    } catch {
      // ignore
    }
  }
  emit();
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = memoryState.orders.map((o) =>
    o.orderId === orderId ? { ...o, status } : o
  );
  memoryState = { ...memoryState, orders };
  persistData(memoryState);
  emit();
}

export function approveReview(reviewId: string) {
  const reviews = memoryState.reviews.map((r) =>
    r.id === reviewId ? { ...r, status: "approved" as const } : r
  );
  memoryState = { ...memoryState, reviews };
  persistData(memoryState);
  emit();
}

export function deleteReview(reviewId: string) {
  const reviews = memoryState.reviews.filter((r) => r.id !== reviewId);
  memoryState = { ...memoryState, reviews };
  persistData(memoryState);
  emit();
}

export function resolveInquiry(inquiryId: string) {
  const inquiries = memoryState.inquiries.map((inq) =>
    inq.id === inquiryId ? { ...inq, status: "resolved" as const } : inq
  );
  memoryState = { ...memoryState, inquiries };
  persistData(memoryState);
  emit();
}

export function restockItem(itemId: string, addUnits = 15) {
  const lowStock = memoryState.lowStock.map((item) =>
    item.id === itemId ? { ...item, stock: item.stock + addUnits } : item
  );
  memoryState = { ...memoryState, lowStock };
  persistData(memoryState);
  emit();
}

export function toggleCoupon(couponId: string) {
  const coupons = memoryState.coupons.map((c) =>
    c.id === couponId ? { ...c, active: !c.active } : c
  );
  memoryState = { ...memoryState, coupons };
  persistData(memoryState);
  emit();
}

export function setCatalogProducts(products: CatalogProductRow[]) {
  memoryState = { ...memoryState, catalogProducts: products };
  persistData(memoryState);
  emit();
}

export function setCategories(categories: AdminCategoryRow[]) {
  memoryState = { ...memoryState, categories };
  persistData(memoryState);
  emit();
}

export function setOrders(orders: AdminOrder[]) {
  memoryState = { ...memoryState, orders };
  persistData(memoryState);
  emit();
}

export function useAdminState() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    hydrateAdminStore();
  }, []);

  const metrics = useMemo(() => {
    const ordersToProcess = state.orders.filter(
      (o) => o.status === "Pending" || o.status === "Processing"
    ).length;
    const reviewsToApprove = state.reviews.filter(
      (r) => r.status === "pending"
    ).length;
    const openInquiries = state.inquiries.filter(
      (i) => i.status === "open"
    ).length;
    const lowStockAlerts = state.lowStock.filter(
      (item) => item.stock < item.threshold
    ).length;
    const totalRevenue = state.orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );

    return {
      ordersToProcess,
      reviewsToApprove,
      openInquiries,
      lowStockAlerts,
      totalRevenue,
      totalOrders: state.orders.length,
      registeredCustomers: state.customers.length,
      activeProducts: state.catalogProducts.length,
      totalProducts: state.catalogProducts.length,
    };
  }, [state]);

  return {
    ...state,
    metrics,
    loginAdmin,
    logoutAdmin,
    updateOrderStatus,
    approveReview,
    deleteReview,
    resolveInquiry,
    restockItem,
    toggleCoupon,
    setCatalogProducts,
    setCategories,
    setOrders,
  };
}
