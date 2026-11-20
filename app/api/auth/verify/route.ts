import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { hashToken, getSiteUrl } from "@/app/lib/email";

export async function GET(req: Request) {
  const base = getSiteUrl(req);
  const fail = () => NextResponse.redirect(`${base}/login?verify_error=1`);
  try {
    const token = new URL(req.url).searchParams.get("token") || "";
    if (!/^[a-f0-9]{64}$/.test(token)) return fail();

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, verification_expires_at")
      .eq("verification_token_hash", hashToken(token))
      .maybeSingle();

    if (!customer) return fail();
    if (
      !customer.verification_expires_at ||
      new Date(customer.verification_expires_at).getTime() < Date.now()
    ) {
      return fail();
    }

    const { error } = await supabaseAdmin
      .from("customers")
      .update({
        email_verified: true,
        verification_token_hash: null,
        verification_expires_at: null,
      })
      .eq("id", customer.id);
    if (error) return fail();

    return NextResponse.redirect(`${base}/login?verified=1`);
  } catch (e: any) {
    if (e?.digest?.startsWith("NEXT_")) {
      throw e;
    }
    console.error("Verify error:", e);
    return fail();
  }
}
