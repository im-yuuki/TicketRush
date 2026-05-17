import { useTranslation } from "react-i18next";
import AccountSettingsSections from "../components/AccountSettingsSections";

export default function Settings() {
  const { t } = useTranslation();
  const titleText = t("settings.title", "Settings");
  const subtitleText = t("settings.subtitle", "Manage your account preferences");

  return (
    <main className="min-h-screen bg-surface-secondary/40 pb-10">
      <section className="mx-auto w-full max-w-4xl px-4 pt-6 md:px-6 lg:px-8">
        <header className="flex flex-col gap-2 pb-6">
          <h1 className="text-3xl font-semibold text-foreground">{titleText}</h1>
          <p className="text-sm text-muted">{subtitleText}</p>
        </header>
        <AccountSettingsSections />
      </section>
    </main>
  );
}
