"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CustomerUser,
  fetchCurrentCustomer,
  getStoredCustomer,
  logoutCustomer,
  saveCustomerSession,
} from "@/app/lib/customerAuth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  // Tab: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified")) {
      setSuccessMsg("Email verified successfully! You can now sign in.");
    } else if (searchParams.get("verify_error")) {
      setErrorMsg("Verification link is invalid or expired. Enter your email and request a new one.");
      setNeedsVerify(true);
    }
  }, [searchParams]);

  // Existing auth user state
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if already logged in via JWT
  useEffect(() => {
    const localUser = getStoredCustomer();
    if (localUser) {
      setCurrentUser(localUser);
    }

    fetchCurrentCustomer().then((user) => {
      setCurrentUser(user);
      setCheckingSession(false);
    });

    function handleAuthChange() {
      setCurrentUser(getStoredCustomer());
    }

    window.addEventListener("ms_customer_auth_change", handleAuthChange);
    return () => {
      window.removeEventListener("ms_customer_auth_change", handleAuthChange);
    };
  }, []);

  // Handle Sign In (JWT API)
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") setNeedsVerify(true);
        throw new Error(data.error || "Failed to sign in");
      }

      saveCustomerSession(data.user, data.token);
      setSuccessMsg("Welcome back! Signing you in...");

      setTimeout(() => {
        router.push(redirectUrl);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Sign Up (JWT Register API)
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setSuccessMsg(
        data.message ||
          "Account created! Please check your email and click the verification link."
      );
      setNeedsVerify(true);
      setPassword("");
      setConfirmPassword("");
      setActiveTab("signin");
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.includes("@")) {
      setErrorMsg("Enter your email above first.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not resend email");
      setSuccessMsg("Verification email sent. Please check your inbox (and spam).");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle Sign Out
  async function handleSignOut() {
    setLoading(true);
    await logoutCustomer();
    setCurrentUser(null);
    setLoading(false);
    setSuccessMsg("Logged out successfully.");
  }

  return (
    <div className="min-h-[85vh] relative flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#FFF5F7] via-[#FCF9F9] to-[#FFF0F2]">
      {/* Soft floral background decorative elements */}
      <div className="pointer-events-none absolute top-10 left-10 w-72 h-72 rounded-full bg-rose-200/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 w-80 h-80 rounded-full bg-pink-300/25 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Top Navigation */}
        <div className="mb-4 flex items-center justify-between text-xs font-medium text-zinc-600">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-[#c8102e] transition-colors"
          >
            <span>Back to Flowers &amp; Cakes</span>
          </Link>
          <span className="rounded-full bg-rose-100/90 text-rose-800 px-2.5 py-0.5 text-[11px] font-semibold">
            MS Customer Portal
          </span>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl border border-rose-100 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-rose-200/40">
          {/* Header Branding with MS Flowers Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <Link
              href="/"
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-lg shadow-rose-200/80 border-2 border-rose-200 mb-3 bg-white block hover:scale-105 transition-transform"
              style={{ position: "relative", width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden" }}
            >
              <Image
                src="/ms-logo.jpg"
                alt="MS Flowers & Cakes Logo"
                width={80}
                height={80}
                className="w-full h-full object-cover rounded-full"
                priority
              />
            </Link>
            <h1
              className="text-2xl font-bold text-gray-900 tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              MS Flowers &amp; Cakes
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xs">
              Handcrafted Blooms, Freshly Baked Cakes &amp; 90-Min Express Across Kolkata
            </p>
          </div>

          {/* If already logged in */}
          {currentUser && !checkingSession ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-[#c8102e] flex items-center justify-center mx-auto mb-3 font-bold text-xl border-2 border-rose-300">
                {(currentUser.name?.[0] || currentUser.email?.[0] || "U").toUpperCase()}
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Welcome, {currentUser.name}!
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{currentUser.email}</p>
              {currentUser.phone && (
                <p className="text-xs text-gray-400 mt-0.5">{currentUser.phone}</p>
              )}

              <div className="mt-6 flex flex-col gap-2.5">
                <Link
                  href="/"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#c8102e] hover:bg-[#a60d26] text-white font-semibold text-sm transition-all shadow-md shadow-rose-300/40"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/wishlist"
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-800 font-semibold text-sm transition-all"
                >
                  View My Wishlist
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-xs transition-all cursor-pointer mt-1"
                >
                  {loading ? "Signing out..." : "Sign Out of Account"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs: Sign In / Create Account */}
              <div className="grid grid-cols-2 p-1 bg-rose-50/80 rounded-2xl mb-5 border border-rose-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signin");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "signin"
                      ? "bg-white text-[#c8102e] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "signup"
                      ? "bg-white text-[#c8102e] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Feedback Toasts */}
              {errorMsg && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
                  <span className="text-sm leading-none font-bold">!</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
                  <span className="text-sm leading-none font-bold">&#10003;</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {needsVerify && activeTab === "signin" && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="mb-3 w-full text-xs font-semibold text-[#c8102e] underline cursor-pointer disabled:opacity-60"
                >
                  Resend verification email
                </button>
              )}

              {/* 1. Sign In Form */}
              {activeTab === "signin" && (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. priya@gmail.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-transparent bg-white/90"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">Password</label>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-transparent bg-white/90 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#c8102e] hover:bg-[#a60d26] text-white font-semibold text-sm transition-all shadow-md shadow-rose-300/40 disabled:opacity-60 cursor-pointer mt-2"
                  >
                    {loading ? "Signing in..." : "Sign In to MS Flowers"}
                  </button>
                </form>
              )}

              {/* 2. Create Account Form */}
              {activeTab === "signup" && (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ananya Sen"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-transparent bg-white/90"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ananya@gmail.com"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-transparent bg-white/90"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      WhatsApp / Phone (for delivery updates)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9830012345"
                      className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-transparent bg-white/90"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-transparent bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Confirm *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-transparent bg-white/90"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 pt-0.5">
                    By registering, you agree to receive order status updates on your email &amp; WhatsApp.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#c8102e] hover:bg-[#a60d26] text-white font-semibold text-sm transition-all shadow-md shadow-rose-300/40 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? "Creating Account..." : "Create My Account"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Trust Badges */}
          <div className="mt-6 pt-5 border-t border-rose-100 grid grid-cols-3 gap-2 text-center text-[10px] text-gray-500 font-medium">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[#c8102e] font-bold text-xs">&#10003;</span>
              <span>100% Safe &amp; Secure</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[#c8102e] font-bold text-xs">&#9889;</span>
              <span>Fast Express Checkout</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[#c8102e] font-bold text-xs">&#9733;</span>
              <span>Live Order Updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-[#c8102e] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
