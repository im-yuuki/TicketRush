import { Avatar, Badge, Button, Dropdown, Label } from "@heroui/react";
import { Bell, CalendarDays, ChevronDown, LogOut, Settings, ShieldCheck, Ticket, UserRound } from "lucide-react";
import { type Key } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

type Variant = "compact" | "full";

export default function AccountButton({ variant = "compact" }: { variant?: Variant }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account, isAuthenticated, logout } = useAuth();
  const loginText = t("navigation.login", "Login");
  const unreadNotifications = 5;

  const accountText = t("navigation.account", "Account");
  const myTicketsText = t("navigation.myTickets", "My Tickets");
  const myEventsText = t("navigation.myEvents", "My Events");
  const adminText = t("navigation.admin", "Administration");
  const notificationsText = t("navigation.notifications", "Notifications");
  const settingsText = t("navigation.settings", "Settings");
  const logoutText = t("navigation.logout", "Logout");

  const loggedIn = isAuthenticated;
  const isOrganization = account?.role === "ORGANIZATION";
  const isUser = account?.role === "USER";
  const isAdmin = account?.role === "ADMINISTRATOR";
  const userFullName = account?.displayName ?? "";
  const userEmail = account?.email ?? "";
  const userShortName = userFullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const accountRoutes: Record<string, string> = {
    account: isOrganization ? "/organizer/profile" : "/account",
    tickets: "/my-tickets",
    "organizer-events": "/organizer/events",
    admin: "/admin",
    settings: isOrganization ? "/organizer/settings" : "/settings",
  };

  async function handleAccountAction(key: Key) {
    const route = accountRoutes[key.toString()];
    if (route) {
      navigate(route);
      return;
    }

    if (key.toString() === "logout") {
      await logout();
      navigate("/login");
    }
  }

  if (loggedIn) {
    const UserAvatar = (
      <Avatar className="select-none size-9 rounded-full">
        <Avatar.Image src={account?.avatarUrl ?? ""} />
        <Avatar.Fallback>{userShortName}</Avatar.Fallback>
      </Avatar>
    );
    return (
      <Dropdown>
        <Dropdown.Trigger>
          {variant === "full" ? (
            <button
              type="button"
              aria-label={accountText}
              className="flex h-11 items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-foreground transition-colors hover:bg-surface-secondary"
            >
              {UserAvatar}
              <span className="hidden sm:inline">{userFullName}</span>
              <ChevronDown className="size-4" />
            </button>
          ) : (
            <Badge.Anchor>
              {UserAvatar}
              {unreadNotifications > 0 && (
                <Badge color="accent" size="sm" className="select-none">
                  {unreadNotifications}
                </Badge>
              )}
            </Badge.Anchor>
          )}
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-2">
              {UserAvatar}
              <div className="flex flex-col gap-0">
                <p className="text-sm leading-5 font-medium">{userFullName}</p>
                {userEmail && <p className="text-xs leading-none text-muted">{userEmail}</p>}
              </div>
            </div>
          </div>
          <Dropdown.Menu onAction={handleAccountAction}>
            <Dropdown.Item id="account" key="account" textValue={accountText}>
              <UserRound className="size-3.5 text-muted" />
              <Label>{accountText}</Label>
            </Dropdown.Item>
            {isUser && (
              <Dropdown.Item id="tickets" key="tickets" textValue={myTicketsText}>
                <Ticket className="size-3.5 text-muted" />
                <Label>{myTicketsText}</Label>
              </Dropdown.Item>
            )}
            {isOrganization && (
              <Dropdown.Item id="organizer-events" key="organizer-events" textValue={myEventsText}>
                <CalendarDays className="size-3.5 text-muted" />
                <Label>{myEventsText}</Label>
              </Dropdown.Item>
            )}
            {isAdmin && (
              <Dropdown.Item id="admin" key="admin" textValue={adminText}>
                <ShieldCheck className="size-3.5 text-muted" />
                <Label>{adminText}</Label>
              </Dropdown.Item>
            )}
            <Dropdown.Item id="notifications" key="notifications" textValue={notificationsText}>
              <Bell className="size-3.5 text-muted" />
              <Label>{notificationsText}</Label>
            </Dropdown.Item>
            <Dropdown.Item id="settings" key="settings" textValue={settingsText}>
              <Settings className="size-3.5 text-muted" />
              <Label>{settingsText}</Label>
            </Dropdown.Item>
            <Dropdown.Item id="logout" key="logout" textValue={logoutText} variant="danger">
              <LogOut className="size-3.5 text-danger" />
              <Label>{logoutText}</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    );
  }

  return (
    <Link to="/login">
      <Button>
        <UserRound />
        <div className="hidden md:inline">{loginText}</div>
      </Button>
    </Link>
  );
}