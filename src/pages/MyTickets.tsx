import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin, Ticket, Armchair } from "lucide-react";

import { getPurchasedTickets } from "../api/user";
import { getEventInfo } from "../api/public";
import type { PurchasedTicketView } from "../types/requestDto";
import type { PublicEventInfo } from "../types/requestDto";

interface TicketDisplay {
  ticketId: number;
  eventId: number;
  eventName: string;
  eventDateTime: string;
  venue: string;
  address: string;
  ticketClassName: string;
  seatZoneName: string;
  seatRowLabel: string;
  seatNumber: number;
  ticketSecretCode: string;
}

export default function MyTickets() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<TicketDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketDisplay | null>(null);
  const qrBaseUrl = "https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=";

  useEffect(() => {
    let isMounted = true;

    async function loadTickets() {
      try {
        const rawTickets = await getPurchasedTickets();
        if (!isMounted) return;

        const payload: PurchasedTicketView[] = Array.isArray(rawTickets)
          ? rawTickets
          : (rawTickets as any)?.data ?? (rawTickets as any)?.metadata ?? [];

        // Fetch event info for each unique event
        const eventIds = [...new Set(payload.map((t) => t.eventId))];
        const eventMap = new Map<number, PublicEventInfo>();
        await Promise.all(
          eventIds.map(async (eventId) => {
            try {
              const info = await getEventInfo(eventId);
              eventMap.set(eventId, info);
            } catch {
              // Event info unavailable — fallback to ticket data
            }
          }),
        );

        const mapped = payload.map((item) => {
          const e = eventMap.get(item.eventId);
          return {
            ticketId: item.ticketId,
            eventId: item.eventId,
            eventName: item.eventName,
            eventDateTime: item.eventDateTime,
            venue: e?.venue ?? "",
            address: e?.address ?? "",
            ticketClassName: item.ticketClassName,
            seatZoneName: item.seatZoneName,
            seatRowLabel: item.seatRowLabel,
            seatNumber: item.seatNumber,
            ticketSecretCode: item.ticketSecretCode,
          };
        });

        setTickets(mapped);
      } catch (error) {
        if (!isMounted) return;
        setTickets([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTickets();
    return () => { isMounted = false; };
  }, []);

  const hasTickets = tickets.length > 0;

  const ticketRows = useMemo(
    () =>
      tickets.map((ticket) => {
        const locationParts = [ticket.venue, ticket.address].filter(Boolean);
        const locationStr = locationParts.join(" — ") || "—";
        return (
          <button
            type="button"
            key={ticket.ticketId}
            onClick={() => setSelectedTicket(ticket)}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{ticket.eventName || "—"}</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  <Armchair className="size-3" />
                  {ticket.seatZoneName} — {ticket.seatRowLabel}{ticket.seatNumber}
                </span>
              </div>
              <Ticket className="size-6 text-primary shrink-0" />
            </div>
            <div className="space-y-2 text-sm text-muted">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted shrink-0" />
                <span>{ticket.eventDateTime ? new Date(ticket.eventDateTime).toLocaleString() : "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted shrink-0" />
                <span>{locationStr}</span>
              </div>
            </div>
          </button>
        );
      }),
    [tickets],
  );

  const qrCodeUrl = selectedTicket
    ? `${qrBaseUrl}${selectedTicket.ticketSecretCode}`
    : "";

  return (
    <main className="min-h-screen bg-surface-secondary/40 pb-10">
      <section className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-6 lg:px-8">
        <header className="flex flex-col gap-2 pb-6">
          <h1 className="text-3xl font-semibold text-foreground">{t("tickets.title", "My Tickets")}</h1>
          <p className="text-sm text-muted">{t("tickets.subtitle", "Manage your upcoming tickets")}</p>
        </header>

        {isLoading && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
            {t("tickets.loading", "Loading tickets...")}
          </div>
        )}

        {!isLoading && hasTickets && <div className="grid gap-4">{ticketRows}</div>}

        {!isLoading && !hasTickets && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">{t("tickets.emptyTitle", "No tickets yet")}</h2>
            <p className="mt-2 text-sm text-muted">{t("tickets.emptyBody", "When you buy tickets, they will appear here.")}</p>
          </div>
        )}
      </section>

      <Modal>
        <Modal.Backdrop
          isOpen={selectedTicket !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedTicket(null);
          }}
        >
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>{t("tickets.qrTitle", "Ticket QR Code")}</Modal.Header>
              <Modal.Body>
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={qrCodeUrl}
                    alt={t("tickets.qrAlt", "Ticket QR code")}
                    className="h-56 w-56 rounded-lg border border-border bg-white"
                    loading="lazy"
                  />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {selectedTicket?.eventName || "—"}
                    </p>
                    <p className="text-xs text-muted">
                      {selectedTicket?.ticketClassName}
                    </p>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="tertiary" slot="close">
                  {t("common.close", "Close")}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </main>
  );
}
