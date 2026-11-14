import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MS: Online Flowers & Cake Delivery in Kolkata | Same-Day & 90-Min Express",
  description:
    "Order fresh flower bouquets, delicious celebration cakes, and flower + cake combos in Kolkata. 90-minute express and same-day delivery from Chingrighata, Salt Lake across all Kolkata pincodes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full subpixel-antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
