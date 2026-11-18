import crypto from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.SUPABASE_Secret_key ||
  "msflowers_jwt_secret_key_2026_super_secure";

export interface JwtUserPayload {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  exp?: number;
  iat?: number;
}

/**
 * Standard RFC 7519 HMAC-SHA256 (HS256) JWT Signer
 */
export function signJwt(
  payload: Omit<JwtUserPayload, "exp" | "iat">,
  expiresInSeconds: number = 7 * 24 * 3600
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtUserPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies standard HS256 JWT and returns payload if valid
 */
export function verifyJwt(token: string): JwtUserPayload | null {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const payloadText = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadText) as JwtUserPayload;

    // Check expiration
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Secure password hashing with unique random salt using PBKDF2 (SHA-512)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify plaintext password against stored salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes(":")) return false;
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;

    const computedHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(originalHash, "hex")
    );
  } catch {
    return false;
  }
}
