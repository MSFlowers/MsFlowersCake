import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.SUPABASE_Secret_key ||
  "msflowers_jwt_secret_key_2026_super_secure";

/**
 * Edge-compatible cryptographic HMAC-SHA256 verification using native Web Crypto API
 */
async function verifyAdminJwtEdge(token: string): Promise<boolean> {
  try {
    if (!token || typeof token !== "string") return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Decode payload
    const binaryPayload = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(binaryPayload);

    // 2. Check expiration & role
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return false;
    if (payload.role !== "admin" && payload.email !== "admin@msflowers.in") {
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Server-side Protection for /admin pages (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("ms_admin_jwt")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isValid = await verifyAdminJwtEdge(token);
    if (!isValid) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("ms_admin_jwt");
      return res;
    }
  }

  // 2. Server-side Protection for /api/admin/* endpoints (except auth routes)
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const cookieToken = request.cookies.get("ms_admin_jwt")?.value;
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const token = cookieToken || bearerToken;

    if (!token || !(await verifyAdminJwtEdge(token))) {
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
