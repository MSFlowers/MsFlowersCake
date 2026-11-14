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
}

export interface ProductReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  category: string;
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
  weight?: string;
}

export const FLOWER_CATEGORIES = [
  { id: "all", label: "All Flowers", count: 8 },
  { id: "roses", label: "Red Roses", count: 3 },
  { id: "lilies", label: "Lilies & Carnations", count: 2 },
  { id: "orchids", label: "Purple Orchids", count: 1 },
  { id: "boxes", label: "Luxury Flower Boxes", count: 2 },
];

export const FLOWER_PRODUCTS: Product[] = [
  {
    id: "fl-1",
    slug: "romantic-10-red-roses-bouquet",
    name: "Romantic 10 Red Roses Bouquet",
    category: "roses",
    price: 549,
    originalPrice: 649,
    rating: 4.9,
    reviewsCount: 142,
    deliveryTag: "90-Min Delivery",
    badge: "BESTSELLER",
    image: "/products/flowers/red-roses-bouquet.jpg",
    images: [
      "/products/flowers/red-roses-bouquet.jpg",
      "/products/flowers/red-roses-bouquet-macro.jpg",
      "/products/flowers/red-roses-bouquet-ribbon.jpg",
      "/products/flowers/red-roses-bouquet-crown.jpg",
    ],
    tagline: "Speak the language of love with ten hand-picked velvet Dutch roses wrapped to perfection.",
    description: "10 freshly picked Dutch red roses wrapped in blush pink waterproof paper with delicate baby's breath and a crimson satin ribbon.",
    specs: {
      stemCount: "10 Stems + Fillers",
      flowers: ["10 Fresh Dutch Red Roses"],
      fillers: "White Gypsophila (Baby's Breath) & Asparagus Greens",
      packaging: "Two-layer Premium Blush Pink Waterproof Matte Wrap",
      ribbon: "Crimson Red Silk Satin Ribbon",
      height: "Approx 12 - 14 inches",
    },
    careTips: [
      "Trim 1-2 cm off the bottom of each stem at a 45-degree angle before putting them in water.",
      "Place in a clean vase filled with fresh, cool water and dissolve flower food if provided.",
      "Keep the bouquet away from direct sunlight, drafts, ceiling fans, and ripening fruit.",
      "Change the vase water every 2 days to maintain petal crispness and longevity.",
    ],
    deliveryInfo: [
      "Delivered in protective, water-fed hydration pouches so blooms stay farm-fresh during transit.",
      "Hand-arranged by experienced local florists right before dispatch.",
      "Includes a complimentary personalized message card for your special note.",
    ],
    reviews: [
      {
        id: "rev-1",
        author: "Priya Sengupta",
        city: "South Kolkata",
        rating: 5,
        date: "Yesterday",
        comment: "Ordered for my anniversary. The roses arrived in 75 minutes and were super fresh with morning dew droplets!",
      },
      {
        id: "rev-2",
        author: "Rahul Verma",
        city: "Salt Lake",
        rating: 5,
        date: "3 days ago",
        comment: "Packaging was premium Korean paper, just like the photos. My fiance loved it completely.",
      },
      {
        id: "rev-3",
        author: "Ananya Roy",
        city: "New Town",
        rating: 4.8,
        date: "1 week ago",
        comment: "Smells divine and lasted almost 6 days with regular water changes. Highly recommend MS Flowers!",
      },
    ],
  },
  {
    id: "fl-2",
    slug: "blooming-symphony-gift-bouquet",
    name: "Blooming Symphony Gift Bouquet",
    category: "lilies",
    price: 899,
    originalPrice: 1049,
    rating: 4.8,
    reviewsCount: 88,
    deliveryTag: "Same Day Delivery",
    badge: "POPULAR",
    image: "/products/flowers/white-lilies-carnations.jpg",
    images: [
      "/products/flowers/white-lilies-carnations.jpg",
      "/products/flowers/white-lilies-carnations-macro.jpg",
      "/products/flowers/white-lilies-carnations-ribbon.jpg",
      "/products/flowers/white-lilies-carnations-top.jpg",
    ],
    tagline: "A melodious duet of fragrant Asiatic lilies and gentle pastel pink carnations for unforgettable moments.",
    description: "Fragrant white oriental lilies paired with soft pink carnations wrapped in rustic luxury craft paper with imported twine ribbon.",
    specs: {
      stemCount: "14 Stems Total",
      flowers: ["3 White Asiatic Lily Stems (6-8 blooms)", "8 Soft Pink Carnations"],
      fillers: "White Waxflowers & Green Ruscus Foliage",
      packaging: "Eco-friendly Dual Kraft & Japanese Vellum Paper",
      ribbon: "Natural Jute Twine with Pastel Pink Grosgrain Ribbon",
      height: "Approx 15 - 18 inches",
    },
    careTips: [
      "Remove pollen anthers carefully from lilies as they open to prevent petal staining.",
      "Cut stems diagonally by 1 inch and remove any leaves submerged below the water level.",
      "Mist petals lightly with clean water once a day in dry or air-conditioned rooms.",
      "Keep away from direct heat sources to extend bloom life up to 8 days.",
    ],
    deliveryInfo: [
      "Lilies may arrive in bud form to protect them during transit and ensure maximum blooming life at home.",
      "Hand-crafted by master florists within 2 hours of dispatch.",
      "Complimentary greeting card included with your custom heartfelt message.",
    ],
    reviews: [
      {
        id: "rev-4",
        author: "Devika Mukherjee",
        city: "Ballygunge",
        rating: 5,
        date: "2 days ago",
        comment: "The lilies bloomed completely by the next morning and the fragrance filled the entire living room!",
      },
      {
        id: "rev-5",
        author: "Sourav Paul",
        city: "Howrah",
        rating: 5,
        date: "5 days ago",
        comment: "IGP style luxury presentation at a much friendlier price. Delivery was punctual.",
      },
    ],
  },
  {
    id: "fl-3",
    slug: "royal-purple-orchids-in-glass-vase",
    name: "Royal Purple Orchids in Glass Vase",
    category: "orchids",
    price: 999,
    originalPrice: 1199,
    rating: 4.9,
    reviewsCount: 76,
    deliveryTag: "Same Day Delivery",
    badge: "EXOTIC",
    image: "/products/flowers/purple-orchids-vase.jpg",
    images: [
      "/products/flowers/purple-orchids-vase.jpg",
      "/products/flowers/purple-orchids-vase-macro.jpg",
      "/products/flowers/purple-orchids-vase-vase.jpg",
      "/products/flowers/purple-orchids-vase.jpg",
    ],
    tagline: "Exotic purple dendrobium orchids in a crystal glass vase that exudes opulence and modern grace.",
    description: "Exotic purple dendrobium orchids gracefully arranged with lush green foliage in an elegant reusable clear glass cylinder vase.",
    specs: {
      stemCount: "8 Long Orchid Sprays",
      flowers: ["8 Purple Dendrobium Orchid Stems (approx 35+ blooms)"],
      fillers: "Lush Palm Greens & Asparagus Fern",
      packaging: "Clear Cylindrical Heavy Glass Vase (Free)",
      ribbon: "Deep Violet Organza Ribbon",
      height: "Approx 16 - 18 inches",
    },
    careTips: [
      "Orchids love indirect daylight; avoid placing them in dark corners or direct sun.",
      "Replenish vase water every other day, ensuring stems remain submerged 3-4 inches.",
      "Keep stems clean by gently wiping vase glass if water appears cloudy.",
    ],
    deliveryInfo: [
      "Arrives fully assembled inside the protective glass vase.",
      "Securely packaged in a shock-absorbing thermocol cradle to prevent breakage.",
    ],
    reviews: [
      {
        id: "rev-6",
        author: "Sneha Ghosh",
        city: "Park Street",
        rating: 5,
        date: "4 days ago",
        comment: "The glass vase arrangement is stunning! It looks so premium on our dining table.",
      },
    ],
  },
  {
    id: "fl-4",
    slug: "luxury-black-box-20-red-roses",
    name: "MS Luxury Black Box of 20 Red Roses",
    category: "boxes",
    price: 1299,
    originalPrice: 1549,
    rating: 5.0,
    reviewsCount: 115,
    deliveryTag: "90-Min Delivery",
    badge: "LUXURY",
    image: "/products/flowers/luxury-roses-box.jpg",
    images: [
      "/products/flowers/luxury-roses-box.jpg",
      "/products/flowers/luxury-roses-box-macro.jpg",
      "/products/flowers/luxury-roses-box-box.jpg",
      "/products/flowers/luxury-roses-box.jpg",
    ],
    tagline: "The pinnacle of floral luxury: 20 velvety red roses nestled in a gold-embossed matte black hatbox.",
    description: "20 premium deep velvet red roses hand-arranged in a signature matte black cylindrical box with silk ribbon.",
    specs: {
      stemCount: "20 Roses",
      flowers: ["20 Grade-A Taj Mahal Red Roses"],
      fillers: "Dense Oasis Floral Foam with hydration nutrition",
      packaging: "Rigid Cylindrical Matte Black Keepsake Box with Gold Foil Logo",
      ribbon: "Double-face Gold Trimmed Black Satin Ribbon",
      height: "Approx 9 inches (Box Diameter 8 inches)",
    },
    careTips: [
      "Flowers are set in specialized floral foam that retains water.",
      "Add half a cup of water directly to the center of the box every morning.",
      "Do not pull flowers out of the foam.",
    ],
    deliveryInfo: [
      "Hand-carried in a luxury MS Flowers branded carry bag.",
      "Available with 90-minute express delivery across Kolkata.",
    ],
    reviews: [
      {
        id: "rev-7",
        author: "Arindam Bhattacharya",
        city: "Alipore",
        rating: 5,
        date: "Yesterday",
        comment: "Unboxing experience was 10/10. Looked even better than five-star hotel floral arrangements.",
      },
    ],
  },
  {
    id: "fl-5",
    slug: "midnight-romance-15-red-roses-bunch",
    name: "Midnight Romance 15 Red Roses Bunch",
    category: "roses",
    price: 699,
    originalPrice: 849,
    rating: 4.9,
    reviewsCount: 94,
    deliveryTag: "90-Min Delivery",
    badge: "MIDNIGHT SPECIAL",
    image: "/categories/flowers-bouquet.jpg",
    images: [
      "/products/flowers/red-roses-bouquet.jpg",
      "/products/flowers/red-roses-bouquet-crown.jpg",
      "/products/flowers/red-roses-bouquet-macro.jpg",
      "/products/flowers/red-roses-bouquet-ribbon.jpg",
    ],
    tagline: "Crafted specially for midnight surprises with dramatic black paper and golden foil trims.",
    description: "15 long-stem red roses bundled in midnight black wrapping paper with golden ribbon.",
    specs: {
      stemCount: "15 Stems",
      flowers: ["15 Long Stem Red Roses"],
      fillers: "White Baby's Breath & Eucalyptus",
      packaging: "Water-resistant Midnight Black Matte Paper",
      ribbon: "Metallic Gold Satin Ribbon",
      height: "Approx 14 inches",
    },
    careTips: [
      "Recut stems diagonally and put them in room temperature water right after midnight celebration.",
    ],
    deliveryInfo: [
      "Special 11:30 PM - 12:00 AM delivery slot available at checkout.",
    ],
    reviews: [
      {
        id: "rev-8",
        author: "Vikram Das",
        city: "Garia",
        rating: 5,
        date: "3 days ago",
        comment: "Delivered at 11:58 PM sharp on my wife's birthday. Perfect execution!",
      },
    ],
  },
  {
    id: "fl-6",
    slug: "blissful-pastel-lilies-rose-medley",
    name: "Blissful Pastel Lilies & Rose Medley",
    category: "lilies",
    price: 849,
    originalPrice: 999,
    rating: 4.8,
    reviewsCount: 62,
    deliveryTag: "Same Day Delivery",
    badge: "FRESH",
    image: "/trust/farm-fresh-blooms.jpg",
    images: [
      "/trust/farm-fresh-blooms.jpg",
      "/products/flowers/white-lilies-carnations.jpg",
      "/categories/flowers-bouquet.jpg",
    ],
    tagline: "Serenade their senses with an ethereal blend of pink roses and pristine Asiatic lilies.",
    description: "Soft pastel Asiatic lilies combined with Dutch pink roses and eucalyptus leaves.",
    specs: {
      stemCount: "12 Stems",
      flowers: ["2 White Asiatic Lily Stems", "6 Dutch Pink Roses", "4 Pink Carnations"],
      fillers: "Fresh Eucalyptus & Limonium",
      packaging: "Pastel Lavender Kraft Wrap",
      ribbon: "White Chiffon Ribbon",
      height: "Approx 14 inches",
    },
    careTips: [
      "Keep water fresh and pinch off fading blooms to encourage bud opening.",
    ],
    deliveryInfo: [
      "Shipped directly from temperature-controlled cold rooms.",
    ],
    reviews: [
      {
        id: "rev-9",
        author: "Megha Sen",
        city: "Behala",
        rating: 4.9,
        date: "1 week ago",
        comment: "Very soothing color palette and soft natural aroma.",
      },
    ],
  },
  {
    id: "fl-7",
    slug: "velvet-scarlet-heart-rose-arrangement",
    name: "Velvet Scarlet Heart Rose Arrangement",
    category: "boxes",
    price: 1399,
    originalPrice: 1699,
    rating: 4.9,
    reviewsCount: 108,
    deliveryTag: "90-Min Delivery",
    badge: "ROMANCE",
    image: "/categories/anniversary-heart.jpg",
    images: [
      "/categories/anniversary-heart.jpg",
      "/products/flowers/luxury-roses-box.jpg",
      "/trust/free-greeting-card.jpg",
    ],
    tagline: "A heart full of love: 24 passionate scarlet roses arranged in a heart-shaped keepsake box.",
    description: "Heart-shaped keepsake box filled with freshly bloomed scarlet roses, perfect for anniversaries.",
    specs: {
      stemCount: "24 Scarlet Roses",
      flowers: ["24 Grade-A Deep Red Roses"],
      fillers: "Dense Hydration Sponge",
      packaging: "Red Velvet Texture Heart Shaped Gift Box",
      ribbon: "Matching Scarlet Satin Bow",
      height: "Approx 6 inches (Width 10 inches)",
    },
    careTips: [
      "Drizzle 50-70ml water between roses every 2 days to keep floral sponge moist.",
    ],
    deliveryInfo: [
      "Express hand delivery across Kolkata with guaranteed intact presentation.",
    ],
    reviews: [
      {
        id: "rev-10",
        author: "Karan Johar",
        city: "Dum Dum",
        rating: 5,
        date: "5 days ago",
        comment: "The heart arrangement is iconic. My wife was in tears of joy!",
      },
    ],
  },
  {
    id: "fl-8",
    slug: "classic-dutch-red-roses-pack-of-12",
    name: "Classic Dutch Red Roses (Pack of 12)",
    category: "roses",
    price: 599,
    originalPrice: 749,
    rating: 4.9,
    reviewsCount: 126,
    deliveryTag: "90-Min Delivery",
    badge: "POPULAR",
    image: "/products/flowers/red-roses-bouquet.jpg",
    images: [
      "/products/flowers/red-roses-bouquet.jpg",
      "/products/flowers/red-roses-bouquet-macro.jpg",
      "/products/flowers/red-roses-bouquet-ribbon.jpg",
      "/products/flowers/red-roses-bouquet-crown.jpg",
    ],
    tagline: "Timeless 12 long-stem Dutch red roses symbolizing complete devotion and romance.",
    description: "12 crisp, long-stemmed red roses styled in double-layered water-resistant paper wrapping.",
    specs: {
      stemCount: "12 Stems",
      flowers: ["12 Long Stem Red Roses"],
      fillers: "Baby's breath & golden sprigs",
      packaging: "Two-layer Classic White & Crimson Sheet",
      ribbon: "Red Silk Ribbon",
      height: "Approx 14 inches",
    },
    careTips: [
      "Keep stems trimmed and water clean for up to 7 days of fresh blooms.",
    ],
    deliveryInfo: [
      "Dispatched within 30 minutes of order confirmation.",
    ],
    reviews: [
      {
        id: "rev-11",
        author: "Titas Banerjee",
        city: "Jadavpur",
        rating: 5,
        date: "Yesterday",
        comment: "Classic, reliable, and always arrives fresh. My go-to order on MS Flowers.",
      },
    ],
  },
];
