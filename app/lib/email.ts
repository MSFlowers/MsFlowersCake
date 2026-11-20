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

const DEFAULT_ORDER_NOTIFICATION_EMAIL = "rohit62952332@gmail.com";
const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmailList(raw?: string | null): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const part of String(raw).split(/[,;\n]+/)) {
    const cleaned = part.trim().toLowerCase();
    if (cleaned && BASIC_EMAIL_REGEX.test(cleaned) && !seen.has(cleaned)) {
      seen.add(cleaned);
      emails.push(cleaned);
    }
  }
  return emails;
}

function escapeHtml(val: unknown): string {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInr(amount: number): string {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
}

export interface AdminOrderNotificationItem {
  name: string;
  quantity?: number;
  qty?: number;
  price?: number;
  weight?: string;
  cakeMessage?: string;
  cardMessage?: string;
}

export interface AdminOrderNotificationData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  recipient_name?: string;
  recipient_phone?: string;
  delivery_address: string;
  area?: string;
  pincode?: string;
  delivery_date?: string;
  slot_label?: string;
  payment_method: string;
  payment_status: string;
  order_status?: string;
  items: AdminOrderNotificationItem[];
  items_subtotal?: number;
  slot_fee?: number;
  coupon_code?: string | null;
  coupon_discount?: number;
  total_amount: number;
  cake_message?: string | null;
  card_message?: string | null;
  delivery_note?: string | null;
  occasion?: string | null;
  razorpay_payment_id?: string | null;
}

async function getOrderNotificationConfig(): Promise<{
  enabled: boolean;
  recipients: string[];
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("store_settings")
      .select("order_notification_email, order_email_notifications_enabled, support_email")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data) {
      const enabled = data.order_email_notifications_enabled !== false;
      const fromSetting = parseEmailList(data.order_notification_email);
      if (fromSetting.length > 0) {
        return { enabled, recipients: fromSetting };
      }
      const fromEnv = parseEmailList(process.env.ADMIN_ORDER_EMAIL);
      if (fromEnv.length > 0) {
        return { enabled, recipients: fromEnv };
      }
      const fromSupport = parseEmailList(data.support_email);
      if (fromSupport.length > 0) {
        return { enabled, recipients: fromSupport };
      }
      return { enabled, recipients: [DEFAULT_ORDER_NOTIFICATION_EMAIL] };
    }
  } catch (err) {
    console.warn("Could not load order notification settings from DB, using fallback:", err);
  }

  const fromEnv = parseEmailList(process.env.ADMIN_ORDER_EMAIL);
  return {
    enabled: true,
    recipients: fromEnv.length > 0 ? fromEnv : [DEFAULT_ORDER_NOTIFICATION_EMAIL],
  };
}

/** Sends a new-order alert email to the configured admin email(s) via Brevo. */
export async function sendAdminOrderNotification(
  order: AdminOrderNotificationData,
  options?: { overrideRecipients?: string; isTest?: boolean }
): Promise<{ sent: boolean; skipped?: string; recipients?: string[] }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  let recipients: string[] = [];
  if (options?.overrideRecipients) {
    recipients = parseEmailList(options.overrideRecipients);
    if (recipients.length === 0) {
      throw new Error("Please enter at least one valid email address.");
    }
  } else {
    const cfg = await getOrderNotificationConfig();
    if (!cfg.enabled) {
      return { sent: false, skipped: "disabled" };
    }
    recipients = cfg.recipients;
  }

  const isPaid = String(order.payment_status || "").toLowerCase() === "paid";
  const badgeBg = isPaid ? "#dcfce7" : "#fef3c7";
  const badgeColor = isPaid ? "#166534" : "#92400e";
  const items = Array.isArray(order.items) ? order.items : [];

  const itemRowsHtml = items
    .map((it) => {
      const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
      const price = Number(it.price ?? 0) || 0;
      const metaParts: string[] = [];
      if (it.weight) metaParts.push(`Weight: ${escapeHtml(it.weight)}`);
      if (it.cakeMessage) metaParts.push(`Cake Msg: "${escapeHtml(it.cakeMessage)}"`);
      if (it.cardMessage) metaParts.push(`Card Msg: "${escapeHtml(it.cardMessage)}"`);
      const metaHtml = metaParts.length
        ? `<div style="font-size:12px;color:#6b7280;margin-top:3px">${metaParts.join(" &bull; ")}</div>`
        : "";
      return `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827">
          <strong>${escapeHtml(it.name || "Item")}</strong>${metaHtml}
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-align:center">${qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;text-align:right;white-space:nowrap">${formatInr(price * qty)}</td>
      </tr>`;
    })
    .join("");

  const notesParts: string[] = [];
  if (order.occasion) notesParts.push(`<strong>Occasion:</strong> ${escapeHtml(order.occasion)}`);
  if (order.cake_message) notesParts.push(`<strong>Cake Message:</strong> ${escapeHtml(order.cake_message)}`);
  if (order.card_message) notesParts.push(`<strong>Card Message:</strong> ${escapeHtml(order.card_message)}`);
  if (order.delivery_note) notesParts.push(`<strong>Delivery Note:</strong> ${escapeHtml(order.delivery_note)}`);

  const notesHtml = notesParts.length
    ? `<div style="margin-top:16px;padding:12px 14px;background:#fff1f2;border:1px solid #fecdd3;border-radius:8px;font-size:13px;color:#881337;line-height:1.6">
        ${notesParts.join("<br/>")}
      </div>`
    : "";

  const adminOrdersUrl = `${getSiteUrl()}/admin/dashboard?tab=orders`;
  const testPrefix = options?.isTest ? "[TEST] " : "";
  const subject = `${testPrefix}New Order ${order.order_number} (${formatInr(order.total_amount)}) - ${order.payment_status}`;

  const htmlContent = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #fce7f3;border-radius:14px;color:#111827">
    <div style="border-bottom:2px solid #ffe4e6;padding-bottom:16px;margin-bottom:18px">
      <div style="font-size:12px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#e11d48">MS Flowers &amp; Cakes</div>
      <h2 style="margin:6px 0 8px;font-size:20px;color:#111827">${testPrefix}New Order Received: ${escapeHtml(order.order_number)}</h2>
      <span style="display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:bold;background:${badgeBg};color:${badgeColor}">
        ${escapeHtml(order.payment_method)} &bull; ${escapeHtml(order.payment_status)}
      </span>
      <span style="display:inline-block;margin-left:8px;font-size:16px;font-weight:bold;color:#111827">
        ${formatInr(order.total_amount)}
      </span>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px">
      <tr>
        <td style="width:50%;vertical-align:top;padding:10px;background:#f9fafb;border-radius:8px">
          <div style="font-size:11px;font-weight:bold;text-transform:uppercase;color:#6b7280;margin-bottom:6px">Customer Details</div>
          <div><strong>${escapeHtml(order.customer_name)}</strong></div>
          <div style="margin-top:3px">Phone: ${escapeHtml(order.customer_phone)}</div>
          <div style="margin-top:3px">Email: ${escapeHtml(order.customer_email)}</div>
        </td>
        <td style="width:12px"></td>
        <td style="width:50%;vertical-align:top;padding:10px;background:#f9fafb;border-radius:8px">
          <div style="font-size:11px;font-weight:bold;text-transform:uppercase;color:#6b7280;margin-bottom:6px">Delivery Details</div>
          <div><strong>${escapeHtml(order.recipient_name || order.customer_name)}</strong> (${escapeHtml(order.recipient_phone || order.customer_phone)})</div>
          <div style="margin-top:3px">${escapeHtml(order.delivery_address)}${order.area ? `, ${escapeHtml(order.area)}` : ""}${order.pincode ? ` - ${escapeHtml(order.pincode)}` : ""}</div>
          <div style="margin-top:4px;color:#be123c;font-weight:bold">${escapeHtml(order.delivery_date || "")} ${order.slot_label ? `&bull; ${escapeHtml(order.slot_label)}` : ""}</div>
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-top:8px">
      <thead>
        <tr style="background:#fff1f2">
          <th style="padding:8px;text-align:left;font-size:12px;color:#9f1239">Item</th>
          <th style="padding:8px;text-align:center;font-size:12px;color:#9f1239">Qty</th>
          <th style="padding:8px;text-align:right;font-size:12px;color:#9f1239">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml || `<tr><td colspan="3" style="padding:10px 8px;font-size:13px;color:#6b7280">No item details</td></tr>`}
      </tbody>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:13px">
      ${order.items_subtotal ? `<tr><td style="padding:4px 8px;color:#6b7280">Items Subtotal</td><td style="padding:4px 8px;text-align:right">${formatInr(order.items_subtotal)}</td></tr>` : ""}
      ${order.slot_fee ? `<tr><td style="padding:4px 8px;color:#6b7280">Delivery / Slot Fee</td><td style="padding:4px 8px;text-align:right">${formatInr(order.slot_fee)}</td></tr>` : ""}
      ${order.coupon_discount ? `<tr><td style="padding:4px 8px;color:#059669">Coupon Discount${order.coupon_code ? ` (${escapeHtml(order.coupon_code)})` : ""}</td><td style="padding:4px 8px;text-align:right;color:#059669">-${formatInr(order.coupon_discount)}</td></tr>` : ""}
      <tr>
        <td style="padding:8px;font-size:15px;font-weight:bold;border-top:2px solid #f3f4f6">Grand Total</td>
        <td style="padding:8px;font-size:15px;font-weight:bold;text-align:right;border-top:2px solid #f3f4f6;color:#e11d48">${formatInr(order.total_amount)}</td>
      </tr>
    </table>

    ${order.razorpay_payment_id ? `<p style="font-size:12px;color:#6b7280;margin-top:10px">Razorpay Payment ID: <code>${escapeHtml(order.razorpay_payment_id)}</code></p>` : ""}
    ${notesHtml}

    <p style="text-align:center;margin:24px 0 8px">
      <a href="${adminOrdersUrl}" style="display:inline-block;background:#e11d48;color:#ffffff;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px">View Order in Admin Panel</a>
    </p>
    <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:14px">
      You are receiving this email because order alerts are enabled in MS Flowers Admin &rarr; Store Settings.
    </p>
  </div>`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "MsFlowersCake",
        email: process.env.BREVO_SENDER_EMAIL || "noreply@msflowersandcakes.in",
      },
      to: recipients.map((email) => ({ email })),
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Brevo order notification error:", res.status, txt);
    throw new Error(`Brevo API error (${res.status})`);
  }

  return { sent: true, recipients };
}
