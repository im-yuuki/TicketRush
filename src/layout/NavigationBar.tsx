import { Avatar, Badge, Button, Drawer, Dropdown, Label } from "@heroui/react";
import { Logo } from "../components/Branding";
import { Bell, LogOut, Menu, Settings, Ticket, UserRound } from "lucide-react";

import { useEffect, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { languageOptions, changeLanguage, getCurrentLanguage } from "../i18n";

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
  const { t } = useTranslation();
  const menuText = t("navigation.menu", "Menu");
  return (
    <Drawer>
      <Dropdown.Trigger className="md:hidden">
        <Button variant="ghost">
          <Menu />
          <Label>{menuText}</Label>
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
              <Badge color="accent" size="sm">
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
              <Label>Account</Label>
            </Dropdown.Item>
            <Dropdown.Item key="tickets" textValue="My Tickets">
              <Ticket className="size-3.5 text-muted" />
              <Label>My Tickets</Label>
            </Dropdown.Item>
            <Dropdown.Item key="notifications" textValue="Notifications">
              <Bell className="size-3.5 text-muted" />
              <Label>Notifications</Label>
            </Dropdown.Item>
            <Dropdown.Item key="settings" textValue="Settings">
              <Settings className="size-3.5 text-muted" />
              <Label>Settings</Label>
            </Dropdown.Item>
            <Dropdown.Item key="logout" textValue="Logout" variant="danger">
              <LogOut className="size-3.5 text-danger" />
              <Label>Logout</Label>
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

export default function NavigationBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-lg">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <SideMenu />
          <Logo height={40} />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <AccountButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
