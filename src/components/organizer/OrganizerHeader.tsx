import { Button } from "@heroui/react";
import {
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import AccountButton from "../AccountButton";

export default function OrganizerHeader() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const title = pathname.includes("/events/create")
    ? t("organizer.events.createEvent", "Tạo sự kiện")
    : pathname.includes("/events/") && pathname.includes("/edit")
      ? t("organizer.events.editEvent", "Chỉnh sửa sự kiện")
      : pathname.includes("/reports")
      ? t("organizer.reports.title", "Quản lý báo cáo")
      : pathname.includes("/terms")
        ? t("organizer.terms.title", "Điều khoản cho Ban tổ chức")
        : t("organizer.events.title", "Sự kiện của tôi");

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-surface/95 backdrop-blur lg:left-[252px]">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <h1 className="min-w-0 truncate text-xl font-bold md:text-2xl">
          {title}
        </h1>
        <div className="flex items-center gap-3">
          <Link to="/organizer/events/create">
            <Button className="rounded-full bg-accent px-4 font-semibold text-accent-foreground hover:bg-accent/90">
              <Plus className="size-4" />
              <span className="hidden sm:inline">
                {t("organizer.events.createEvent", "Tạo sự kiện")}
              </span>
            </Button>
          </Link>
          <AccountButton variant="full" />
        </div>
      </div>
    </header>
  );
}
