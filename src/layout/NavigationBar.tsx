import { Button } from "@heroui/react";
import { Logo } from "../components/Branding";
import LanguageSelector from "../components/LanguageSelector";
import { ArrowRightEndOnRectangleIcon, Bars3CenterLeftIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export function NavigationBar() {
  const { t } = useTranslation();
  const menuText = t("navigation.menu", "Menu");
  const loginText = t("navigation.login", "Login");

  return (
    <nav className="border-b-2 border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Button variant="ghost" className="md:hidden">
            <Bars3CenterLeftIcon />
            {menuText}
          </Button>
          <Logo height={40} />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button>
              <ArrowRightEndOnRectangleIcon />
              <div className="hidden md:inline">{loginText}</div>
            </Button>
          </div>

        </div>
      </div>
    </nav>
  );
}
