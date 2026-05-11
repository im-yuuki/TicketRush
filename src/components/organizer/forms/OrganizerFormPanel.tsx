import { Card } from "@heroui/react";
import type { ReactNode } from "react";

export function OrganizerFormPanel({
  children,
  className = "",
  contentClassName = "gap-5 p-5 md:p-6",
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={`border border-border bg-surface text-foreground ${className}`}>
      <Card.Content className={contentClassName}>{children}</Card.Content>
    </Card>
  );
}
