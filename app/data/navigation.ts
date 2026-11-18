export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  dbId?: string;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
  source?: "sync-pill" | "sync-occasion" | "drawer-custom";
  rawGroupName?: string;
}

export interface MainCategory {
  id: string;
  dbId?: string;
  label: string;
  subtitle: string;
  href: string;
  imageSrc: string;
  tag?: string;
  highlight?: boolean;
  groups: NavGroup[];
}

export const NAVIGATION_CATEGORIES: MainCategory[] = [
  {
    id: "cakes",
    label: "Fresh Celebration Cakes",
    subtitle: "Truffle, Red Velvet, Bento & Eggless",
    href: "/cakes",
    imageSrc: "/categories/cakes-truffle.jpg",
    groups: [
      {
        id: "cakes-flavour-type",
        title: "Cakes by Flavour & Type",
        items: [
          { label: "Chocolate Truffle", href: "/cakes?category=chocolate", badge: "Bestseller" },
          { label: "Red Velvet", href: "/cakes?category=red-velvet" },
          { label: "Black Forest", href: "/cakes?category=black-forest" },
          { label: "Fresh Pineapple", href: "/cakes?category=fruit" },
          { label: "Butterscotch Crunch", href: "/cakes?category=fruit" },
          { label: "Seasonal Fresh Fruit", href: "/cakes?category=fruit" },
          { label: "Dark Chocolate Fantasy", href: "/cakes?category=chocolate" },
          { label: "Bento Mini Cakes", href: "/cakes?category=bento", badge: "Trending" },
          { label: "Heart-Shaped Cakes", href: "/cakes?category=red-velvet" },
          { label: "Designer Fondant", href: "/cakes?category=birthday" },
        ],
      },
      {
        id: "cakes-occasion",
        title: "Cakes by Occasion",
        items: [
          { label: "Birthday Celebrations", href: "/cakes?category=birthday", badge: "Bestseller" },
          { label: "Anniversary Romance", href: "/cakes?category=red-velvet" },
          { label: "Midnight 12 AM Surprise", href: "/cakes?category=chocolate" },
          { label: "Korean Bento Mini Cakes", href: "/cakes?category=bento", badge: "Trending" },
        ],
      },
      {
        id: "cakes-price",
        title: "Cakes by Price",
        items: [
          { label: "Under ₹599", href: "/cakes?price=under-599" },
          { label: "₹600 – ₹999", href: "/cakes?price=600-999" },
          { label: "Luxury Cakes ₹1,000+", href: "/cakes?price=above-1000" },
        ],
      },
      {
        id: "cakes-weight-dietary",
        title: "Cakes by Weight & Dietary",
        items: [
          { label: "100% Pure Veg (Eggless)", href: "/cakes" },
          { label: "90-Min Express Cakes", href: "/cakes?delivery=90-min" },
          { label: "0.5 Kg (Half Kg) Cakes", href: "/cakes" },
          { label: "1.0 Kg & Party Cakes", href: "/cakes" },
          { label: "12 AM Midnight Cakes", href: "/midnight" },
        ],
      },
    ],
  },
  {
    id: "flowers",
    label: "Fresh Handpicked Flowers",
    subtitle: "Dutch Roses, Orchids, Lilies & Bouquets",
    href: "/flowers",
    imageSrc: "/categories/flowers-bouquet.jpg",
    groups: [
      {
        id: "flowers-type",
        title: "Flowers by Type",
        items: [
          { label: "Dutch Red Roses", href: "/flowers?category=roses", badge: "Top Pick" },
          { label: "Exotic Purple Orchids", href: "/flowers?category=orchids" },
          { label: "Asiatic Lilies", href: "/flowers?category=lilies" },
          { label: "Luxury Rose Box", href: "/flowers?category=boxes", badge: "Premium" },
        ],
      },
      {
        id: "flowers-occasion",
        title: "Flowers by Occasion",
        items: [
          { label: "Birthday Blooms", href: "/flowers?category=lilies" },
          { label: "Proposal & Romance", href: "/flowers?category=roses", badge: "Bestseller" },
          { label: "Anniversary Elegance", href: "/flowers?category=boxes" },
          { label: "Congratulations & Wishes", href: "/flowers?category=orchids" },
        ],
      },
      {
        id: "flowers-price",
        title: "Flowers by Price",
        items: [
          { label: "Under ₹599", href: "/flowers?price=under-599" },
          { label: "₹600 – ₹999", href: "/flowers?price=600-999" },
          { label: "Luxury Blooms ₹1,000+", href: "/flowers?price=above-1000" },
        ],
      },
      {
        id: "flowers-delivery",
        title: "Flowers by Delivery",
        items: [
          { label: "90-Min Express Bouquets", href: "/flowers?delivery=90-min" },
          { label: "Same-Day Kolkata Delivery", href: "/same-day" },
          { label: "12 AM Midnight Surprise", href: "/midnight" },
        ],
      },
    ],
  },
  {
    id: "combos",
    label: "Curated Combos & Hampers",
    subtitle: "Bouquet + Cake, Teddy & Cadbury",
    href: "/combos",
    imageSrc: "/categories/combos-duo.jpg",
    groups: [
      {
        id: "combos-type",
        title: "Combos by Type",
        items: [
          { label: "Roses + Truffle Cake Combo", href: "/combos?category=roses-cake", badge: "Bestseller" },
          { label: "Red Velvet + Roses Combo", href: "/combos?category=roses-cake" },
          { label: "Orchids + Black Forest Combo", href: "/combos?category=orchids-cake" },
          { label: "Luxury Fruit Cake Hamper", href: "/combos?category=luxury-hamper", badge: "Premium" },
        ],
      },
      {
        id: "combos-occasion",
        title: "Combos by Occasion",
        items: [
          { label: "Birthday Celebration Duo", href: "/combos?category=orchids-cake" },
          { label: "Anniversary Romance", href: "/combos?category=roses-cake" },
          { label: "Midnight 12 AM Surprise", href: "/combos?category=midnight", badge: "12 AM" },
          { label: "Grand Luxury Gift Box", href: "/combos?category=luxury-hamper" },
        ],
      },
      {
        id: "combos-price",
        title: "Combos by Price",
        items: [
          { label: "Under ₹1,199", href: "/combos?price=under-1199" },
          { label: "Luxury Hampers ₹1,200+", href: "/combos?price=above-1200" },
        ],
      },
      {
        id: "combos-delivery",
        title: "Combos by Delivery",
        items: [
          { label: "90-Min Express Combos", href: "/combos?delivery=90-min" },
          { label: "Same-Day Kolkata Delivery", href: "/same-day" },
          { label: "12 AM Midnight Surprise", href: "/midnight" },
        ],
      },
    ],
  },
  {
    id: "occasions",
    label: "Shop by Occasion",
    subtitle: "Birthdays, Anniversaries & Festivals",
    href: "/combos",
    imageSrc: "/categories/anniversary-heart.jpg",
    groups: [
      {
        id: "occ-cakes",
        title: "Cake Celebrations",
        items: [
          { label: "Birthday Celebrations", href: "/cakes?category=birthday" },
          { label: "Anniversary Romance", href: "/cakes?category=red-velvet" },
          { label: "Midnight 12 AM Surprise", href: "/cakes?category=chocolate" },
          { label: "Korean Bento Mini Cakes", href: "/cakes?category=bento" },
        ],
      },
      {
        id: "occ-flowers",
        title: "Flower Celebrations",
        items: [
          { label: "Birthday Blooms", href: "/flowers?category=lilies" },
          { label: "Proposal & Romance", href: "/flowers?category=roses" },
          { label: "Anniversary Elegance", href: "/flowers?category=boxes" },
          { label: "Congratulations & Wishes", href: "/flowers?category=orchids" },
        ],
      },
      {
        id: "occ-combos",
        title: "Combo Celebrations",
        items: [
          { label: "Birthday Celebration Duo", href: "/combos?category=orchids-cake" },
          { label: "Anniversary Romance", href: "/combos?category=roses-cake" },
          { label: "Midnight 12 AM Surprise", href: "/combos?category=midnight" },
          { label: "Grand Luxury Gift Box", href: "/combos?category=luxury-hamper" },
        ],
      },
    ],
  },
];
