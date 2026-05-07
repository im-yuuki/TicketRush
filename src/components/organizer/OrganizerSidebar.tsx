import { Button, Dropdown, Label } from "@heroui/react";
import { CalendarDays, FileText, FolderOpen } from "lucide-react";
import { useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router";
import { changeLanguage, getCurrentLanguage, languageOptions } from "../../i18n";
import { Logo } from "../Branding";

const navItems = [
  { to: "/organizer/events", icon: CalendarDays, labelKey: "myEvents" },
  { to: "/organizer/reports", icon: FolderOpen, labelKey: "reports" },
  { to: "/organizer/terms", icon: FileText, labelKey: "terms" },
];

function OrganizerLanguageSwitch() {
  const { t } = useTranslation();
  const [language, setLanguage] = useState(getCurrentLanguage());

  function handleLanguageChange(key: Key) {
    const selectedLanguage = changeLanguage(key.toString());
    if (selectedLanguage) setLanguage(selectedLanguage);
  }

  return (
    <div className="flex items-center justify-between gap-3 text-foreground">
      <span className="text-sm font-semibold">
        {t("organizer.layout.language", "Ngôn ngữ")}
      </span>
      <Dropdown>
        <Dropdown.Trigger>
          <Button size="sm" variant="tertiary" className="rounded-full bg-surface-secondary px-3">
            <span>{language.code === "vn" ? "Vie" : "Eng"}</span>
            <img src={language.icon} className="size-4 rounded-full" alt={language.name} />
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu
            onAction={handleLanguageChange}
            selectionMode="single"
            selectedKeys={new Set([language.code])}
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
    </div>
  );
}

export default function OrganizerSidebar() {
  const { t } = useTranslation();

  return (
    <aside className="border-b border-border bg-surface lg:min-h-dvh lg:border-r lg:border-b-0">
      <div className="flex h-full flex-col bg-gradient-to-b from-[#0b1f15] via-surface to-surface p-0 lg:fixed lg:inset-y-0 lg:left-0 lg:w-[252px]">
        <Link
          to="/organizer/events"
          className="flex h-16 flex-col items-center justify-center gap-0.5 border-b border-border px-4 transition-colors hover:bg-surface-secondary"
        >
          <Logo className="text-2xl" />
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted">
            {t("organizer.layout.center", "Organizer Center")}
          </span>
        </Link>

        <nav className="grid gap-2 py-6">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={false}
              className={({ isActive }) =>
                `flex min-h-14 items-center gap-4 px-5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-surface-secondary text-foreground"
                    : "text-muted hover:bg-surface-secondary/60 hover:text-foreground"
                }`
              }
            >
              <Icon className="size-5 shrink-0" />
              {t(`organizer.layout.nav.${labelKey}`)}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-border p-4 lg:block">
          <OrganizerLanguageSwitch />
        </div>
      </div>
    </aside>
  );
}

export { OrganizerLanguageSwitch };
