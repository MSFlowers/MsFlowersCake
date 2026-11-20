import { createOrder } from "@/app/lib/createOrder";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return await createOrder(body, false);
  } catch (err: any) {
    return Response.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
