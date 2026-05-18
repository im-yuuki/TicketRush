import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Mail, Pencil, Tag, UserRound } from "lucide-react";

import { getOrganizationInfo, updateOrganizationInfo } from "../api/organization";

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

  const [editAlias, setEditAlias] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editingField, setEditingField] = useState<"alias" | "description" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const hasChanges = editAlias !== profile.aliasName || editDescription !== profile.description;

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await getOrganizationInfo();
        if (!isMounted) return;

        const payload = response ?? emptyProfile;
        const data: OrganizationProfile = {
          name: String(payload?.name ?? ""),
          email: String(payload?.email ?? ""),
          aliasName: String(payload?.aliasName ?? ""),
          websiteUrl: String(payload?.websiteUrl ?? ""),
          description: String(payload?.description ?? ""),
        };
        setProfile(data);
        setEditAlias(data.aliasName);
        setEditDescription(data.description);
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

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await updateOrganizationInfo({
        aliasName: editAlias,
        description: editDescription,
      });
      setProfile((prev) => ({
        ...prev,
        aliasName: editAlias,
        description: editDescription,
      }));
      setSaveMessage({ type: "success", text: t("organization.profile.saveSuccess", "Changes saved successfully!") });
    } catch {
      setSaveMessage({ type: "error", text: t("organization.profile.saveError", "Failed to save changes. Please try again.") });
    } finally {
      setIsSaving(false);
    }
  }, [editAlias, editDescription, t]);

  const titleText = t("organization.profile.title", "Organization Profile");
  const subtitleText = t("organization.profile.subtitle", "Public organization details");
  const details = useMemo(
    () => [
      {
        label: t("organization.profile.name", "Organization name"),
        value: profile.name,
        icon: UserRound,
        editable: false as const,
      },
      {
        label: t("organization.profile.email", "Email"),
        value: profile.email,
        icon: Mail,
        editable: false as const,
      },
      {
        label: t("organization.profile.alias", "Alias"),
        value: editAlias,
        icon: Tag,
        editable: true as const,
        field: "alias" as const,
      },
      {
        label: t("organization.profile.website", "Website"),
        value: profile.websiteUrl,
        icon: Globe,
        editable: false as const,
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
              const isEditing = item.editable && editingField === item.field;

              return (
                <div key={item.label} className="rounded-xl border border-border bg-surface px-4 py-4">
                  <div className="flex items-center gap-3 text-sm text-muted">
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                    {item.editable && !isEditing && (
                      <button
                        type="button"
                        className="ml-auto text-muted transition hover:text-foreground"
                        onClick={() => setEditingField(item.field)}
                        aria-label={t("organization.profile.editField", "Edit {{field}}", { field: item.label })}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    )}
                  </div>
                  {isEditing && item.field === "alias" ? (
                    <input
                      autoFocus
                      className="mt-2 w-full rounded-lg border border-primary bg-surface px-3 py-2 text-base font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                      value={editAlias}
                      onChange={(e) => setEditAlias(e.target.value)}
                      onBlur={() => setEditingField(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingField(null);
                        if (e.key === "Escape") {
                          setEditAlias(profile.aliasName);
                          setEditingField(null);
                        }
                      }}
                    />
                  ) : (
                    <p
                      className={`mt-2 text-base font-semibold text-foreground ${item.editable ? "cursor-pointer rounded-lg px-3 py-2 transition hover:bg-surface-secondary/50" : "px-3 py-2"}`}
                      onClick={item.editable ? () => setEditingField(item.field) : undefined}
                      role={item.editable ? "button" : undefined}
                      tabIndex={item.editable ? 0 : undefined}
                      onKeyDown={
                        item.editable
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") setEditingField(item.field);
                            }
                          : undefined
                      }
                    >
                      {item.value || (
                        <span className="text-muted italic">
                          {t("organization.profile.clickToEdit", "Click to add")}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Description field */}
            <div className="rounded-xl border border-border bg-surface px-4 py-4">
              <div className="flex items-center gap-3 text-sm text-muted">
                <UserRound className="size-4" />
                <span>{t("organization.profile.description", "Description")}</span>
                {editingField !== "description" && (
                  <button
                    type="button"
                    className="ml-auto text-muted transition hover:text-foreground"
                    onClick={() => setEditingField("description")}
                    aria-label={t("organization.profile.editField", "Edit {{field}}", { field: "Description" })}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                )}
              </div>
              {editingField === "description" ? (
                <textarea
                  autoFocus
                  className="mt-2 w-full rounded-lg border border-primary bg-surface px-3 py-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[100px]"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setEditDescription(profile.description);
                      setEditingField(null);
                    }
                  }}
                />
              ) : (
                <p
                  className="mt-2 cursor-pointer rounded-lg px-3 py-2 text-base text-foreground transition hover:bg-surface-secondary/50"
                  onClick={() => setEditingField("description")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setEditingField("description");
                  }}
                >
                    {editDescription || (
                      <span className="text-muted italic">
                        {t("organization.profile.clickToEdit", "Click to add")}
                      </span>
                  )}
                </p>
              )}
            </div>

            {/* Save button */}
            {hasChanges && (
              <div className="flex flex-col items-end gap-2">
                {saveMessage && (
                  <p className={`text-sm ${saveMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
                    {saveMessage.text}
                  </p>
                )}
                <button
                  type="button"
                  disabled={isSaving}
                  className="rounded-lg bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleSave}
                >
                  {isSaving
                    ? t("organization.profile.saving", "Saving...")
                    : t("organization.profile.saveChanges", "Save changes")}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
