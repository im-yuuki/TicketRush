import { Avatar, Badge, Button, Drawer, Dropdown, Label } from "@heroui/react";
import { Logo } from "./Branding.tsx";
import { Bell, CalendarDays, LogOut, Menu, Settings, Ticket, UserRound } from "lucide-react";

import { useEffect, useState, type Key, type Ref } from "react";
import { useTranslation } from "react-i18next";
import { languageOptions, changeLanguage, getCurrentLanguage } from "../i18n";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [ language, setLanguage ] = useState(getCurrentLanguage());

  function handleLanguageChange(key: Key) {
    const selectedLanguage = changeLanguage(key.toString());
    if (selectedLanguage) setLanguage(selectedLanguage);
  }

  useEffect(() => {
    document.body.dir = i18n.dir();
  }, [ i18n, i18n.language ]);

  return (
    <Dropdown>
      <Button variant="tertiary">
        <img src={language.icon} className="size-4 rounded-full" alt={language.name} />
        <span className="hidden lg:inline">{language.name}</span>
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          onAction={handleLanguageChange}
          selectionMode="single"
          selectedKeys={new Set([ language.code ])}
        >
          {languageOptions.map((option) => (
            <Dropdown.Item id={option.code} key={option.code} textValue={option.name}>
              <Dropdown.ItemIndicator />
              <img src={option.icon} className="size-4 rounded-full" alt={option.name} />
              <Label>{option.name}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

function SideMenu() {
  // const { t } = useTranslation();
  return (
    <Drawer>
      <Dropdown.Trigger className="lg:hidden">
        <Button variant="tertiary" isIconOnly={true}>
          <Menu />
        </Button>
      </Dropdown.Trigger>
      <Drawer.Backdrop>
        <Drawer.Content placement="left">
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

function AccountButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account, isAuthenticated, logout } = useAuth();
  const loginText = t("navigation.login", "Login");
  const unreadNotifications = 5;

  const accountText = t("navigation.account", "Account");
  const myTicketsText = t("navigation.myTickets", "My Tickets");
  const myEventsText = t("navigation.myEvents", "Sự kiện của tôi");
  const notificationsText = t("navigation.notifications", "Notifications");
  const settingsText = t("navigation.settings", "Settings");
  const logoutText = t("navigation.logout", "Logout");

  const loggedIn = isAuthenticated;
  const isOrganization = account?.role === "ORGANIZATION";
  const isUser = account?.role === "USER";
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
    tickets: "/my-tickets",
    "organizer-events": "/organizer/events",
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
          <Badge.Anchor>
            {UserAvatar}
            {unreadNotifications > 0 && (
              <Badge color="accent" size="sm" className="select-none">
                {unreadNotifications}
              </Badge>
            )}
          </Badge.Anchor>
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
  } else {
    return (
      <Link to="/login">
        <Button>
          <UserRound />
          <div className="hidden md:inline">{loginText}</div>
        </Button>
      </Link>
    );
  }
}

export default function NavBar({ className, ref }: { className?: string, ref?: Ref<HTMLElement> | undefined }) {
  return (
    <nav className={className} ref={ref}>
      <div className="container mx-auto p-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <SideMenu />
          <Link to="/">
            <Logo className="text-2xl md:text-3xl" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <AccountButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
