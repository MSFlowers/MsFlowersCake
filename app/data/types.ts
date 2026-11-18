export interface ProductSpecs {
  stemCount?: string;
  flowers?: string[];
  fillers?: string;
  packaging?: string;
  ribbon?: string;
  height?: string;
  flavour?: string;
  type?: string;
  weight?: string;
  [key: string]: unknown;
}

export interface ProductReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  threshold: number;
  sku?: string;
}

export interface ColorGallery {
  id: string;
  colorName: string;
  colorCode: string;
  images: string[];
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  /** Sub-category slug (e.g. "roses"), falls back to root category slug */
  category: string;
  group?: "Flowers" | "Cakes" | "Combos";
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  deliveryTag: string;
  badge?: string;
  image: string;
  images?: string[];
  description: string;
  tagline?: string;
  specs?: ProductSpecs;
  careTips?: string[];
  deliveryInfo?: string[];
  reviews?: ProductReview[];
  isEggless?: boolean;
  isMidnight?: boolean;
  weight?: string;
  stock?: number;
  variants?: ProductVariant[];
  colorGalleries?: ColorGallery[];
}

export interface CategoryTab {
  id: string;
  label: string;
  count?: number;
  image?: string | null;
  badge?: string | null;
}
