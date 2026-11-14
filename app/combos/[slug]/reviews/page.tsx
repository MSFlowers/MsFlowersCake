import { Suspense } from "react";
import { notFound } from "next/navigation";
import { COMBO_PRODUCTS } from "../../../data/combos";
import ProductAllReviewsClient from "../../../components/ProductAllReviewsClient";

export const instant = false;

export function generateStaticParams() {
  return COMBO_PRODUCTS.map((p) => ({
    slug: p.slug || p.id,
  }));
}

async function ComboReviewsResolver({
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

  return (
    <ProductAllReviewsClient
      product={product}
      categoryPath="combos"
      categoryLabel="Combos"
    />
  );
}

export default function ComboAllReviewsPage({
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
      <ComboReviewsResolver params={params} />
    </Suspense>
  );
}
