import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import OrganizerEventCard from "../../components/organizer/events/OrganizerEventCard";
import OrganizerEventsToolbar from "../../components/organizer/events/OrganizerEventsToolbar";
import OrganizerPagination from "../../components/organizer/events/OrganizerPagination";
import type { OrganizerEventTab } from "../../components/organizer/events/organizerEventsConfig";
import OrganizerPageShell from "../../components/organizer/OrganizerPageShell";
import {
  organizerEventsService,
  ORGANIZER_EVENTS_CHANGE_EVENT,
  type StoredOrganizerEvent,
} from "../../api/organizerEventsService";
import { getOrgEvents } from "../../api/organization";

export default function OrganizerEvents() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<OrganizerEventTab>("draft");
  const [searchQuery, setSearchQuery] = useState("");
  const [createdEvents, setCreatedEvents] = useState<StoredOrganizerEvent[]>(() =>
    organizerEventsService.list(),
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchBackendEvents() {
      try {
        const backendEvents = await getOrgEvents();
        if (!isMounted) return;

        const publishedEvents = backendEvents.map(
          (ev) =>
            ({
              id: String(ev.id),
              title: ev.name,
              start: ev.dateTime,
              venueName: ev.venue,
              bannerImageUrl: ev.bannerUrl,
              status: "Đã duyệt",
              published: true,
              showtimeCount: 1,
              ticketTypeCount: 1,
              createdAt: ev.dateTime,
            } as StoredOrganizerEvent)
        );

        setCreatedEvents(() => {
          const localEvents = organizerEventsService.list();
          const backendIds = new Set(publishedEvents.map((e) => e.id));
          const drafts = localEvents.filter(
            (e) => !backendIds.has(e.id) && !e.published
          );

          return [...publishedEvents, ...drafts].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      } catch (err) {
        console.error("Failed to fetch backend events:", err);
      }
    }

    function refreshEvents() {
      setCreatedEvents(organizerEventsService.list());
      fetchBackendEvents();
    }

    fetchBackendEvents();

    window.addEventListener(ORGANIZER_EVENTS_CHANGE_EVENT, refreshEvents);
    window.addEventListener("storage", refreshEvents);

    return () => {
      isMounted = false;
      window.removeEventListener(ORGANIZER_EVENTS_CHANGE_EVENT, refreshEvents);
      window.removeEventListener("storage", refreshEvents);
    };
  }, []);

  const visibleEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? createdEvents.filter((event) => event.title.toLowerCase().includes(query))
      : createdEvents;

    if (activeTab === "draft") {
      return filtered.filter((event) => !event.published);
    }
    // upcoming / past — placeholder logic, show all for now
    return filtered;
  }, [activeTab, createdEvents, searchQuery]);

  return (
    <OrganizerPageShell>
      <section className="min-w-0">
        <OrganizerEventsToolbar
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onTabChange={setActiveTab}
        />

        <div className="mt-5">
          {visibleEvents.length > 0 ? (
            <div className="space-y-4">
              {visibleEvents.map((event) => (
                <OrganizerEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-surface-secondary/70 p-10 text-center text-sm text-muted">
              {t("organizer.events.emptyState", "Chưa có sự kiện trong mục này.")}
            </div>
          )}
        </div>

        <OrganizerPagination />
      </section>
    </OrganizerPageShell>
  );
}
