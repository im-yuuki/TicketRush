import { useTranslation } from "react-i18next";
import OrganizerPageShell from "../../components/organizer/OrganizerPageShell";
import AccountSettingsSections from "../../components/AccountSettingsSections";

export default function OrganizerSettings() {
  const { t } = useTranslation();

  return (
    <OrganizerPageShell>
      <section className="min-w-0">
        <header className="flex flex-col gap-2 pb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {t("organizer.settings.title", "Organizer Settings")}
          </h1>
          <p className="text-sm text-muted">
            {t("organizer.settings.subtitle", "Manage organization preferences")}
          </p>
        </header>
        <AccountSettingsSections />
      </section>
    </OrganizerPageShell>
  );
}
