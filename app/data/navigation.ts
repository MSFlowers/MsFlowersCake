export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export interface MainCategory {
  id: string;
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
        id: "flavours",
        title: "Popular Flavours",
        items: [
          { label: "Chocolate Truffle", href: "/cakes?category=chocolate", badge: "Bestseller" },
          { label: "Red Velvet", href: "/cakes?category=red-velvet" },
          { label: "Black Forest", href: "/cakes?category=black-forest" },
          { label: "Fresh Pineapple", href: "/cakes?category=fruit" },
          { label: "Butterscotch Crunch", href: "/cakes?category=fruit" },
          { label: "Seasonal Fresh Fruit", href: "/cakes?category=fruit" },
          { label: "Dark Chocolate Fantasy", href: "/cakes?category=chocolate" },
        ],
      },
      {
        id: "styles",
        title: "Styles & Types",
        items: [
          { label: "Bento Mini Cakes", href: "/cakes?category=bento", badge: "Trending" },
          { label: "Photo / Image Cakes", href: "/cakes?category=birthday" },
          { label: "Heart-Shaped Cakes", href: "/cakes?category=red-velvet" },
          { label: "Designer Fondant", href: "/cakes?category=birthday" },
          { label: "100% Pure Veg (Eggless)", href: "/cakes?category=all" },
          { label: "0.5 Kg / 1.0 Kg / 2 Kg+", href: "/cakes?category=all" },
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
        id: "flower-types",
        title: "Flower Varieties",
        items: [
          { label: "Dutch Red Roses", href: "/flowers?category=roses", badge: "Top Pick" },
          { label: "Pink & Yellow Roses", href: "/flowers?category=roses" },
          { label: "Exotic Purple Orchids", href: "/flowers?category=orchids" },
          { label: "Asiatic Lilies", href: "/flowers?category=lilies" },
          { label: "Carnations & Chrysanthemums", href: "/flowers?category=lilies" },
          { label: "Mixed Exotic Blooms", href: "/flowers?category=lilies" },
        ],
      },
      {
        id: "arrangements",
        title: "Arrangements & Occasions",
        items: [
          { label: "Hand-Tied Bouquets", href: "/flowers?category=roses" },
          { label: "Luxury Cylindrical Box", href: "/flowers?category=boxes", badge: "Premium" },
          { label: "Wicker Basket Flowers", href: "/flowers?category=lilies" },
          { label: "Heart-Shaped Rose Box", href: "/flowers?category=boxes" },
          { label: "Birthday & Romance Specials", href: "/flowers?category=roses" },
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
        id: "bestsellers",
        title: "Signature Combos",
        items: [
          { label: "Roses + Truffle Cake Combo", href: "/combos?category=roses-cake", badge: "Bestseller" },
          { label: "Cake + Fluffy Teddy Bear", href: "/combos?category=roses-cake" },
          { label: "Flowers + Cadbury Celebration", href: "/combos?category=roses-cake" },
          { label: "Orchids + Red Velvet Cake", href: "/combos?category=orchids-cake" },
        ],
      },
      {
        id: "deluxe",
        title: "Deluxe Celebration Hampers",
        items: [
          { label: "Midnight Surprise Combo (Cake+Flower+Candle)", href: "/combos?category=midnight", badge: "12 AM" },
          { label: "Grand Celebration Deluxe Hamper", href: "/combos?category=luxury-hamper" },
          { label: "Personalized Card + Combo Pack", href: "/combos?category=roses-cake" },
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
        id: "celebrations",
        title: "Special Celebrations",
        items: [
          { label: "Birthday Specials", href: "/cakes?category=birthday" },
          { label: "Anniversary & Romance", href: "/combos?category=roses-cake" },
          { label: "Congratulations & Promotion", href: "/flowers?category=orchids" },
          { label: "Get Well Soon & Best Wishes", href: "/flowers?category=lilies" },
        ],
      },
      {
        id: "festivals",
        title: "Kolkata & Seasonal Specials",
        items: [
          { label: "Durga Puja & Festive Sweets", href: "/combos?category=luxury-hamper" },
          { label: "New Year Celebrations", href: "/cakes?category=chocolate" },
          { label: "Valentine's Week Specials", href: "/combos?category=roses-cake" },
        ],
      },
    ],
  },
];
