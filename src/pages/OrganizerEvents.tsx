import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import OrganizerEventCard from "../components/organizer/events/OrganizerEventCard";
import OrganizerEventsToolbar from "../components/organizer/events/OrganizerEventsToolbar";
import OrganizerPagination from "../components/organizer/events/OrganizerPagination";
import type { OrganizerEventTab } from "../components/organizer/events/organizerEventsConfig";
import OrganizerPageShell from "../components/organizer/OrganizerPageShell";
import {
  ORGANIZER_EVENTS_CHANGE_EVENT,
  readStoredOrganizerEvents,
  type StoredOrganizerEvent,
} from "../utils/organizerEventsStorage";

export default function OrganizerEvents() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<OrganizerEventTab>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [createdEvents, setCreatedEvents] = useState<StoredOrganizerEvent[]>(() =>
    readStoredOrganizerEvents(),
  );

  useEffect(() => {
    function refreshEvents() {
      setCreatedEvents(readStoredOrganizerEvents());
    }

    window.addEventListener(ORGANIZER_EVENTS_CHANGE_EVENT, refreshEvents);
    window.addEventListener("storage", refreshEvents);

    return () => {
      window.removeEventListener(ORGANIZER_EVENTS_CHANGE_EVENT, refreshEvents);
      window.removeEventListener("storage", refreshEvents);
    };
  }, []);

  const visibleEvents = useMemo(() => {
    if (activeTab !== "pending") return [];

    const query = searchQuery.trim().toLowerCase();
    if (!query) return createdEvents;
    return createdEvents.filter((event) => event.title.toLowerCase().includes(query));
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

        {activeTab === "pending" && (
          <div className="mt-3 rounded-lg bg-warning px-4 py-3 text-center text-sm font-bold text-warning-foreground">
            {t(
              "organizer.events.pendingNotice",
              "Lưu ý: Sự kiện đang chờ duyệt. Để đảm bảo tính bảo mật cho sự kiện của bạn, quyền truy cập vào trang chỉ dành cho chủ sở hữu và quản trị viên được ủy quyền",
            )}
          </div>
        )}

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
