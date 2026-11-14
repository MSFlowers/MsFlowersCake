import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FLOWER_PRODUCTS } from "../../data/flowers";
import FlowerDetailClient from "./FlowerDetailClient";

export const instant = false;

export function generateStaticParams() {
  return FLOWER_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

async function ProductResolver({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = FLOWER_PRODUCTS.find(
    (p) => p.slug === slug || p.id === slug
  );

  if (!product) {
    notFound();
  }

  return <FlowerDetailClient product={product} />;
}

export default function FlowerDetailPage({
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
      <ProductResolver params={params} />
    </Suspense>
  );
}
