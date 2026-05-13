import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@heroui/react';

const promotions = [
  {
    id: 1,
    title: '2026 KIMSUNGKYU LIVE',
    image: 'https://placehold.co/1280x720/2a2a2a/ffffff?text=KIMSUNGKYU+LIVE',
  },
  {
    id: 2,
    title: 'OCB 30',
    image: 'https://placehold.co/1280x720/a3e635/000000?text=OCB+30',
  },
  {
    id: 3,
    title: 'SS LABEL OFFICIAL MEMBERSHIP',
    image: 'https://placehold.co/1280x720/0ea5e9/ffffff?text=SS+LABEL',
  },
  {
    id: 4,
    title: 'Placeholder 4',
    image: 'https://placehold.co/1280x720/f43f5e/ffffff?text=Placeholder+4',
  },
];

export default function PromotionSection() {
  const N = promotions.length;
  // Duplicate array 3 times to create an infinite scroll illusion
  const extendedPromotions = [...promotions, ...promotions, ...promotions];

  // Start at the middle set
  const [currentIndex, setCurrentIndex] = useState(N);
  const [hasTransition, setHasTransition] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto slide
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, isHovered, isAnimating]);

  // Handle seamless loops
  useEffect(() => {
    if (!isAnimating) return;

    const timeout = setTimeout(() => {
      setIsAnimating(false);
      
      // If we've reached the start of the 3rd set, silently jump back to the start of the 2nd set
      if (currentIndex >= 2 * N) {
        setHasTransition(false);
        setCurrentIndex(N);
      } 
      // If we've reached the end of the 1st set, silently jump forward to the end of the 2nd set
      else if (currentIndex <= N - 1) {
        setHasTransition(false);
        setCurrentIndex(2 * N - 1);
      }
    }, 500); // Matches CSS transition duration

    return () => clearTimeout(timeout);
  }, [currentIndex, isAnimating, N]);

  const handleNext = () => {
    if (isAnimating) return;
    setHasTransition(true);
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setHasTransition(true);
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
  };

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
                className="w-full h-full object-cover" 
              />
              
              {/* Bottom Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end bg-gradient-to-t from-black/60 to-transparent">
                <Button 
                  className="bg-white text-black font-semibold rounded-md px-4 py-2 hover:bg-default-200 transition-colors"
                  size="sm"
                >
                  Xem chi tiết
                </Button>
                
                <button className="bg-black/40 hover:bg-black/60 text-white rounded-md p-2 backdrop-blur-sm transition-colors">
                  <Play className="w-5 h-5 fill-white" />
                </button>
              </div>
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
                // Move to the exact selected slide in the middle set
                setCurrentIndex(N + idx);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === activeDotIndex ? 'bg-white' : 'bg-white/30'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
      </div>
    </section>
  );
}
