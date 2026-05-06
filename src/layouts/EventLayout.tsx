import { useMemo } from "react";
import { Outlet, useNavigate, useOutletContext, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Breadcrumbs, Button } from "@heroui/react";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { getEvent, type EventData } from "../data/events";

type EventContext = { event: EventData };

function formatPrice(value: number, lang: string) {
  const locale = lang === "vn" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

// Chuyen ISO datetime sang chuoi de hien thi o UI.
function formatDateTime(iso: string, lang: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  if (lang === "vn") {
    return `${hh}:${mm}, ${day} Tháng ${month}, ${year}`;
  }
  return `${hh}:${mm}, ${day}/${month}/${year}`;
}

// Neu co endDate thi hien thi khoang thoi gian, neu khong thi hien thi 1 moc bat dau.
function formatDateRange(start: string, end: string | undefined, lang: string) {
  const startStr = formatDateTime(start, lang);
  if (!end) return startStr;
  return `${startStr} - ${formatDateTime(end, lang)}`;
}

export function useEvent() {
  return useOutletContext<EventContext>().event;
}

export default function EventLayout() {
  const { t, i18n } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const event = useMemo(() => getEvent(eventId), [eventId]);

  const homeLabel = t("navigation.home", "Home");
  const eventsLabel = t("event.breadcrumb", "Events");
  const fromLabel = t("event.priceFrom", "Giá từ");
  const buyNowLabel = t("event.buyNow", "Mua vé ngay");
  const notFoundLabel = t(
    "event.notFound",
    "Không tìm thấy sự kiện này.",
  );

  // Guard: neu eventId khong hop le hoac khong tim thay, hien thi thong bao.
  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">{notFoundLabel}</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6 pb-20 md:px-10">
      <Breadcrumbs className="mb-4 max-w-full overflow-hidden">
        <Breadcrumbs.Item onPress={() => navigate("/")}>
          {homeLabel}
        </Breadcrumbs.Item>
        <Breadcrumbs.Item onPress={() => navigate("/")}>
          {eventsLabel}
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <span className="inline-block max-w-[48vw] truncate align-bottom md:max-w-none">
            {event.title}
          </span>
        </Breadcrumbs.Item>
      </Breadcrumbs>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
        <div className="grid md:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <div className="order-2 min-w-0 flex flex-col p-6 md:order-1 md:p-7">
            <h1 className="text-lg font-bold leading-snug md:text-xl">
              {event.title}
            </h1>

            <div className="mt-5 space-y-4 border-b border-border pb-5 text-sm">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted" />
                <span className="leading-relaxed">
                  {formatDateRange(event.date, event.endDate, i18n.language)}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted" />
                <div className="min-w-0">
                  <p className="font-medium">{event.venue}</p>
                  {event.address && (
                    <p className="mt-1 text-xs text-muted">{event.address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3 pt-5">
              <button
                type="button"
                onClick={() => navigate(`/events/${eventId}/booking`)}
                className="flex w-full items-center justify-between text-sm transition-all hover:opacity-80 active:scale-95 focus:outline-none"
              >
                <span>
                  {fromLabel}{" "}
                  <span className="text-base font-bold text-(--accent)">
                    {formatPrice(event.price, i18n.language)}
                  </span>
                </span>
                <ChevronRight className="size-4 text-(--accent)" />
              </button>

              <Button
                className="w-full bg-(--accent) text-(--accent-foreground) hover:bg-(--accent)/90"
                onClick={() => navigate(`/events/${eventId}/booking`)}
              >
                {buyNowLabel}
              </Button>
            </div>
          </div>

          {/* Cot phai: banner/anh cover cua su kien. */}
          <div className="order-1 w-full overflow-hidden bg-black md:order-2 md:min-h-90">
            <img
              src={event.image}
              alt={event.title}
              className="block aspect-video h-full w-full object-contain object-center md:aspect-auto"
            />
          </div>
        </div>
      </section>
      {/* truyền xuống routes */}
      <div className="mt-8">
        <Outlet context={{ event } satisfies EventContext} />
      </div>
    </div>
  );
}
