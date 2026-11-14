import Image from "next/image";

interface CategoryItem {
  label: string;
  mobileLine1?: string;
  mobileLine2?: string;
  href: string;
  imageSrc: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    label: "Same Day Delivery",
    mobileLine1: "Same Day",
    mobileLine2: "Delivery",
    href: "/same-day",
    imageSrc: "/categories/same-day-delivery.jpg",
  },
  {
    label: "Cakes",
    href: "/cakes",
    imageSrc: "/categories/cakes-truffle.jpg",
  },
  {
    label: "Flowers",
    href: "/flowers",
    imageSrc: "/categories/flowers-bouquet.jpg",
  },
  {
    label: "Combos",
    href: "/combos",
    imageSrc: "/categories/combos-duo.jpg",
  },
  {
    label: "Birthday",
    href: "/cakes",
    imageSrc: "/categories/birthday-cake.jpg",
  },
  {
    label: "Anniversary",
    href: "/combos",
    imageSrc: "/categories/anniversary-heart.jpg",
  },
  {
    label: "Midnight Delivery",
    mobileLine1: "Midnight",
    mobileLine2: "Delivery",
    href: "/midnight",
    imageSrc: "/categories/midnight-delivery.jpg",
  },
];

export default function CategoryStrip() {
  return (
    <section
      aria-label="Flowers and cakes categories"
      className="max-w-[1680px] mx-auto px-1 sm:px-8 2xl:px-12 pt-2.5 sm:pt-4 pb-1 sm:pb-2 w-full"
    >
      {/* Container: Transparent & Borderless with Snap-Scroll on Mobile | White Pill on Desktop */}
      <div className="bg-transparent sm:bg-white border-none sm:border sm:border-zinc-200/90 rounded-none sm:rounded-2xl shadow-none sm:shadow-[0_2px_8px_rgba(0,0,0,0.03)] py-1.5 sm:py-3.5 2xl:py-4 px-0 sm:px-2 2xl:px-4 flex sm:grid overflow-x-auto sm:overflow-visible no-scrollbar snap-x snap-mandatory scroll-smooth sm:grid-cols-7 sm:divide-x divide-zinc-200/70">
        {CATEGORIES.map((category) => (
          <a
            key={category.label}
            href={category.href}
            className="w-1/4 sm:w-auto shrink-0 sm:shrink snap-start flex flex-col items-center justify-start gap-1.5 sm:gap-2 py-1 sm:px-2.5 sm:py-2 group transition-colors text-center"
          >
            {/* Circular Category Badge */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 2xl:w-18 2xl:h-18 rounded-full overflow-hidden border-2 border-rose-100/90 shadow-2xs group-hover:scale-108 group-hover:border-[#c8102e] group-hover:shadow-md transition-all duration-300 bg-white p-1.5 sm:p-2 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={category.imageSrc}
                  alt={category.label}
                  fill
                  sizes="72px"
                  className="object-contain object-center group-hover:scale-108 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Mobile: Symmetrical 2-Line / 1-Line Label */}
            <div className="sm:hidden text-[11px] font-semibold text-zinc-800 group-hover:text-[#c8102e] text-center leading-tight tracking-tight px-0.5">
              {category.mobileLine1 ? (
                <>
                  <span className="block">{category.mobileLine1}</span>
                  <span className="block text-[10px] text-zinc-500 font-medium">{category.mobileLine2}</span>
                </>
              ) : (
                <span className="block">{category.label}</span>
              )}
            </div>

            {/* Desktop: Standard Clean Label */}
            <span className="hidden sm:block text-xs sm:text-[13px] 2xl:text-sm font-semibold text-zinc-800 group-hover:text-[#c8102e] text-center whitespace-nowrap transition-colors tracking-tight">
              {category.label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
