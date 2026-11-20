import { verifyJwt } from "@/app/lib/jwt";

/** True if the request carries a valid admin JWT (cookie or Bearer header). */
export function isAdminRequest(req: Request): boolean {
  let token = "";
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else {
    const m = (req.headers.get("cookie") || "").match(/ms_admin_jwt=([^;]+)/);
    if (m) token = m[1];
  }
  const payload = token ? verifyJwt(token) : null;
  return !!payload && payload.role === "admin";
}
