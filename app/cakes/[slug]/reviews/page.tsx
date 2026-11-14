import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CAKE_PRODUCTS } from "../../../data/cakes";
import ProductAllReviewsClient from "../../../components/ProductAllReviewsClient";

export const instant = false;

export function generateStaticParams() {
  return CAKE_PRODUCTS.map((p) => ({
    slug: p.slug || p.id,
  }));
}

async function CakeReviewsResolver({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = CAKE_PRODUCTS.find(
    (p) => p.slug === slug || p.id === slug
  );

  if (!product) {
    notFound();
  }

  return (
    <ProductAllReviewsClient
      product={product}
      categoryPath="cakes"
      categoryLabel="Cakes"
    />
  );
}

export default function CakeAllReviewsPage({
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
      <CakeReviewsResolver params={params} />
    </Suspense>
  );
}
