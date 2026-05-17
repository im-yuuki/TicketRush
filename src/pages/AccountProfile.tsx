import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, Mail, MapPin, Phone, UserRound } from "lucide-react";

import { getUserInfo } from "../api/user";

type UserProfile = {
  name: string;
  email: string;
  phoneNumber: string;
  addressLine: string;
  birthDate: string;
  gender: string;
};

const emptyProfile: UserProfile = {
  name: "",
  email: "",
  phoneNumber: "",
  addressLine: "",
  birthDate: "",
  gender: "",
};

export default function AccountProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await getUserInfo();
        if (!isMounted) return;

        const payload = response ?? emptyProfile;
        setProfile({
          name: String(payload?.name ?? ""),
          email: String(payload?.email ?? ""),
          phoneNumber: String(payload?.phoneNumber ?? ""),
          addressLine: String(payload?.addressLine ?? ""),
          birthDate: String(payload?.birthDate ?? ""),
          gender: String(payload?.gender ?? ""),
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

  function formatDate(raw: string) {
    if (!raw) return "";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  function titleCase(raw: string) {
    if (!raw) return "";
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }

  const titleText = t("account.title", "Account Profile");
  const subtitleText = t("account.subtitle", "Your personal account details");
  const details = useMemo(
    () => [
      {
        label: t("account.name", "Full name"),
        value: profile.name,
        icon: UserRound,
      },
      {
        label: t("account.email", "Email"),
        value: profile.email,
        icon: Mail,
      },
      {
        label: t("account.phone", "Phone"),
        value: profile.phoneNumber,
        icon: Phone,
      },
      {
        label: t("account.address", "Address"),
        value: profile.addressLine,
        icon: MapPin,
      },
      {
        label: t("account.birthDate", "Birth date"),
        value: formatDate(profile.birthDate),
        icon: CalendarDays,
      },
      {
        label: t("account.gender", "Gender"),
        value: titleCase(profile.gender),
        icon: UserRound,
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
            {t("account.loading", "Loading profile...")}
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
          </div>
        )}
      </section>
    </main>
  );
}
