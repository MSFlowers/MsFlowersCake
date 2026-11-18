import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchProductBySlug, fetchProducts } from "../../lib/db";
import CakeDetailClient from "./CakeDetailClient";

export const instant = false;

async function CakeResolver({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const all = await fetchProducts("Cakes");
  const related = all.filter((p) => p.id !== product.id).slice(0, 4);

  return <CakeDetailClient product={product} related={related} />;
}

export default function CakeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f7] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#c8102e] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CakeResolver params={params} />
    </Suspense>
  );
}
