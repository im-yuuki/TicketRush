import { Button, Drawer } from "@heroui/react";
import { Logo } from "../components/Branding";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { LogIn, Menu } from "lucide-react";


export function NavigationBar() {
  const { t } = useTranslation();
  const menuText = t("navigation.menu", "Menu");
  const loginText = t("navigation.login", "Login");

  return (
    <nav className="border-b-2 border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Drawer>
            <Button variant="ghost" className="md:hidden">
              <Menu />
              {menuText}
            </Button>
            <Drawer.Backdrop>
              <Drawer.Content placement="left">
                <Drawer.Dialog>
                  <Drawer.CloseTrigger />
                </Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          </Drawer>
          <Logo height={40} />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button>
              <LogIn />
              <div className="hidden md:inline">{loginText}</div>
            </Button>
          </div>

        </div>
      </div>
    </nav>
  );
}
