import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Skeleton } from "@heroui/react";
import { CalendarDays, ChevronLeft, ChevronRight, Flame, MapPin } from "lucide-react";

type TrendingEvent = {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  price: number;
  image: string;
  rank: number;
};

const MOCK_EVENTS: TrendingEvent[] = [
  {
    id: "1",
    title: "",
    category: "music",
    date: "2026-05-18T20:00:00",
    location: "Hà Nội",
    price: 360000,
    image:
      "",
    rank: 1,
  },
  {
    id: "2",
    title: "",
    category: "festival",
    date: "2026-06-02T18:30:00",
    location: "TP.HCM",
    price: 180000,
    image:
      "",
    rank: 2,
  },
  {
    id: "3",
    title: "",
    category: "sports",
    date: "2026-05-25T19:15:00",
    location: "TP.HCM",
    price: 450000,
    image:
      "",
    rank: 3,
  },
  {
    id: "4",
    title: "",
    category: "workshop",
    date: "2026-05-10T09:00:00",
    location: "TP.HCM",
    price: 350000,
    image:
      "",
    rank: 4,
  },
  {
    id: "5",
    title: "",
    category: "music",
    date: "2026-05-22T19:30:00",
    location: "TP.HCM",
    price: 550000,
    image:
      "",
    rank: 5,
  },
  {
    id: "6",
    title: "",
    category: "festival",
    date: "2026-05-30T10:00:00",
    location: "Hà Nội",
    price: 120000,
    image:
      "",
    rank: 6,
  },
  {
    id: "7",
    title: "",
    category: "sports",
    date: "2026-06-08T05:00:00",
    location: "Hà Nội",
    price: 680000,
    image:
      "",
    rank: 7,
  },
  {
    id: "8",
    title: "",
    category: "workshop",
    date: "2026-05-14T18:00:00",
    location: "Hà Nội",
    price: 199000,
    image:
      "",
    rank: 8,
  },
  {
    id: "9",
    title: "",
    category: "music",
    date: "2026-06-15T20:00:00",
    location: "Hà Nội",
    price: 990000,
    image:
      "",
    rank: 9,
  },
  {
    id: "10",
    title: "",
    category: "festival",
    date: "2026-05-28T17:00:00",
    location: "TP.HCM",
    price: 80000,
    image:
      "",
    rank: 10,
  },
];

function formatPrice(value: number, lang: string) {
  const locale = lang === "vn" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string, lang: string) {
  const locale = lang === "vn" ? "vi-VN" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function EventCardSkeleton() {
  return (
    <div className="shadow-panel w-[250px] shrink-0 space-y-5 rounded-lg bg-transparent p-4">
      <Skeleton className="h-32 rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-3/5 rounded-lg" />
        <Skeleton className="h-3 w-4/5 rounded-lg" />
        <Skeleton className="h-3 w-2/5 rounded-lg" />
      </div>
    </div>
  );
}

function EventCard({ event }: { event: TrendingEvent }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const categoryLabel = t(
    `trending.categories.${event.category}`,
    event.category,
  );
  const fromText = t("trending.from", "Chỉ từ");

  const handleClick = () => navigate(`/events/${event.id}`);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="shadow-panel group w-[250px] shrink-0 cursor-pointer space-y-5 rounded-lg bg-transparent p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative h-32 overflow-hidden rounded-lg">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
          <Flame className="size-3 text-orange-400" />
          <span>#{event.rank}</span>
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-accent">
          {categoryLabel}
        </div>
      </div>

      <div className="space-y-2">
        <p className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-accent">
          {event.title}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <CalendarDays className="size-3.5 shrink-0" />
          <span className="truncate">{formatDate(event.date, i18n.language)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-baseline gap-1 pt-1">
          <span className="text-[10px] uppercase tracking-wide text-muted">{fromText}</span>
          <span className="text-sm font-bold text-accent">
            {formatPrice(event.price, i18n.language)}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function TrendingSection({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TrendingEvent[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents(MOCK_EVENTS);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      // 1px tolerance for sub-pixel rounding
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [loading, events.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  const title = t("trending.title", "Sự kiện xu hướng");
  const prevLabel = t("trending.prev", "Cuộn trái");
  const nextLabel = t("trending.next", "Cuộn phải");

  const navButtonClass =
    "flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-transparent transition-opacity hover:bg-muted/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <section className={className}>
      <div className="container mx-auto px-10 py-10">
        <div className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-accent">
          <Flame className="size-4" />
          <span>{title}</span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={prevLabel}
            aria-hidden={!canScrollLeft}
            tabIndex={canScrollLeft ? 0 : -1}
            className={`${navButtonClass} ${canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <ChevronLeft className="size-4" />
          </button>

          <div
            ref={scrollerRef}
            className="flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loading
              ? Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="snap-start">
                    <EventCardSkeleton />
                  </div>
                ))
              : events.map((event) => (
                  <div key={event.id} className="snap-start">
                    <EventCard event={event} />
                  </div>
                ))}
          </div>

          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={nextLabel}
            aria-hidden={!canScrollRight}
            tabIndex={canScrollRight ? 0 : -1}
            className={`${navButtonClass} ${canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
