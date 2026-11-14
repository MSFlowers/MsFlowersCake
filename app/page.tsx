import CakesSection from "./components/CakesSection";
import CategoryStrip from "./components/CategoryStrip";
import CombosSection from "./components/CombosSection";
import FlowersSection from "./components/FlowersSection";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";
import TrustFeatures from "./components/TrustFeatures";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Header />
      <main className="flex-1">
        <CategoryStrip />
        <HeroCarousel />
        <FlowersSection />
        <CakesSection />
        <CombosSection />
        <TrustFeatures />
      </main>
      <Footer />
    </div>
  );
}
