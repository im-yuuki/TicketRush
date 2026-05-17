import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Mail, Tag, UserRound } from "lucide-react";

import { getOrganizationInfo } from "../api/organization";

type OrganizationProfile = {
  name: string;
  email: string;
  aliasName: string;
  websiteUrl: string;
  description: string;
};

const emptyProfile: OrganizationProfile = {
  name: "",
  email: "",
  aliasName: "",
  websiteUrl: "",
  description: "",
};

export default function OrganizationProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<OrganizationProfile>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await getOrganizationInfo();
        if (!isMounted) return;

        const payload = response ?? emptyProfile;
        setProfile({
          name: String(payload?.name ?? ""),
          email: String(payload?.email ?? ""),
          aliasName: String(payload?.aliasName ?? ""),
          websiteUrl: String(payload?.websiteUrl ?? ""),
          description: String(payload?.description ?? ""),
        });
      } catch (error) {
        if (!isMounted) return;
        setProfile(emptyProfile);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const titleText = t("organization.profile.title", "Organization Profile");
  const subtitleText = t("organization.profile.subtitle", "Public organization details");
  const details = useMemo(
    () => [
      {
        label: t("organization.profile.name", "Organization name"),
        value: profile.name,
        icon: UserRound,
      },
      {
        label: t("organization.profile.email", "Email"),
        value: profile.email,
        icon: Mail,
      },
      {
        label: t("organization.profile.alias", "Alias"),
        value: profile.aliasName,
        icon: Tag,
      },
      {
        label: t("organization.profile.website", "Website"),
        value: profile.websiteUrl,
        icon: Globe,
      },
    ],
    [profile, t],
  );

  return (
    <main className="min-h-screen bg-surface-secondary/40 pb-10">
      <section className="mx-auto w-full max-w-4xl px-4 pt-6 md:px-6 lg:px-8">
        <header className="flex flex-col gap-2 pb-6">
          <h1 className="text-3xl font-semibold text-foreground">{titleText}</h1>
          <p className="text-sm text-muted">{subtitleText}</p>
        </header>

        {isLoading ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
            {t("organization.profile.loading", "Loading profile...")}
          </div>
        ) : (
          <div className="grid gap-4">
            {details.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-border bg-surface px-4 py-4">
                  <div className="flex items-center gap-3 text-sm text-muted">
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {item.value || "-"}
                  </p>
                </div>
              );
            })}
            <div className="rounded-xl border border-border bg-surface px-4 py-4">
              <div className="flex items-center gap-3 text-sm text-muted">
                <UserRound className="size-4" />
                <span>{t("organization.profile.description", "Description")}</span>
              </div>
              <p className="mt-2 text-base text-foreground">
                {profile.description || "-"}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
