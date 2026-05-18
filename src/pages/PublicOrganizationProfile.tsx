import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Avatar, Button, Card } from "@heroui/react";
import { ArrowLeft, BadgeCheck, Globe, Users } from "lucide-react";

import { getOrganizationInfo, getOrganizationInfoByAlias } from "../api/public";
import type { PublicOrganizationInfo } from "../types/requestDto";

export default function PublicOrganizationProfile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [organization, setOrganization] = useState<PublicOrganizationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const trimmed = orgSlug?.trim() ?? "";
    if (!trimmed) {
      setError(t("organization.public.missing", "Organization not found."));
      setIsLoading(false);
      return;
    }

    const isNumeric = /^\d+$/.test(trimmed);

    (async () => {
      try {
        const data = isNumeric
          ? await getOrganizationInfo(Number(trimmed))
          : await getOrganizationInfoByAlias(trimmed);
        if (!isMounted) return;
        setOrganization(data ?? null);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setOrganization(null);
        setError(err instanceof Error ? err.message : t("organization.public.error", "Unable to load organization."));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [orgSlug, t]);

  const locale = i18n.language === "vn" ? "vi-VN" : "en-US";
  const followerText = useMemo(() => {
    const count = organization?.followerCount ?? 0;
    return new Intl.NumberFormat(locale).format(count);
  }, [organization?.followerCount, locale]);

  const titleText = t("organization.public.title", "Organization profile");
  const backLabel = t("organization.public.back", "Back to events");
  const websiteLabel = t("organization.public.website", "Website");
  const followersLabel = t("organization.public.followers", "Followers");
  const descriptionLabel = t("organization.public.description", "About");

  return (
    <main className="min-h-screen bg-surface-secondary/40 pb-10">
      <section className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 pb-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{titleText}</h1>
            <p className="text-sm text-muted">{organization?.name ?? ""}</p>
          </div>
          <Button
            type="button"
            variant="tertiary"
            className="border border-border"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
            {t("organization.public.loading", "Loading organization...")}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-danger">
            {error}
          </div>
        ) : !organization ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
            {t("organization.public.empty", "Organization data is unavailable.")}
          </div>
        ) : (
          <div className="space-y-5">
            <Card className="overflow-hidden border border-border">
              <div className="relative h-40 bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100">
                {organization.bannerUrl && (
                  <img
                    src={organization.bannerUrl}
                    alt={organization.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <Card.Content className="gap-4 p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar className="size-20 shrink-0">
                    <Avatar.Image src={organization.avatarUrl ?? ""} />
                  <Avatar.Fallback>
                    {(organization.name ?? "").slice(0, 2).toUpperCase() || "TR"}
                  </Avatar.Fallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-xl font-semibold text-foreground">
                        {organization.name}
                      </h2>
                      {organization.verified && (
                        <BadgeCheck className="size-5 text-success" />
                      )}
                    </div>
                    <p className="text-sm text-muted">@{organization.aliasName}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-surface-secondary px-3 py-1.5 text-sm font-medium text-foreground">
                    <Users className="size-4 text-muted" />
                    <span>{followerText}</span>
                    <span className="text-muted">{followersLabel}</span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
              <Card className="border border-border">
                <Card.Header className="border-b border-border pb-3">
                  <Card.Title className="text-base font-semibold">{descriptionLabel}</Card.Title>
                </Card.Header>
                <Card.Content>
                  <p className="text-sm leading-relaxed text-muted">
                    {organization.description || t("organization.public.noDescription", "No description yet.")}
                  </p>
                </Card.Content>
              </Card>

              <Card className="border border-border">
                <Card.Header className="border-b border-border pb-3">
                  <Card.Title className="text-base font-semibold">{websiteLabel}</Card.Title>
                </Card.Header>
                <Card.Content className="gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Globe className="size-4" />
                    {organization.websiteUrl ? (
                      <a
                        className="truncate text-sm font-semibold text-foreground underline decoration-transparent transition hover:decoration-foreground"
                        href={organization.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {organization.websiteUrl}
                      </a>
                    ) : (
                      <span>{t("organization.public.noWebsite", "No website provided")}</span>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
