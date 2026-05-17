import { Button, Drawer, Dropdown, Label } from "@heroui/react";
import { Logo } from "./Branding.tsx";
import { Menu } from "lucide-react";

import { useEffect, type Key, type Ref } from "react";
import { useTranslation } from "react-i18next";
import { languageOptions, changeLanguage, getLanguage } from "../i18n";
import { Link } from "react-router";
import AccountButton from "./AccountButton";

function LanguageSelector() {
  const { i18n } = useTranslation();
  const language = getLanguage(i18n.language) ?? languageOptions[0];

  function handleLanguageChange(key: Key) {
    changeLanguage(key.toString());
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
