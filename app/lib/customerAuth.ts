"use client";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  orders_count?: number;
  total_spent?: number;
}

const STORAGE_KEY_USER = "ms_customer_user";
const STORAGE_KEY_TOKEN = "ms_customer_token";

export function getStoredCustomer(): CustomerUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const getCustomerSession = getStoredCustomer;

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  } catch {
    return null;
  }
}

export function saveCustomerSession(user: CustomerUser, token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    window.dispatchEvent(new Event("ms_customer_auth_change"));
  } catch (e) {
    console.error("Failed to save customer session", e);
  }
}

export function clearCustomerSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    window.dispatchEvent(new Event("ms_customer_auth_change"));
  } catch (e) {
    console.error("Failed to clear customer session", e);
  }
}

export async function fetchCurrentCustomer(): Promise<CustomerUser | null> {
  const token = getStoredToken();
  try {
    const res = await fetch("/api/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (data.user) {
      if (token) saveCustomerSession(data.user, token);
      return data.user;
    } else {
      clearCustomerSession();
      return null;
    }
  } catch {
    return getStoredCustomer();
  }
}

export async function logoutCustomer() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {}
  clearCustomerSession();
}
