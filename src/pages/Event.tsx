import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button, Card } from "@heroui/react";
import { CalendarDays, ChevronDown, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ExpandableCard from "../components/ExpandableCard";
import { useEvent } from "../layouts/eventContext";
import { useLocalImageUrl } from "../utils/useLocalImageUrl";
import { getEventInfo, getOrganizationInfo } from "../api/public";
import { followOrganization } from "../api/user";
import type { ShowTime } from "../types/organizerCreate";

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

function ShowtimeScheduleSection({
  showTimes,
  lang,
  scheduleLabel,
  buyNowLabel,
  ticketInfoLabel,
  onGoToBooking,
}: {
  showTimes: ShowTime[];
  lang: string;
  scheduleLabel: string;
  buyNowLabel: string;
  ticketInfoLabel: string;
  onGoToBooking: (showTimeId: number) => void;
}) {
  const [openTier, setOpenTier] = useState<string | null>(null);

  return (
    <Card>
      <Card.Header className="flex-row items-center justify-between border-b border-border pb-3">
        <Card.Title className="text-base font-semibold">
          {scheduleLabel}
        </Card.Title>
      </Card.Header>
      <Card.Content className="gap-3">
        {showTimes.map((showTime) => {
          const allTickets = showTime.tickets.map((ticket) => ({
            id: `${showTime.id}-${ticket.id}`,
            name: ticket.name,
            price: ticket.isFree ? 0 : Number(String(ticket.price).replace(/[^\d]/g, "")) || 0,
          }));

          return (
            <div key={showTime.id} className="rounded-lg border border-border">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted" />
                  <span className="text-sm font-medium">
                    {showTime.name}
                    {showTime.start && (
                      <span className="ml-2 text-muted">
                        — {formatRangeDate(showTime.start, lang)}
                        {showTime.end ? ` - ${formatRangeDate(showTime.end, lang)}` : ""}
                      </span>
                    )}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-(--accent) text-(--accent-foreground) hover:bg-(--accent)/90"
                  onClick={() => onGoToBooking(showTime.id)}
                >
                  {buyNowLabel}
                </Button>
              </div>

              {allTickets.length > 0 && (
                <div className="border-t border-border px-4 py-3">
                  <p className="mb-3 text-sm font-semibold">{ticketInfoLabel}</p>
                  <div className="space-y-2">
                    {allTickets.map((tier) => {
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
                              className={`size-4 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
                            />
                            <span className="font-medium">{tier.name}</span>
                          </span>
                          <span className="font-semibold text-accent">
                            {formatPrice(tier.price, lang)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card.Content>
    </Card>
  );
}

function SingleScheduleSection({
  date,
  ticketTiers,
  lang,
  scheduleLabel,
  buyNowLabel,
  ticketInfoLabel,
  onGoToBooking,
}: {
  date: string;
  ticketTiers: { id: string; name: string; price: number }[];
  lang: string;
  scheduleLabel: string;
  buyNowLabel: string;
  ticketInfoLabel: string;
  onGoToBooking: () => void;
}) {
  const [openTier, setOpenTier] = useState<string | null>(null);

  return (
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
                {formatRangeDate(date, lang)}
              </span>
            </div>
            <Button
              size="sm"
              className="bg-(--accent) text-(--accent-foreground) hover:bg-(--accent)/90"
              onClick={onGoToBooking}
            >
              {buyNowLabel}
            </Button>
          </div>

          <div className="border-t border-border px-4 py-3">
            <p className="mb-3 text-sm font-semibold">{ticketInfoLabel}</p>
            <div className="space-y-2">
              {ticketTiers.map((tier) => {
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
                        className={`size-4 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
                      />
                      <span className="font-medium">{tier.name}</span>
                    </span>
                    <span className="font-semibold text-accent">
                      {formatPrice(tier.price, lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

export default function Event() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const event = useEvent();
  const organizerLogoFromStorage = useLocalImageUrl(event.organizerLogoKey);
  const organizerLogoUrl = event.organizerLogo || organizerLogoFromStorage;
  const [organizerDescription, setOrganizerDescription] = useState(event.organizerDescription);
  const [organizerId, setOrganizerId] = useState<number | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  const aboutLabel = t("event.about", "Giới thiệu");
  const scheduleLabel = t("event.schedule", "Lịch diễn");
  const organizerLabel = t("event.organizer", "Ban tổ chức");
  const ticketInfoLabel = t("event.ticketInfo", "Thông tin vé");
  const buyNowLabel = t("event.buyNow", "Mua vé ngay");
  const followLabel = isFollowed
    ? t("event.following", "Following")
    : t("event.follow", "Follow");

  const handleGoToBooking = (showTimeId?: number) => {
    const query = showTimeId ? `?showTimeId=${showTimeId}` : "";
    navigate(`/events/${event.id}/booking${query}`);
  };

  useEffect(() => {
    setOrganizerDescription(event.organizerDescription);
  }, [event.organizerDescription]);

  useEffect(() => {
    const numericEventId = Number(event.id);
    if (!Number.isFinite(numericEventId) || numericEventId <= 0) return;

    let isActive = true;

    (async () => {
      try {
        const info = await getEventInfo(numericEventId);
        if (!isActive) return;
        setOrganizerId(info.organizationId ?? null);

        if (info.organizationId) {
          const orgInfo = await getOrganizationInfo(info.organizationId);
          if (!isActive) return;
          setOrganizerDescription(orgInfo.description || event.organizerDescription);
        }
      } catch {
        if (isActive) setOrganizerDescription(event.organizerDescription);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [event.id, event.organizerDescription]);

  const handleFollow = async () => {
    if (!organizerId || isFollowLoading || isFollowed) return;
    setIsFollowLoading(true);
    try {
      await followOrganization(organizerId);
      setIsFollowed(true);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ExpandableCard title={aboutLabel} collapsedHeight={240}>
        <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:font-semibold">
          <ReactMarkdown>
            {event.description.map((para) => para.text).join("\n\n")}
          </ReactMarkdown>
        </div>
      </ExpandableCard>

      {event.showTimes && event.showTimes.length > 0 ? (
        <ShowtimeScheduleSection
          showTimes={event.showTimes}
          lang={i18n.language}
          scheduleLabel={scheduleLabel}
          buyNowLabel={buyNowLabel}
          ticketInfoLabel={ticketInfoLabel}
          onGoToBooking={handleGoToBooking}
        />
      ) : (
        <SingleScheduleSection
          date={event.date}
          ticketTiers={event.ticketTiers}
          lang={i18n.language}
          scheduleLabel={scheduleLabel}
          buyNowLabel={buyNowLabel}
          ticketInfoLabel={ticketInfoLabel}
          onGoToBooking={handleGoToBooking}
        />
      )}

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
              {organizerLogoUrl ? (
                <img
                  src={organizerLogoUrl}
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
                {organizerDescription}
              </p>
            </div>
            <div className="ml-auto flex items-start">
              <Button
                type="button"
                variant="tertiary"
                className="border border-border"
                onClick={handleFollow}
                isDisabled={!organizerId || isFollowLoading || isFollowed}
              >
                <Plus className="size-4" />
                {isFollowLoading ? "..." : followLabel}
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
