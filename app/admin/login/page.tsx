"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminState } from "@/app/data/adminState";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from "../components/AdminIcons";

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, hydrated, loginAdmin } = useAdminState();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function getTargetDestination() {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const from = params.get("from");
        if (from && from.startsWith("/admin") && from !== "/admin/login") {
          return from;
        }
        const savedTab = localStorage.getItem("ms_admin_active_tab");
        if (savedTab && savedTab !== "dashboard") {
          return `/admin/dashboard?tab=${encodeURIComponent(savedTab)}`;
        }
      } catch {}
    }
    return "/admin/dashboard";
  }

  useEffect(() => {
    let isCancelled = false;
    async function checkExistingAuth() {
      if (session.isAuthenticated) {
        router.replace(getTargetDestination());
        return;
      }
      try {
        const res = await fetch("/api/admin/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.admin && !isCancelled) {
            loginAdmin(data.admin.email, data.admin.name);
            router.replace(getTargetDestination());
          }
        }
      } catch {
        // proceed with login form
      }
    }

    if (hydrated) {
      checkExistingAuth();
    }
    return () => {
      isCancelled = true;
    };
  }, [hydrated, session.isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid admin email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your admin password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please verify your credentials.");
        setSubmitting(false);
        return;
      }

      // Valid JWT token signed & cookie set
      loginAdmin(data.admin.email, data.admin.name, data.token);
      router.push(getTargetDestination());
    } catch (err: any) {
      setError(err?.message || "Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 bg-gradient-to-br from-rose-50 via-[#FFF7F9] to-amber-50/40 overflow-hidden">
      {/* Subtle floral ambient blobs */}
      <div className="pointer-events-none absolute -top-28 -left-28 w-80 h-80 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-28 w-96 h-96 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Back to storefront */}
        <div className="mb-5 flex items-center justify-between text-xs font-medium text-rose-700/80">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-rose-700 transition-colors"
          >
            <span>Back to MS Flowers Store</span>
          </Link>
          <span className="rounded-full bg-emerald-100/90 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
            JWT Protected Auth
          </span>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-white/95 backdrop-blur-md p-7 sm:p-8 shadow-xl shadow-rose-200/40">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-200 shadow-md shadow-rose-200/50 mb-3 bg-white p-0.5 flex items-center justify-center">
              <img
                src="/ms-logo.jpg"
                alt="MS Flowers Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h1
              className="text-2xl font-bold text-gray-900 tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              MS Flowers Admin
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to manage orders, blooms, cakes &amp; store leads
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400">
                  <MailIcon className="w-4 h-4" />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@msflowers.in"
                  autoComplete="email"
                  className="w-full rounded-xl border border-rose-200/80 bg-rose-50/30 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400">
                  <LockIcon className="w-4 h-4" />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-rose-200/80 bg-rose-50/30 pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Keep me signed in</span>
              </label>
              <span className="text-xs text-rose-600 font-medium">
                Kolkata Storefront
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-rose-300/50 hover:from-rose-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 disabled:opacity-60 transition-all cursor-pointer"
            >
              {submitting ? "Signing in..." : "Sign In to Admin Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
