import { Avatar, Badge, Button, Drawer, Dropdown, Label } from "@heroui/react";
import { Logo } from "../components/Branding";
import { Bell, LogOut, Menu, Settings, Ticket, UserRound } from "lucide-react";

import { useEffect, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { languageOptions, changeLanguage, getCurrentLanguage } from "../i18n";
import { Link } from "react-router";

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(getCurrentLanguage());

  function handleLanguageChange(key: Key) {
    const selectedLanguage = changeLanguage(key.toString());
    if (selectedLanguage) setLanguage(selectedLanguage);
  }

  useEffect(() => {
    document.body.dir = i18n.dir();
  }, [i18n, i18n.language]);

  return (
    <Dropdown>
      <Button variant="tertiary">
        <img src={language.icon} className="size-4 rounded-full" />
        <span className="hidden lg:inline">{language.name}</span>
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          onAction={handleLanguageChange}
          selectionMode="single"
          selectedKeys={new Set([language.code])}
        >
          {languageOptions.map((option) => (
            <Dropdown.Item id={option.code} key={option.code} textValue={option.name}>
              <Dropdown.ItemIndicator />
              <img src={option.icon} className="size-4 rounded-full" />
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
          {/* <Label className="hidden md:inline">{menuText}</Label> */}
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
  const loggedIn = true; // TODO: Replace with actual authentication state
  const userFullName = "Test User";
  const userEmail = "test@example.com";
  const loginText = t("navigation.login", "Login");
  const unreadNotifications = 5;

  const account = t("navigation.account", "Account");
  const myTickets = t("navigation.myTickets", "My Tickets");
  const notifications = t("navigation.notifications", "Notifications");
  const settings = t("navigation.settings", "Settings");
  const logout = t("navigation.logout", "Logout");

  const userShortName = userFullName.split(" ").map((n) => n[0]).join("");

  if (loggedIn) {
    const UserAvatar = (
      <Avatar className="select-none">
        <Avatar.Image src="" />
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
                <p className="text-xs leading-none text-muted">{userEmail}</p>
              </div>
            </div>
          </div>
          <Dropdown.Menu>
            <Dropdown.Item key="account" textValue="Account">
              <UserRound className="size-3.5 text-muted" />
              <Label>{account}</Label>
            </Dropdown.Item>
            <Dropdown.Item key="tickets" textValue="My Tickets">
              <Ticket className="size-3.5 text-muted" />
              <Label>{myTickets}</Label>
            </Dropdown.Item>
            <Dropdown.Item key="notifications" textValue="Notifications">
              <Bell className="size-3.5 text-muted" />
              <Label>{notifications}</Label>
            </Dropdown.Item>
            <Dropdown.Item key="settings" textValue="Settings">
              <Settings className="size-3.5 text-muted" />
              <Label>{settings}</Label>
            </Dropdown.Item>
            <Dropdown.Item key="logout" textValue="Logout" variant="danger">
              <LogOut className="size-3.5 text-danger" />
              <Label>{logout}</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    );
  } else {
    return (
      <Button>
        <UserRound />
        <div className="hidden md:inline">{loginText}</div>
      </Button>
    );
  }
}

export default function NavBar({ className }: { className?: string }) {
  return (
    <nav className={className}>
      <div className="container mx-auto px-10 py-4">
        <div className="flex items-center justify-between">
          <SideMenu />
          <Link to="/">
            <Logo height={40} />
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
