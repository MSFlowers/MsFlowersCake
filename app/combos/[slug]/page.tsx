import { Suspense } from "react";
import { notFound } from "next/navigation";
import { COMBO_PRODUCTS } from "../../data/combos";
import ComboDetailClient from "./ComboDetailClient";

export const instant = false;

export function generateStaticParams() {
  return COMBO_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

async function ComboResolver({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = COMBO_PRODUCTS.find(
    (p) => p.slug === slug || p.id === slug
  );

  if (!product) {
    notFound();
  }

  return <ComboDetailClient product={product} />;
}

export default function ComboDetailPage({
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
      <ComboResolver params={params} />
    </Suspense>
  );
}
