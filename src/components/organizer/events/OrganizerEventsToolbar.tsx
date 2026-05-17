import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  organizerEventTabs,
  type OrganizerEventTab,
} from "./organizerEventsConfig";

export default function OrganizerEventsToolbar({
  activeTab,
  searchQuery,
  onSearchQueryChange,
  onTabChange,
}: {
  activeTab: OrganizerEventTab;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onTabChange: (tab: OrganizerEventTab) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 2xl:grid-cols-[404px_minmax(0,1fr)]">
      <form
        className="flex min-w-0 overflow-hidden rounded-lg border border-border bg-field-background text-field-foreground shadow-sm"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="sr-only" htmlFor="organizer-event-search">
          {t("organizer.events.searchLabel", "Tìm kiếm sự kiện")}
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
          <Search className="size-5 shrink-0 text-field-placeholder" />
          <input
            id="organizer-event-search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-field-placeholder"
            placeholder={t("organizer.events.searchPlaceholder", "Tìm kiếm sự kiện")}
          />
        </div>
        <button
          type="submit"
          className="h-12 border-l border-border px-5 text-sm font-medium transition-colors hover:bg-surface-secondary"
        >
          {t("organizer.events.searchButton", "Tìm kiếm")}
        </button>
      </form>

      <div className="grid grid-cols-3 overflow-hidden rounded-lg bg-foreground p-1 text-sm font-medium text-muted shadow-sm">
        {organizerEventTabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={isActive}
              className={`h-10 rounded-md px-3 transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground shadow"
                  : "text-background/70 hover:bg-background/10"
              }`}
              onClick={() => onTabChange(tab.key)}
            >
              {t(`organizer.events.tabs.${tab.labelKey}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
