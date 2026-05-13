import PromotionSection from "../components/PromotionSection";
import TrendingSection from "../components/TrendingSection";

export default function Home() {
  return (
    <main className="space-y-6 pb-10 pt-4">
      <PromotionSection />
      <TrendingSection />
    </main>
  );
}
