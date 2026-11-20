import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "";

/**
 * Cryptographic HMAC-SHA256 verification using native Web Crypto API
 */
async function verifyAdminJwt(token: string): Promise<boolean> {
  try {
    if (!token || typeof token !== "string" || JWT_SECRET.length < 16) return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Decode payload
    const binaryPayload = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(binaryPayload);

    // 2. Check expiration & role
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return false;
    if (payload.role !== "admin") {
      return false;
    }

    // 3. Cryptographically verify signature using Web Crypto HMAC-SHA256
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const binarySig = atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const dataBytes = enc.encode(`${headerB64}.${payloadB64}`);
    return await crypto.subtle.verify("HMAC", key, sigBytes, dataBytes);
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. If already logged in, redirect /admin/login to dashboard or target tab
  if (pathname === "/admin/login") {
    const token = request.cookies.get("ms_admin_jwt")?.value;
    if (token && (await verifyAdminJwt(token))) {
      const fromParam = request.nextUrl.searchParams.get("from");
      const dest = fromParam && fromParam.startsWith("/admin") && fromParam !== "/admin/login"
        ? fromParam
        : "/admin/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  // 2. Server-side Protection for /admin pages (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("ms_admin_jwt")?.value;
    const fullFrom = request.nextUrl.pathname + request.nextUrl.search;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", fullFrom);
      return NextResponse.redirect(loginUrl);
    }

    const isValid = await verifyAdminJwt(token);
    if (!isValid) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", fullFrom);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("ms_admin_jwt");
      return res;
    }

    // Direct section URLs like /admin/orders or /admin/products -> redirect to /admin/dashboard?tab=<section>
    const sectionMatch = pathname.match(/^\/admin\/([a-zA-Z0-9_-]+)\/?$/);
    if (sectionMatch) {
      const section = sectionMatch[1];
      if (section !== "login" && section !== "dashboard") {
        const destUrl = new URL("/admin/dashboard", request.url);
        destUrl.searchParams.set("tab", section);
        return NextResponse.redirect(destUrl);
      }
    }

    // /admin or /admin/ -> redirect to /admin/dashboard (preserving any query params)
    if (pathname === "/admin" || pathname === "/admin/") {
      const destUrl = new URL("/admin/dashboard", request.url);
      request.nextUrl.searchParams.forEach((val, key) => {
        destUrl.searchParams.set(key, val);
      });
      return NextResponse.redirect(destUrl);
    }
  }

  // 3. Server-side Protection for /api/admin/* endpoints (except auth routes)
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const cookieToken = request.cookies.get("ms_admin_jwt")?.value;
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const token = cookieToken || bearerToken;

    if (!token || !(await verifyAdminJwt(token))) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid or missing administrator JWT token.",
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
