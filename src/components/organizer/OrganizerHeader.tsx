import { Avatar, Button, Dropdown, Label } from "@heroui/react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LogOut,
  Plus,
  Settings,
  Ticket,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";
import { clearStoredAccount, readStoredAccount, type StoredAccount } from "../../auth/accountStorage";

function OrganizerAccountMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [account, setAccount] = useState<StoredAccount | null>(() => readStoredAccount());
  const unreadNotifications = 5;

  useEffect(() => {
    function handleAccountChange() {
      setAccount(readStoredAccount());
    }

    window.addEventListener("ticketrush-account-change", handleAccountChange);
    window.addEventListener("storage", handleAccountChange);

    return () => {
      window.removeEventListener("ticketrush-account-change", handleAccountChange);
      window.removeEventListener("storage", handleAccountChange);
    };
  }, []);

  const name = account?.displayName || t("navigation.account", "Tài khoản");
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleAction(key: Key) {
    if (key === "organizer-events") {
      navigate("/organizer/events");
    }

    if (key === "logout") {
      clearStoredAccount();
      navigate("/login");
    }
  }

  const UserAvatar = (
    <Avatar className="size-9 select-none rounded-full">
      <Avatar.Image src={account?.avatarUrl ?? ""} />
      <Avatar.Fallback>{initials || <UserRound className="size-4" />}</Avatar.Fallback>
    </Avatar>
  );

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <button
          type="button"
          aria-label={t("navigation.account", "Tài khoản")}
          className="flex h-11 items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-foreground transition-colors hover:bg-surface-secondary"
        >
          {UserAvatar}
          <span className="hidden sm:inline">{name}</span>
          <ChevronDown className="size-4" />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2">
            {UserAvatar}
            <div className="flex flex-col gap-0">
              <p className="text-sm leading-5 font-medium">{name}</p>
              {account?.email && <p className="text-xs leading-none text-muted">{account.email}</p>}
            </div>
          </div>
        </div>
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Item id="account" key="account" textValue={t("navigation.account", "Tài khoản")}>
            <UserRound className="size-3.5 text-muted" />
            <Label>{t("navigation.account", "Tài khoản")}</Label>
          </Dropdown.Item>
          <Dropdown.Item id="tickets" key="tickets" textValue={t("navigation.myTickets", "Vé của tôi")}>
            <Ticket className="size-3.5 text-muted" />
            <Label>{t("navigation.myTickets", "Vé của tôi")}</Label>
          </Dropdown.Item>
          <Dropdown.Item id="organizer-events" key="organizer-events" textValue={t("navigation.myEvents", "Sự kiện của tôi")}>
            <CalendarDays className="size-3.5 text-muted" />
            <Label>{t("navigation.myEvents", "Sự kiện của tôi")}</Label>
          </Dropdown.Item>
          <Dropdown.Item id="notifications" key="notifications" textValue={t("navigation.notifications", "Thông báo")}>
            <Bell className="size-3.5 text-muted" />
            <Label>{t("navigation.notifications", "Thông báo")}</Label>
            {unreadNotifications > 0 && (
              <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                {unreadNotifications}
              </span>
            )}
          </Dropdown.Item>
          <Dropdown.Item id="settings" key="settings" textValue={t("navigation.settings", "Cài đặt")}>
            <Settings className="size-3.5 text-muted" />
            <Label>{t("navigation.settings", "Cài đặt")}</Label>
          </Dropdown.Item>
          <Dropdown.Item id="logout" key="logout" textValue={t("navigation.logout", "Đăng xuất")} variant="danger">
            <LogOut className="size-3.5 text-danger" />
            <Label>{t("navigation.logout", "Đăng xuất")}</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

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
          <OrganizerAccountMenu />
        </div>
      </div>
    </header>
  );
}
