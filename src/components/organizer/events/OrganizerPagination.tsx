import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OrganizerPagination() {
  const { t } = useTranslation();

  return (
    <div className="mt-5 flex justify-end gap-2">
      <Button
        isIconOnly
        variant="tertiary"
        aria-label={t("organizer.events.pagination.previous", "Trang trước")}
        className="rounded-lg bg-surface-secondary"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <Button
        isIconOnly
        aria-label={t("organizer.events.pagination.current", "Trang 1")}
        className="rounded-lg bg-accent font-bold text-accent-foreground"
      >
        1
      </Button>
      <Button
        isIconOnly
        variant="tertiary"
        aria-label={t("organizer.events.pagination.next", "Trang sau")}
        className="rounded-lg bg-surface-secondary"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
