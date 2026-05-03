import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button, Card } from "@heroui/react";
import { CalendarDays, ChevronDown } from "lucide-react";
import ExpandableCard from "../components/ExpandableCard";
import { useEvent } from "../layouts/EventLayout";

function formatPrice(value: number, lang: string) {
  const locale = lang === "vn" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRangeDate(iso: string, lang: string) {
  const locale = lang === "vn" ? "vi-VN" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function Event() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const event = useEvent();
  const [openTier, setOpenTier] = useState<string | null>(null);

  const aboutLabel = t("event.about", "Giới thiệu");
  const scheduleLabel = t("event.schedule", "Lịch diễn");
  const organizerLabel = t("event.organizer", "Ban tổ chức");
  const ticketInfoLabel = t("event.ticketInfo", "Thông tin vé");
  const buyNowLabel = t("event.buyNow", "Mua vé ngay");

  const handleGoToBooking = () => {
    navigate(`/events/${event.id}/booking`);
  };

  return (
    <div className="space-y-6">
      <ExpandableCard title={aboutLabel} collapsedHeight={240}>
        <div className="space-y-2 text-sm leading-relaxed">
          {event.description.map((para, idx) => (
            <p key={idx} className={para.bold ? "font-semibold" : undefined}>
              {para.text}
            </p>
          ))}
        </div>
      </ExpandableCard>

      <Card>
        <Card.Header className="flex-row items-center justify-between border-b border-border pb-3">
          <Card.Title className="text-base font-semibold">
            {scheduleLabel}
          </Card.Title>
        </Card.Header>

        <Card.Content className="gap-3">
          <div className="rounded-lg border border-border">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted" />
                <span className="text-sm font-medium">
                  {formatRangeDate(event.date, i18n.language)}
                </span>
              </div>
              <Button
                size="sm"
                className="bg-(--accent) text-(--accent-foreground) hover:bg-(--accent)/90"
                onClick={handleGoToBooking}
              >
                {buyNowLabel}
              </Button>
            </div>

            <div className="border-t border-border px-4 py-3">
              <p className="mb-3 text-sm font-semibold">{ticketInfoLabel}</p>
              <div className="space-y-2">
                {event.ticketTiers.map((tier) => {
                  // mở 1 tier khi click, đóng khi click lại hoặc click vào tier khác.
                  const open = openTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setOpenTier(open ? null : tier.id)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm transition-colors hover:bg-surface-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span className="flex items-center gap-2">
                        <ChevronDown
                          className={`size-4 transition-transform ${open ? "rotate-0" : "-rotate-90"
                            }`}
                        />
                        <span className="font-medium">{tier.name}</span>
                      </span>
                      <span className="font-semibold text-accent">
                        {formatPrice(tier.price, i18n.language)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="border-b border-border pb-3">
          <Card.Title className="text-base font-semibold">
            {organizerLabel}
          </Card.Title>
        </Card.Header>

        <Card.Content>
          {/* Thong tin don vi to chuc va logo dai dien. */}
          <div className="flex items-start gap-4">
            <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-secondary text-sm font-semibold text-muted md:size-40">
              {event.organizerLogo ? (
                <img
                  src={event.organizerLogo}
                  alt={event.organizer}
                  className="h-full w-full object-cover"
                />
              ) : (
                "LOGO"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-bold uppercase tracking-wide">
                {event.organizer}
              </p>
              <p className="text-sm leading-relaxed text-muted">
                {event.organizerDescription}
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
