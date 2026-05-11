import { Card } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OrganizerPlaceholderCard({
  icon: Icon,
  kind,
}: {
  icon: LucideIcon;
  kind: "reports" | "terms";
}) {
  const { t } = useTranslation();

  return (
    <Card className="max-w-3xl bg-surface-secondary">
      <Card.Content className="gap-4 p-6">
        <div className="flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {t(`organizer.${kind}.title`)}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            {t(`organizer.${kind}.description`)}
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}
