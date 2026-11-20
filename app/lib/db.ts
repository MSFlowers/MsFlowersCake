import { supabase } from "./supabase";
import { MainCategory, NavGroup, NavItem } from "../data/navigation";
import { Product } from "../data/types";

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  group_name: string | null;
  subtitle: string | null;
  image_url: string | null;
  banner_image_url: string | null;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
}

export interface DbProduct {
  id: string;
  slug: string;
  name: string;
  group_type: "Flowers" | "Cakes" | "Combos";
  category_id: string | null;
  sub_category_id: string | null;
  price: number;
  original_price: number | null;
  rating: number;
  reviews_count: number;
  delivery_tag: string;
  badge: string | null;
  tagline: string | null;
  description: string | null;
  image: string;
  images: string[];
  is_eggless: boolean;
  weight: string | null;
  specs: any;
  care_tips: string[];
  delivery_info: string[];
  stock: number;
  threshold: number;
  is_active: boolean;
  sort_order?: number;
  reviews?: any[] | null;
  is_midnight?: boolean;
  created_at?: string;
  variants?: any[] | null;
  color_galleries?: any[] | null;
  categories?: { slug: string; name: string } | null;
  sub_categories?: { slug: string; name: string } | null;
}

export interface PageFaqItem {
  q: string;
  a: string;
}

export interface PageConfig {
  heroTitle: string;
  heroDescription: string;
  promoPill: string;
  deliveryNote: string;
  badge1Label: string;
  badge1Value: string;
  badge2Label: string;
  badge2Value: string;
  occasionHeading: string;
  occasionSubheading: string;
  faqHeading: string;
  faqs: PageFaqItem[];
}

export const DEFAULT_PAGE_CONFIGS: Record<string, PageConfig> = {
  cakes: {
    heroTitle: "Freshly Baked Celebration Cakes",
    heroDescription:
      "Baked fresh on order at our Chingrighata central kitchen. 100% pure veg (eggless) available with free name piping & knife.",
    promoPill: "Use Code: CAKE15",
    deliveryNote: "45–90 Mins Delivery Across Kolkata",
    badge1Label: "Dietary Assurance",
    badge1Value: "100% Eggless Option",
    badge2Label: "Surprise Slot",
    badge2Value: "12 AM Midnight Guaranteed",
    occasionHeading: "Celebration Cakes For Every Occasion",
    occasionSubheading:
      "Select handcrafted artisanal cakes tailored for birthdays, anniversaries, and midnight surprises.",
    faqHeading: "Frequently Asked Questions about Cake Delivery in Kolkata",
    faqs: [
      {
        q: "Can I get midnight cake delivery at 12:00 AM in Kolkata?",
        a: "Yes! We specialize in 12 AM midnight cake deliveries across Kolkata including Salt Lake, New Town, Park Street, Ballygunge, Lake Town, and surrounding areas. Our riders deliver fresh cakes right at your doorstep between 11:30 PM to 12:00 AM.",
      },
      {
        q: "Are the cakes 100% eggless?",
        a: "Yes! All our celebration cakes can be prepared 100% eggless with pure vegetarian ingredients. You can also mention your preference while confirming on WhatsApp or in your order note.",
      },
      {
        q: "Can I customize the message or name on the cake?",
        a: "Absolutely! Free personalized message piping (e.g. 'Happy Birthday Rahul', 'Happy 10th Anniversary') plus complimentary candle and knife are provided with every order.",
      },
      {
        q: "How fast is express cake delivery in Kolkata?",
        a: "Our central bakery & florist hub is at Chingrighata (Salt Lake bypass). For nearby locations like Salt Lake, Sector V, New Town, and EM Bypass, we deliver in 45 to 60 minutes. Standard delivery across Kolkata takes 90 minutes.",
      },
    ],
  },
  flowers: {
    heroTitle: "Farm-Fresh Flowers Handpicked Daily",
    heroDescription:
      "Dispatched from our Chingrighata hub within 45–90 minutes. 100% bloom freshness guaranteed with complimentary greeting card.",
    promoPill: "Use Code: FRESH15",
    deliveryNote: "90-Min Express Across Kolkata",
    badge1Label: "Express Delivery",
    badge1Value: "45–90 Mins Hub Slot",
    badge2Label: "Surprise Timings",
    badge2Value: "12 AM Midnight Available",
    occasionHeading: "Timeless Flowers For Every Occasion",
    occasionSubheading:
      "Curated fresh flower arrangements styled for life's most meaningful celebrations.",
    faqHeading: "Frequently Asked Questions about Flower Delivery in Kolkata",
    faqs: [
      {
        q: "How fresh will the flowers be upon delivery in Kolkata?",
        a: "We procure fresh farm-cut blooms every morning directly at our Chingrighata florist hub. Every bouquet is hand-tied with moisture wrap at the stems just before dispatch so the flowers arrive crisp, fragrant, and vibrant.",
      },
      {
        q: "Can I get midnight flower delivery at 12:00 AM in Kolkata?",
        a: "Yes! We specialize in 12 AM midnight surprise flower deliveries across Kolkata including Salt Lake, New Town, Park Street, Ballygunge, Lake Town, Behala, and surrounding areas. Our riders deliver between 11:30 PM to 12:00 AM.",
      },
      {
        q: "Do you include a personalized greeting card with the flowers?",
        a: "Yes, every bouquet comes with a complimentary personalized message card. You can write your custom message during checkout or share it on WhatsApp, and our florists will handwrite or print it neatly.",
      },
      {
        q: "Can I order flowers and cake together for simultaneous delivery?",
        a: "Absolutely! We bake fresh celebration cakes and handcraft flower bouquets under one roof at our Chingrighata hub, so both your cake and flowers will arrive together in the same delivery slot without separate shipping charges.",
      },
    ],
  },
  combos: {
    heroTitle: "Curated Flower & Cake Combos",
    heroDescription:
      "Handcrafted fresh bouquets and artisanal celebration cakes dispatched together in one single slot across Kolkata within 45–90 minutes.",
    promoPill: "Use Code: COMBO15",
    deliveryNote: "Single-Slot Dispatch Across Kolkata",
    badge1Label: "Combined Delivery",
    badge1Value: "45–90 Mins One Rider",
    badge2Label: "Surprise Slot",
    badge2Value: "12 AM Midnight Guaranteed",
    occasionHeading: "Curated Combos For Every Celebration",
    occasionSubheading:
      "Double the happiness with paired flower arrangements, artisanal cakes, and greeting cards.",
    faqHeading: "Frequently Asked Questions about Combos in Kolkata",
    faqs: [
      {
        q: "Will the flowers and cake arrive together at the same time in Kolkata?",
        a: "Yes! Because our central kitchen and florist studio are under one roof at Chingrighata, Salt Lake, your bouquet and cake are packed and dispatched together with the same delivery rider in one single slot.",
      },
      {
        q: "Can I customize the cake flavor or flower colors in a combo?",
        a: "Absolutely! You can choose between Chocolate Truffle, Black Forest, Red Velvet, or Butterscotch, and specify flower preferences (red, pink, yellow roses) during checkout or via WhatsApp message.",
      },
      {
        q: "Do you include a free greeting card, candle, and knife?",
        a: "Yes, every combo comes complete with a personalized message card, complimentary celebration candle, and cake cutting knife at zero extra charge.",
      },
      {
        q: "Can I schedule 12:00 AM midnight delivery for combos in Kolkata?",
        a: "Yes, we specialize in midnight surprise deliveries across Salt Lake, New Town, Park Street, Ballygunge, Lake Town, and other Kolkata areas between 11:30 PM to 12:00 AM.",
      },
    ],
  },
};

export function getDefaultPageConfig(slug: string, label?: string): PageConfig {
  if (DEFAULT_PAGE_CONFIGS[slug]) {
    return {
      ...DEFAULT_PAGE_CONFIGS[slug],
      faqs: DEFAULT_PAGE_CONFIGS[slug].faqs.map((f) => ({ ...f })),
    };
  }
  const titleName = label || slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    heroTitle: `${titleName} Collection`,
    heroDescription:
      "Handcrafted fresh and dispatched from our Chingrighata hub across Kolkata within 45–90 minutes.",
    promoPill: "Use Code: MS15",
    deliveryNote: "45–90 Mins Delivery Across Kolkata",
    badge1Label: "Quality Assurance",
    badge1Value: "100% Fresh Handpicked",
    badge2Label: "Surprise Slot",
    badge2Value: "12 AM Midnight Available",
    occasionHeading: `${titleName} For Every Occasion`,
    occasionSubheading:
      "Select curated celebration picks tailored for birthdays, anniversaries, and special moments.",
    faqHeading: `Frequently Asked Questions about ${titleName} in Kolkata`,
    faqs: [
      {
        q: "How fast is delivery across Kolkata?",
        a: "We dispatch directly from our Chingrighata central hub in 45–90 minutes across Salt Lake, New Town, Park Street, and major Kolkata pin codes.",
      },
    ],
  };
}

export function getPageConfigFromCategories(
  allCategories: any[],
  pageSlug: string,
  pageLabel?: string
): { config: PageConfig; rowId: string | null } {
  const fallback = getDefaultPageConfig(pageSlug, pageLabel);
  if (!Array.isArray(allCategories) || allCategories.length === 0) {
    return { config: fallback, rowId: null };
  }
  const targetSlug = `page-config-${pageSlug}`;
  const row = allCategories.find(
    (c) => c.group_name === "page_config" && c.slug === targetSlug
  );
  if (!row) return { config: fallback, rowId: null };

  try {
    const parsed = row.subtitle ? JSON.parse(row.subtitle) : {};
    return {
      rowId: row.id || null,
      config: {
        ...fallback,
        ...parsed,
        faqs: Array.isArray(parsed.faqs)
          ? parsed.faqs.filter(
              (f: any) => f && (typeof f.q === "string" || typeof f.a === "string")
            )
          : fallback.faqs,
      },
    };
  } catch {
    return { config: fallback, rowId: row.id || null };
  }
}

// Transform flat categories into IGP-style multi-column Nav groups for Header.tsx
export function formatCategoriesForNav(
  allCategories: DbCategory[],
  options?: { includeEmptyGroups?: boolean }
): MainCategory[] {
  const rootCategories = allCategories
    .filter((c) => !c.parent_id && c.is_active && c.group_name !== "homepage_strip")
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const occasionsRoot = rootCategories.find((r) => r.slug === "occasions");
  const allOccasions = occasionsRoot
    ? allCategories
        .filter((c) => c.parent_id === occasionsRoot.id && c.is_active)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    : [];

  const toCakeOccasionItems = (): NavItem[] =>
    allOccasions
      .filter(
        (c) =>
          !c.group_name ||
          c.group_name === "Occasions" ||
          c.group_name === "Cakes Occasions"
      )
      .map((c) => {
        let tab = c.slug;
        if (c.slug.includes("birthday")) tab = "birthday";
        else if (c.slug.includes("anniversary")) tab = "red-velvet";
        else if (c.slug.includes("midnight")) tab = "chocolate";
        else if (c.slug.includes("bento")) tab = "bento";
        return {
          label: c.name,
          href: `/cakes?category=${tab}`,
          badge: c.badge || undefined,
          dbId: c.id,
        };
      });

  const toFlowerOccasionItems = (): NavItem[] =>
    allOccasions
      .filter((c) => c.group_name === "Flowers Occasions")
      .map((c) => {
        let tab = c.slug;
        if (c.slug.includes("birthday") || c.slug.includes("lilies")) tab = "asiatic-lilies";
        else if (c.slug.includes("romance") || c.slug.includes("roses")) tab = "dutch-red-roses";
        else if (c.slug.includes("anniversary") || c.slug.includes("box")) tab = "luxury-rose-box";
        else if (c.slug.includes("wishes") || c.slug.includes("orchid")) tab = "purple-orchids";
        return {
          label: c.name,
          href: `/flowers?category=${tab}`,
          badge: c.badge || undefined,
          dbId: c.id,
        };
      });

  const toComboOccasionItems = (): NavItem[] =>
    allOccasions
      .filter((c) => c.group_name === "Combos Occasions")
      .map((c) => {
        let tab = c.slug;
        if (c.slug.includes("birthday") || c.slug.includes("orchid")) tab = "orchids-blackforest-combo";
        else if (c.slug.includes("anniversary") || c.slug.includes("red-velvet")) tab = "red-velvet-roses-combo";
        else if (c.slug.includes("midnight") || c.slug.includes("truffle")) tab = "roses-truffle-combo";
        else if (c.slug.includes("luxury") || c.slug.includes("hamper")) tab = "luxury-fruit-hamper";
        return {
          label: c.name,
          href: `/combos?category=${tab}`,
          badge: c.badge || undefined,
          dbId: c.id,
        };
      });

  const toDynamicOccasionItems = (rootSlug: string, defaultHref: string): NavItem[] =>
    allOccasions
      .filter((c) => c.group_name === `${rootSlug} Occasions`)
      .map((c) => ({
        label: c.name,
        href: `${defaultHref}?category=${c.slug}`,
        badge: c.badge || undefined,
        dbId: c.id,
      }));

  const buildDrawerCustomGroups = (
    drawerRows: DbCategory[],
    defaultHref: string
  ): NavGroup[] => {
    const gMap = new Map<string, NavItem[]>();
    for (const row of drawerRows) {
      const raw = row.group_name || "drawer:More";
      if (!gMap.has(raw)) gMap.set(raw, []);
      gMap.get(raw)!.push({
        label: row.name,
        href: row.subtitle || defaultHref,
        badge: row.badge || undefined,
        dbId: row.id,
      });
    }
    return Array.from(gMap.entries()).map(([rawGroupName, items], idx) => {
      const title = rawGroupName.replace(/^drawer:/, "").trim() || "More";
      const slugPart = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      return {
        id: `drawer-${slugPart || idx}`,
        title,
        items,
        source: "drawer-custom" as const,
        rawGroupName,
      };
    });
  };

  return rootCategories.map((root) => {
    const allChildren = allCategories
      .filter((c) => c.parent_id === root.id && c.is_active)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const pillChildren = allChildren.filter(
      (c) => !c.group_name?.startsWith("drawer:") && c.group_name !== "page_config"
    );
    const drawerChildren = allChildren.filter((c) =>
      Boolean(c.group_name?.startsWith("drawer:"))
    );

    const rootHref =
      root.slug === "occasions"
        ? "/combos"
        : root.banner_image_url || `/${root.slug}`;

    const customDrawerGroups = buildDrawerCustomGroups(drawerChildren, rootHref);

    let groups: NavGroup[] = [];

    if (root.slug === "cakes") {
      const cakeOccasions = toCakeOccasionItems();
      const defaultCustom: NavGroup[] = [
        {
          id: "cakes-price",
          title: "Cakes by Price",
          source: "drawer-custom",
          rawGroupName: "drawer:Cakes by Price",
          items: [
            { label: "Under ₹599", href: "/cakes?price=under-599" },
            { label: "₹600 – ₹999", href: "/cakes?price=600-999" },
            { label: "Luxury Cakes ₹1,000+", href: "/cakes?price=above-1000" },
          ],
        },
        {
          id: "cakes-weight-dietary",
          title: "Cakes by Weight & Dietary",
          source: "drawer-custom",
          rawGroupName: "drawer:Cakes by Weight & Dietary",
          items: [
            { label: "100% Pure Veg (Eggless)", href: "/cakes" },
            { label: "90-Min Express Cakes", href: "/cakes?delivery=90-min" },
            { label: "0.5 Kg (Half Kg) Cakes", href: "/cakes" },
            { label: "1.0 Kg & Party Cakes", href: "/cakes" },
            { label: "12 AM Midnight Cakes", href: "/midnight" },
          ],
        },
      ];
      groups = [
        {
          id: "cakes-flavour-type",
          title: "Cakes by Flavour & Type",
          source: "sync-pill",
          items: pillChildren.map((c) => ({
            label: c.name,
            href: `/cakes?category=${c.slug}`,
            badge: c.badge || undefined,
            dbId: c.id,
          })),
        },
        ...(cakeOccasions.length > 0 || options?.includeEmptyGroups
          ? [
              {
                id: "cakes-occasion",
                title: "Cakes by Occasion",
                source: "sync-occasion" as const,
                items: cakeOccasions,
              },
            ]
          : []),
        ...(customDrawerGroups.length > 0 ? customDrawerGroups : defaultCustom),
      ];
    } else if (root.slug === "flowers") {
      const flowerOccasions = toFlowerOccasionItems();
      const defaultCustom: NavGroup[] = [
        {
          id: "flowers-price",
          title: "Flowers by Price",
          source: "drawer-custom",
          rawGroupName: "drawer:Flowers by Price",
          items: [
            { label: "Under ₹599", href: "/flowers?price=under-599" },
            { label: "₹600 – ₹999", href: "/flowers?price=600-999" },
            { label: "Luxury Blooms ₹1,000+", href: "/flowers?price=above-1000" },
          ],
        },
        {
          id: "flowers-delivery",
          title: "Flowers by Delivery",
          source: "drawer-custom",
          rawGroupName: "drawer:Flowers by Delivery",
          items: [
            { label: "90-Min Express Bouquets", href: "/flowers?delivery=90-min" },
            { label: "Same-Day Kolkata Delivery", href: "/same-day" },
            { label: "12 AM Midnight Surprise", href: "/midnight" },
          ],
        },
      ];
      groups = [
        {
          id: "flowers-type",
          title: "Flowers by Type",
          source: "sync-pill",
          items: pillChildren.map((c) => ({
            label: c.name,
            href: `/flowers?category=${c.slug}`,
            badge: c.badge || undefined,
            dbId: c.id,
          })),
        },
        ...(flowerOccasions.length > 0 || options?.includeEmptyGroups
          ? [
              {
                id: "flowers-occasion",
                title: "Flowers by Occasion",
                source: "sync-occasion" as const,
                items: flowerOccasions,
              },
            ]
          : []),
        ...(customDrawerGroups.length > 0 ? customDrawerGroups : defaultCustom),
      ];
    } else if (root.slug === "combos") {
      const comboOccasions = toComboOccasionItems();
      const defaultCustom: NavGroup[] = [
        {
          id: "combos-price",
          title: "Combos by Price",
          source: "drawer-custom",
          rawGroupName: "drawer:Combos by Price",
          items: [
            { label: "Under ₹1,199", href: "/combos?price=under-1199" },
            { label: "Luxury Hampers ₹1,200+", href: "/combos?price=above-1200" },
          ],
        },
        {
          id: "combos-delivery",
          title: "Combos by Delivery",
          source: "drawer-custom",
          rawGroupName: "drawer:Combos by Delivery",
          items: [
            { label: "90-Min Express Combos", href: "/combos?delivery=90-min" },
            { label: "Same-Day Kolkata Delivery", href: "/same-day" },
            { label: "12 AM Midnight Surprise", href: "/midnight" },
          ],
        },
      ];
      groups = [
        {
          id: "combos-type",
          title: "Combos by Type",
          source: "sync-pill",
          items: pillChildren.map((c) => ({
            label: c.name,
            href: `/combos?category=${c.slug}`,
            badge: c.badge || undefined,
            dbId: c.id,
          })),
        },
        ...(comboOccasions.length > 0 || options?.includeEmptyGroups
          ? [
              {
                id: "combos-occasion",
                title: "Combos by Occasion",
                source: "sync-occasion" as const,
                items: comboOccasions,
              },
            ]
          : []),
        ...(customDrawerGroups.length > 0 ? customDrawerGroups : defaultCustom),
      ];
    } else if (root.slug === "occasions") {
      const cakeOcc = toCakeOccasionItems();
      const flowerOcc = toFlowerOccasionItems();
      const comboOcc = toComboOccasionItems();
      groups = [
        ...(cakeOcc.length > 0 || options?.includeEmptyGroups
          ? [{ id: "occ-cakes", title: "Cake Celebrations", source: "sync-occasion" as const, items: cakeOcc }]
          : []),
        ...(flowerOcc.length > 0 || options?.includeEmptyGroups
          ? [{ id: "occ-flowers", title: "Flower Celebrations", source: "sync-occasion" as const, items: flowerOcc }]
          : []),
        ...(comboOcc.length > 0 || options?.includeEmptyGroups
          ? [{ id: "occ-combos", title: "Combo Celebrations", source: "sync-occasion" as const, items: comboOcc }]
          : []),
        ...customDrawerGroups,
      ];
    } else {
      const dynOcc = toDynamicOccasionItems(root.slug, rootHref);
      groups = [
        {
          id: `${root.slug}-type`,
          title: `${root.name} by Type`,
          source: "sync-pill",
          items: pillChildren.map((c) => ({
            label: c.name,
            href: `${rootHref}?category=${c.slug}`,
            badge: c.badge || undefined,
            dbId: c.id,
          })),
        },
        ...(dynOcc.length > 0 || options?.includeEmptyGroups
          ? [
              {
                id: `${root.slug}-occasion`,
                title: `${root.name} by Occasion`,
                source: "sync-occasion" as const,
                items: dynOcc,
              },
            ]
          : []),
        ...customDrawerGroups,
      ];
    }

    return {
      id: root.slug,
      dbId: root.id,
      label: root.name,
      subtitle: root.subtitle || "",
      href: rootHref,
      imageSrc: root.image_url || `/categories/${root.slug}-default.jpg`,
      tag: root.badge || undefined,
      groups: options?.includeEmptyGroups
        ? groups
        : groups.filter((g) => g.items.length > 0),
    };
  });
}

// Convert DbProduct to frontend Product shape
export function formatDbProduct(p: DbProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.sub_categories?.slug || p.categories?.slug || "all",
    group: p.group_type,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : Number(p.price),
    rating: Number(p.rating) || 5.0,
    reviewsCount: p.reviews_count || 0,
    deliveryTag: p.delivery_tag || "90-Min Delivery",
    badge: p.badge || undefined,
    image: p.image,
    images: p.images && p.images.length > 0 ? p.images : [p.image],
    description: p.description || "",
    tagline: p.tagline || undefined,
    specs: p.specs || {},
    careTips: p.care_tips || [],
    deliveryInfo: p.delivery_info || [],
    isEggless: p.is_eggless,
    weight: p.weight || undefined,
    reviews: Array.isArray(p.reviews) ? p.reviews : [],
    isMidnight: Boolean(p.is_midnight),
    stock: p.stock,
    variants: Array.isArray(p.variants) ? p.variants : [],
    colorGalleries: Array.isArray(p.color_galleries) ? p.color_galleries : [],
  };
}

// Fetch all active categories
export async function fetchAllCategories(): Promise<DbCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data || [];
}

// Fetch subcategories for pill tabs on a specific section (/cakes, /flowers, /combos)
export async function fetchPillTabsForSection(rootSlug: string): Promise<{ id: string; label: string }[]> {
  const all = await fetchAllCategories();
  const root = all.find((c) => c.slug === rootSlug && !c.parent_id);
  if (!root) return [{ id: "all", label: `All ${rootSlug.charAt(0).toUpperCase() + rootSlug.slice(1)}` }];

  const children = all.filter(
    (c) =>
      c.parent_id === root.id &&
      c.is_active &&
      !c.group_name?.startsWith("drawer:") &&
      c.group_name !== "page_config"
  );

  return [
    { id: "all", label: `All ${root.name.split(" ").slice(-1)[0]}` },
    ...children.map((c) => ({
      id: c.slug,
      label: c.name,
    })),
  ];
}

// Fetch featured occasion cards
export async function fetchOccasionCards(rootSlug?: string) {
  const all = await fetchAllCategories();
  return all
    .filter((c) => c.is_featured && c.is_active)
    .map((c) => ({
      id: c.slug,
      title: c.name,
      subtitle: c.subtitle || "",
      tag: c.badge || undefined,
      image: c.image_url || "/categories/birthday-cake.jpg",
      categoryTab: c.slug,
    }));
}

export const PRODUCT_SELECT =
  "*, categories:category_id(slug,name), sub_categories:sub_category_id(slug,name)";

// Fetch active products for a group (or all groups when omitted)
export async function fetchProducts(
  group?: "Flowers" | "Cakes" | "Combos"
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (group) query = query.eq("group_type", group);

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return ((data as unknown as DbProduct[]) || []).map(formatDbProduct);
}

export const fetchProductsByGroup = fetchProducts;

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return formatDbProduct(data as unknown as DbProduct);
}
