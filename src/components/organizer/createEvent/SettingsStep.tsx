import { Radio, RadioGroup } from "@heroui/react";
import { Link2, LockKeyhole, Mail, UserRound, UsersRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  OrganizerCountedInput,
  OrganizerCountedTextarea,
  OrganizerFormPanel,
} from "../OrganizerFormControls";

export default function SettingsStep({
  eventSequenceId,
}: {
  eventSequenceId: number;
}) {
  const { t } = useTranslation();
  const [eventSlug, setEventSlug] = useState("123");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const eventUrl = `https://ticketrush.june8th.me/events/${eventSlug || "event"}-${eventSequenceId}`;

  const privacyOptions = [
    {
      value: "public" as const,
      icon: UsersRound,
      title: t("organizer.create.settings.publicEvent", "Sự kiện mở cho mọi người"),
      description: t(
        "organizer.create.settings.publicEventDescription",
        "Tất cả mọi người đều có thể đặt vé",
      ),
    },
    {
      value: "private" as const,
      icon: UserRound,
      title: t("organizer.create.settings.privateEvent", "Sự kiện dành riêng cho 1 nhóm"),
      description: t(
        "organizer.create.settings.privateEventDescription",
        "Chỉ người có link truy cập mới đặt được vé",
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1434px] space-y-5">
      <OrganizerFormPanel>
        <div className="flex items-center gap-2">
          <Link2 className="size-5 text-muted" />
          <h2 className="text-lg font-bold">
            {t("organizer.create.settings.linkTitle", "Link dẫn đến sự kiện")}
          </h2>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold" htmlFor="organizer-event-slug">
            <span className="text-danger">*</span>{" "}
            {t("organizer.create.settings.customPath", "Tùy chỉnh đường dẫn:")}
          </label>
          <OrganizerCountedInput
            id="organizer-event-slug"
            value={eventSlug}
            maxLength={80}
            onChange={setEventSlug}
          />
        </div>

        <p className="text-sm text-muted">
          {t("organizer.create.settings.eventUrlPrefix", "Đường dẫn sự kiện của bạn là:")}{" "}
          <a className="font-medium text-accent hover:underline" href={eventUrl}>
            {eventUrl}
          </a>
        </p>
      </OrganizerFormPanel>

      <OrganizerFormPanel contentClassName="gap-4 p-5 md:p-6">
        <div className="flex items-center gap-2">
          <LockKeyhole className="size-5 text-muted" />
          <h2 className="text-lg font-bold">
            {t("organizer.create.settings.privacyTitle", "Quyền riêng tư sự kiện")}
          </h2>
        </div>

        <RadioGroup
          value={privacy}
          onChange={(value) => setPrivacy(value as "public" | "private")}
          className="grid gap-3"
          aria-label={t("organizer.create.settings.privacyTitle", "Quyền riêng tư sự kiện")}
        >
          {privacyOptions.map(({ value, icon: Icon, title, description }) => (
            <Radio
              key={value}
              value={value}
              className="flex items-start gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-surface-secondary"
            >
              <Radio.Control className="mt-1">
                <Radio.Indicator />
              </Radio.Control>
              <Icon className="size-7 shrink-0 text-foreground" />
              <Radio.Content>
                <span className="block text-sm font-bold">{title}</span>
                <span className="block text-sm text-muted">{description}</span>
              </Radio.Content>
            </Radio>
          ))}
        </RadioGroup>
      </OrganizerFormPanel>

      <OrganizerFormPanel contentClassName="gap-4 p-5 md:p-6">
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-muted" />
          <h2 className="text-lg font-bold">
            {t("organizer.create.settings.confirmationTitle", "Tin nhắn xác nhận cho người tham gia")}
          </h2>
        </div>
        <p className="text-sm text-muted">
          {t(
            "organizer.create.settings.confirmationDescription",
            "Tin nhắn xác nhận này sẽ được gửi đến cho người tham gia sau khi đặt vé thành công",
          )}
        </p>
        <OrganizerCountedTextarea
          value={confirmationMessage}
          maxLength={500}
          className="min-h-52"
          onChange={setConfirmationMessage}
        />
      </OrganizerFormPanel>
    </div>
  );
}
