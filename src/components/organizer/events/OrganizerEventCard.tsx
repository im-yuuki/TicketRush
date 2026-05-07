import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  deleteStoredOrganizerEvent,
  getStoredOrganizerEventPreviewId,
  type StoredOrganizerEvent,
} from "../../../utils/organizerEventsStorage";
import { useLocalImageUrl } from "../../../utils/useLocalImageUrl";
import {
  formatStoredEventDate,
  organizerEventActions,
} from "./organizerEventsConfig";

function EventPoster({ imageUrl, title }: { imageUrl?: string; title: string }) {
  if (imageUrl) {
    return (
      <div className="relative h-[112px] w-full overflow-hidden rounded-lg border border-border bg-surface-tertiary shadow-sm sm:w-[208px]">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="h-[112px] w-full rounded-lg border border-border bg-surface-tertiary shadow-sm sm:w-[208px]" />
  );
}

export default function OrganizerEventCard({ event }: { event: StoredOrganizerEvent }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const storedBannerImageUrl = useLocalImageUrl(event.bannerImageKey);
  const previewPath = `/-${getStoredOrganizerEventPreviewId(event)}`;
  const editPath = `/organizer/events/${event.id}/edit`;

  function openEventPreview() {
    navigate(previewPath);
  }

  function openEventEditor() {
    navigate(editPath);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openEventPreview();
  }

  return (
    <motion.article
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="cursor-pointer overflow-hidden rounded-lg border border-border bg-surface-secondary shadow-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent"
      onClick={openEventPreview}
      onKeyDown={handleCardKeyDown}
    >
      <div className="grid gap-5 p-4 sm:grid-cols-[208px_minmax(0,1fr)]">
        <EventPoster imageUrl={event.bannerImageUrl || storedBannerImageUrl} title={event.title} />
        <div className="min-w-0 space-y-4 py-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 flex-1 truncate text-base font-bold">
              {event.title}
            </h2>
            <span className="rounded-full bg-warning px-2.5 py-1 text-xs font-bold text-warning-foreground">
              {event.status}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-3 font-semibold text-accent">
              <CalendarDays className="size-4 shrink-0 text-foreground" />
              {formatStoredEventDate(event.start)}
            </p>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-foreground" />
              <div className="min-w-0">
                <p className="font-semibold text-accent">
                  {t("organizer.events.createdEventSummary", "{{showtimeCount}} suất diễn", {
                    showtimeCount: event.showtimeCount,
                  })}
                </p>
                <p className="mt-1 text-muted">
                  {t("organizer.events.createdTicketSummary", "{{ticketTypeCount}} loại vé", {
                    ticketTypeCount: event.ticketTypeCount,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-border bg-surface-tertiary sm:grid-cols-6">
        {organizerEventActions.map(({ labelKey, icon: Icon }) => (
          <Button
            key={labelKey}
            variant="tertiary"
            className="h-16 w-full rounded-none bg-transparent text-muted hover:bg-surface-secondary hover:text-foreground"
            aria-label={t(`organizer.events.actions.${labelKey}`)}
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();

              if (labelKey === "edit") {
                openEventEditor();
              } else if (labelKey === "delete") {
                const confirmed = window.confirm(
                  t("organizer.events.deleteConfirm", { title: event.title }),
                );
                if (confirmed) {
                  deleteStoredOrganizerEvent(event.id);
                }
              }
            }}
          >
            <span className="flex flex-col items-center gap-1.5">
              <Icon className="size-5 text-foreground" />
              <span className="text-xs">{t(`organizer.events.actions.${labelKey}`)}</span>
            </span>
          </Button>
        ))}
      </div>
    </motion.article>
  );
}
