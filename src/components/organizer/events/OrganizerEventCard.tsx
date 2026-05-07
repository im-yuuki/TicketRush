import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { StoredOrganizerEvent } from "../../../utils/organizerEventsStorage";
import {
  formatStoredEventDate,
  organizerEventActions,
} from "./organizerEventsConfig";

function EventPoster() {
  return (
    <div className="relative h-[112px] w-full overflow-hidden rounded-lg border border-border bg-[radial-gradient(circle_at_30%_30%,#ffd15a_0,#f97316_32%,#7f1d1d_62%,#20110e_100%)] shadow-sm sm:w-[208px]">
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute top-3 left-3 rounded bg-surface/90 px-2 py-1 text-[10px] font-black text-accent">
        TicketRush
      </div>
      <div className="absolute right-4 bottom-4 max-w-[120px] -rotate-6 text-right text-2xl font-black leading-6 text-foreground drop-shadow">
        New event
      </div>
      <div className="absolute bottom-4 left-5 flex items-end gap-1">
        <span className="block h-12 w-6 rounded-t-full bg-accent" />
        <span className="block h-16 w-7 rounded-t-full bg-warning" />
        <span className="block h-10 w-5 rounded-t-full bg-danger" />
      </div>
    </div>
  );
}

export default function OrganizerEventCard({ event }: { event: StoredOrganizerEvent }) {
  const { t } = useTranslation();

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-lg border border-border bg-surface-secondary shadow-xl"
    >
      <div className="grid gap-5 p-4 sm:grid-cols-[208px_minmax(0,1fr)]">
        <EventPoster />
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

      <div className="grid grid-cols-3 border-t border-border bg-surface-tertiary sm:grid-cols-5">
        {organizerEventActions.map(({ labelKey, icon: Icon }) => (
          <Button
            key={labelKey}
            variant="tertiary"
            className="h-16 rounded-none bg-transparent text-muted hover:bg-surface-secondary hover:text-foreground"
            aria-label={t(`organizer.events.actions.${labelKey}`)}
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
