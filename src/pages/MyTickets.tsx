import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin, Ticket } from "lucide-react";

import { getPurchasedTickets } from "../api/user";

type TicketCard = {
  id: string;
  eventName: string;
  eventTime: string;
  venue: string;
  status?: string;
};

export default function MyTickets() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<TicketCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTickets() {
      try {
        const response = await getPurchasedTickets();
        if (!isMounted) return;

        const payload = response?.data ?? response;
        if (Array.isArray(payload)) {
          const mapped = payload.map((item, index) => ({
            id: String(item?.id ?? index),
            eventName: String(item?.eventName ?? item?.event?.name ?? ""),
            eventTime: String(item?.eventTime ?? item?.event?.dateTime ?? ""),
            venue: String(item?.venue ?? item?.event?.venue ?? ""),
            status: item?.status ? String(item.status) : undefined,
          }));
          setTickets(mapped);
        } else {
          setTickets([]);
        }
      } catch (error) {
        if (!isMounted) return;
        setTickets([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTickets();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasTickets = tickets.length > 0;
  const titleText = t("tickets.title", "My Tickets");
  const subtitleText = t("tickets.subtitle", "Manage your upcoming tickets");
  const emptyTitleText = t("tickets.emptyTitle", "No tickets yet");
  const emptyBodyText = t("tickets.emptyBody", "When you buy tickets, they will appear here.");

  const ticketRows = useMemo(
    () =>
      tickets.map((ticket) => (
        <article
          key={ticket.id}
          className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">{ticket.eventName || "—"}</h3>
              {ticket.status && (
                <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {ticket.status}
                </span>
              )}
            </div>
            <Ticket className="size-6 text-primary" />
          </div>
          <div className="space-y-2 text-sm text-muted">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted" />
              <span>{ticket.eventTime || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted" />
              <span>{ticket.venue || "—"}</span>
            </div>
          </div>
        </article>
      )),
    [tickets],
  );

  return (
    <main className="min-h-screen bg-surface-secondary/40 pb-10">
      <section className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-6 lg:px-8">
        <header className="flex flex-col gap-2 pb-6">
          <h1 className="text-3xl font-semibold text-foreground">{titleText}</h1>
          <p className="text-sm text-muted">{subtitleText}</p>
        </header>

        {isLoading && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
            {t("tickets.loading", "Loading tickets...")}
          </div>
        )}

        {!isLoading && hasTickets && <div className="grid gap-4">{ticketRows}</div>}

        {!isLoading && !hasTickets && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">{emptyTitleText}</h2>
            <p className="mt-2 text-sm text-muted">{emptyBodyText}</p>
          </div>
        )}
      </section>
    </main>
  );
}
