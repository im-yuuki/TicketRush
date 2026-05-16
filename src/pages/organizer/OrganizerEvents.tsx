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

export default function OrganizerEvents() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<OrganizerEventTab>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [createdEvents, setCreatedEvents] = useState<StoredOrganizerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setIsLoading(true);
      setListError(null);

      try {
        const events = await organizerEventsService.list();
        if (!cancelled) {
          setCurrentTime(Date.now());
          setCreatedEvents(events);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Could not load organizer events.";
          setListError(message);
          setCreatedEvents([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadEvents();

    function refreshEvents() {
      loadEvents();
    }

    window.addEventListener(ORGANIZER_EVENTS_CHANGE_EVENT, refreshEvents);

    return () => {
      cancelled = true;
      window.removeEventListener(ORGANIZER_EVENTS_CHANGE_EVENT, refreshEvents);
    };
  }, []);

  const visibleEvents = useMemo(() => {
    const tabEvents = createdEvents.filter((event) => {
      const startsAt = new Date(event.start).getTime();
      const isPast = Number.isFinite(startsAt) && startsAt < currentTime;
      const isPublished = event.status === "published";

      if (activeTab === "upcoming") return isPublished && !isPast;
      if (activeTab === "past") return isPublished && isPast;
      if (activeTab === "pending") return event.status === "pending";
      return event.status === "draft";
    });

    const query = searchQuery.trim().toLowerCase();
    if (!query) return tabEvents;
    return tabEvents.filter((event) => event.title.toLowerCase().includes(query));
  }, [activeTab, createdEvents, currentTime, searchQuery]);

  return (
    <OrganizerPageShell>
      <section className="min-w-0">
        <OrganizerEventsToolbar
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onTabChange={setActiveTab}
        />

        {activeTab === "pending" && (
          <div className="mt-3 rounded-lg bg-warning px-4 py-3 text-center text-sm font-bold text-warning-foreground">
            {t(
              "organizer.events.pendingNotice",
              "Lưu ý: Sự kiện đang chờ duyệt. Để đảm bảo tính bảo mật cho sự kiện của bạn, quyền truy cập vào trang chỉ dành cho chủ sở hữu và quản trị viên được ủy quyền",
            )}
          </div>
        )}

        <div className="mt-5">
          {isLoading ? (
            <div className="rounded-lg border border-border bg-surface-secondary/70 p-10 text-center text-sm text-muted">
              {t("organizer.events.loading", "Loading events...")}
            </div>
          ) : listError ? (
            <div className="rounded-lg border border-danger/40 bg-danger/10 p-10 text-center text-sm font-medium text-danger">
              {listError}
            </div>
          ) : visibleEvents.length > 0 ? (
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
