import { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Card, Checkbox, Input } from "@heroui/react";
import { useTranslation } from "react-i18next";

import { changeName, changePassword } from "../api/account";
import { updateUserAvatar } from "../api/user";
import { updateOrganizationAvatar } from "../api/organization";
import { useAuth } from "../contexts/AuthContext";
import { getAccount } from "../api/auth";

const UI_SETTINGS_KEY = "ticketrush.ui.settings";

type UiSettings = {
  reduceMotion: boolean;
  compactDensity: boolean;
  highContrast: boolean;
};

const defaultUiSettings: UiSettings = {
  reduceMotion: false,
  compactDensity: false,
  highContrast: false,
};

function readUiSettings(): UiSettings {
  if (typeof window === "undefined") return defaultUiSettings;

  try {
    const raw = window.localStorage.getItem(UI_SETTINGS_KEY);
    if (!raw) return defaultUiSettings;
    const parsed = JSON.parse(raw) as Partial<UiSettings>;
    return {
      ...defaultUiSettings,
      ...parsed,
    };
  } catch {
    return defaultUiSettings;
  }
}

function applyUiSettings(settings: UiSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("ui-reduce-motion", settings.reduceMotion);
  root.classList.toggle("ui-compact", settings.compactDensity);
  root.classList.toggle("ui-high-contrast", settings.highContrast);
}

function persistUiSettings(settings: UiSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(settings));
}

export default function AccountSettingsSections() {
  const { t } = useTranslation();
  const { account, setAccount } = useAuth();

  const [displayName, setDisplayName] = useState(account?.displayName ?? "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameStatus, setNameStatus] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [uiSettings, setUiSettings] = useState<UiSettings>(defaultUiSettings);

  useEffect(() => {
    setDisplayName(account?.displayName ?? "");
  }, [account?.displayName]);

  useEffect(() => {
    const stored = readUiSettings();
    setUiSettings(stored);
    applyUiSettings(stored);
  }, []);

  const passwordMismatch = useMemo(() => {
    return confirmPassword.length > 0 && newPassword !== confirmPassword;
  }, [confirmPassword, newPassword]);

  const isOrganization = account?.role === "ORGANIZATION";

  async function handleNameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameError(null);
    setNameStatus(null);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setNameError(t("settings.nameRequired", "Name is required."));
      return;
    }

    setIsSavingName(true);
    try {
      await changeName({ newName: trimmedName });
      if (account) {
        setAccount({ ...account, displayName: trimmedName });
      }
      setNameStatus(t("settings.nameSaved", "Name updated."));
    } catch (error) {
      setNameError(t("settings.nameError", "Could not update name."));
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setAvatarStatus(null);
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (isOrganization) {
        await updateOrganizationAvatar(formData);
      } else {
        await updateUserAvatar(formData);
      }

      const refreshed = await getAccount();
      setAccount({
        displayName: refreshed.name,
        email: refreshed.email,
        avatarUrl: "avatarUrl" in refreshed ? refreshed.avatarUrl : undefined,
        role: refreshed.role,
      });
      setAvatarStatus(t("settings.avatarSaved", "Avatar updated."));
      event.currentTarget.value = "";
    } catch (error) {
      setAvatarError(t("settings.avatarError", "Could not update avatar."));
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordStatus(null);

    if (!currentPassword || !newPassword) {
      setPasswordError(t("settings.passwordRequired", "Please fill all password fields."));
      return;
    }

    if (passwordMismatch) {
      setPasswordError(t("settings.passwordMismatch", "Passwords do not match."));
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus(t("settings.passwordSaved", "Password updated."));
    } catch (error) {
      setPasswordError(t("settings.passwordError", "Could not update password."));
    } finally {
      setIsSavingPassword(false);
    }
  }

  function handleUiSettingChange(next: Partial<UiSettings>) {
    const updated = { ...uiSettings, ...next };
    setUiSettings(updated);
    persistUiSettings(updated);
    applyUiSettings(updated);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <Card.Header className="flex flex-col gap-2 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {t("settings.profileTitle", "Profile")}
          </h2>
          <p className="text-sm text-muted">
            {t("settings.profileSubtitle", "Update your public display name.")}
          </p>
        </Card.Header>
        <Card.Content className="pt-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-14 rounded-full">
                <Avatar.Image src={account?.avatarUrl ?? ""} />
                <Avatar.Fallback>{(account?.displayName ?? "").slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("settings.avatarTitle", "Profile photo")}
                </p>
                <p className="text-xs text-muted">
                  {t("settings.avatarSubtitle", "PNG or JPG up to 5MB.")}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleAvatarChange}
                className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
              {avatarError && <p className="text-danger text-xs">{avatarError}</p>}
              {avatarStatus && <p className="text-success text-xs">{avatarStatus}</p>}
            </div>
          </div>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">{t("settings.displayName", "Display name")}</label>
              <Input
                type="text"
                value={displayName}
                onInput={(event) => setDisplayName(event.currentTarget.value)}
                className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                required
              />
            </div>
            {nameError && <p className="text-danger text-sm">{nameError}</p>}
            {nameStatus && <p className="text-success text-sm">{nameStatus}</p>}
            <Button
              type="submit"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              isDisabled={isSavingName || isUploadingAvatar}
            >
              {isSavingName
                ? t("settings.saving", "Saving...")
                : t("settings.saveName", "Save name")}
            </Button>
          </form>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="flex flex-col gap-2 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {t("settings.passwordTitle", "Password")}
          </h2>
          <p className="text-sm text-muted">
            {t("settings.passwordSubtitle", "Change your account password.")}
          </p>
        </Card.Header>
        <Card.Content className="pt-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">{t("settings.currentPassword", "Current password")}</label>
              <Input
                type="password"
                value={currentPassword}
                onInput={(event) => setCurrentPassword(event.currentTarget.value)}
                className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">{t("settings.newPassword", "New password")}</label>
              <Input
                type="password"
                value={newPassword}
                onInput={(event) => setNewPassword(event.currentTarget.value)}
                className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">{t("settings.confirmPassword", "Confirm new password")}</label>
              <Input
                type="password"
                value={confirmPassword}
                onInput={(event) => setConfirmPassword(event.currentTarget.value)}
                className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                required
              />
            </div>
            {passwordMismatch && (
              <p className="text-danger text-sm">{t("settings.passwordMismatch", "Passwords do not match.")}</p>
            )}
            {passwordError && <p className="text-danger text-sm">{passwordError}</p>}
            {passwordStatus && <p className="text-success text-sm">{passwordStatus}</p>}
            <Button
              type="submit"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              isDisabled={isSavingPassword || passwordMismatch}
            >
              {isSavingPassword
                ? t("settings.saving", "Saving...")
                : t("settings.savePassword", "Update password")}
            </Button>
          </form>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="flex flex-col gap-2 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {t("settings.uiTitle", "UI settings")}
          </h2>
          <p className="text-sm text-muted">
            {t("settings.uiSubtitle", "Personalize the interface to your preference.")}
          </p>
        </Card.Header>
        <Card.Content className="pt-6">
          <div className="grid gap-4">
            <Checkbox
              isSelected={uiSettings.reduceMotion}
              onChange={(value) => handleUiSettingChange({ reduceMotion: value })}
              className="items-start"
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-foreground">
                    {t("settings.reduceMotion", "Reduce motion")}
                  </span>
                  <p className="text-xs text-muted">
                    {t("settings.reduceMotionHelp", "Minimize animations across the app.")}
                  </p>
                </div>
              </Checkbox.Content>
            </Checkbox>

            <Checkbox
              isSelected={uiSettings.compactDensity}
              onChange={(value) => handleUiSettingChange({ compactDensity: value })}
              className="items-start"
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-foreground">
                    {t("settings.compactDensity", "Compact density")}
                  </span>
                  <p className="text-xs text-muted">
                    {t("settings.compactDensityHelp", "Tighten spacing in cards and forms.")}
                  </p>
                </div>
              </Checkbox.Content>
            </Checkbox>

            <Checkbox
              isSelected={uiSettings.highContrast}
              onChange={(value) => handleUiSettingChange({ highContrast: value })}
              className="items-start"
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-foreground">
                    {t("settings.highContrast", "High contrast")}
                  </span>
                  <p className="text-xs text-muted">
                    {t("settings.highContrastHelp", "Increase contrast for borders and muted text.")}
                  </p>
                </div>
              </Checkbox.Content>
            </Checkbox>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
