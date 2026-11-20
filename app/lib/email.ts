import crypto from "crypto";
import { supabaseAdmin } from "@/app/lib/supabase";

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getSiteUrl(req?: Request) {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  if (req) return new URL(req.url).origin;
  return "http://localhost:3000";
}

/** Creates a fresh token for a customer, stores its hash, and emails the link via Brevo. */
export async function sendVerificationEmail(
  customer: { id: string; name: string; email: string },
  req?: Request
) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY is not configured");

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

  const { error: upErr } = await supabaseAdmin
    .from("customers")
    .update({ verification_token_hash: hashToken(token), verification_expires_at: expires })
    .eq("id", customer.id);
  if (upErr) throw new Error("Failed to save verification token: " + upErr.message);

  const link = `${getSiteUrl(req)}/api/auth/verify?token=${token}`;
  const safeName = customer.name.replace(/[<>&"]/g, "");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "MsFlowersCake",
        email: process.env.BREVO_SENDER_EMAIL || "noreply@msflowersandcakes.in",
      },
      to: [{ email: customer.email, name: safeName }],
      subject: "Verify your email - MS Flowers & Cakes",
      htmlContent: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #fde2e6;border-radius:12px">
        <h2 style="color:#c8102e;margin-top:0">MS Flowers &amp; Cakes</h2>
        <p>Hi ${safeName},</p>
        <p>Thanks for registering! Please verify your email address to activate your account.</p>
        <p style="text-align:center;margin:28px 0"><a href="${link}" style="background:#c8102e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Verify Email</a></p>
        <p style="font-size:12px;color:#666">This link expires in 24 hours. If the button doesn't work, copy this link:<br>${link}</p>
        <p style="font-size:12px;color:#999">If you didn't create this account, you can ignore this email.</p></div>`,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Brevo error:", res.status, txt);
    throw new Error("Failed to send verification email");
  }
}
