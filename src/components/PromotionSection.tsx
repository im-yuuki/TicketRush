import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { getPromotedEvents } from '../api/feeds';

export default function PromotionSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<{ id: number; title: string; image: string }[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getPromotedEvents();
        if (!isMounted) return;
        setPromotions(
          (data ?? []).map((item) => ({
            id: item.id,
            title: item.name ?? "",
            image: item.bannerUrl ?? "",
          })),
        );
      } catch {
        if (isMounted) setPromotions([]);
      }
    }

    load();
    return () => { isMounted = false; };
  }, []);

  const N = promotions.length >= 2 ? promotions.length : 0;
  const extendedPromotions = N > 0 ? [...promotions, ...promotions, ...promotions] : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasTransition, setHasTransition] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (N === 0) return;
    setCurrentIndex(N);
  }, [N]);

  // Auto slide
  useEffect(() => {
    if (isHovered || N === 0) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, isHovered, isAnimating, N]);

  // Handle seamless loops
  useEffect(() => {
    if (!isAnimating || N === 0) return;

    const timeout = setTimeout(() => {
      setIsAnimating(false);

      if (currentIndex >= 2 * N) {
        setHasTransition(false);
        setCurrentIndex(N);
      }
      else if (currentIndex <= N - 1) {
        setHasTransition(false);
        setCurrentIndex(2 * N - 1);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [currentIndex, isAnimating, N]);

  const handleNext = () => {
    if (isAnimating || N === 0) return;
    setHasTransition(true);
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isAnimating || N === 0) return;
    setHasTransition(true);
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
  };

  if (N === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-10 pt-10">
      <div 
        className="w-full flex flex-col items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <div className="relative w-full overflow-hidden group">
        <div 
          className={`flex gap-4 w-full ${hasTransition ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateX(calc(${currentIndex} * -50% - ${currentIndex} * 0.5rem))` }}
        >
          {extendedPromotions.map((promo, idx) => (
            <div 
              key={`${promo.id}-${idx}`} 
              className="w-[calc(50%-0.5rem)] shrink-0 relative rounded-2xl overflow-hidden aspect-[16/9] bg-default-100"
            >
              <img
                src={promo.image}
                alt={promo.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => navigate(`/events/${promo.id}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/events/${promo.id}`); }}
              />

              {/* Bottom gradient (no action buttons) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-r-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-l-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex gap-2 mt-4">
        {promotions.map((_, idx) => {
          const activeDotIndex = currentIndex % N;
          return (
            <button
              key={idx}
              onClick={() => {
                if (isAnimating || activeDotIndex === idx) return;
                setHasTransition(true);
                setIsAnimating(true);
                setCurrentIndex(N + idx);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === activeDotIndex ? 'bg-white' : 'bg-white/30'
              }`}
              aria-label={t("promotionSection.goToSlide", "Go to slide {{index}}", { index: idx + 1 })}
            />
          );
        })}
      </div>
      </div>
    </section>
  );
}
