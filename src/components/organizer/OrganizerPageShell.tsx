import type { ReactNode } from "react";

const pageBackgrounds = {
  events:
    "bg-[radial-gradient(circle_at_0%_100%,rgba(87,12,95,0.42)_0,rgba(7,31,23,0.28)_28%,rgba(0,0,0,0)_56%),linear-gradient(180deg,var(--background)_0%,#000_100%)]",
  placeholder:
    "bg-[radial-gradient(circle_at_0%_100%,rgba(87,12,95,0.35)_0,rgba(7,31,23,0.22)_30%,rgba(0,0,0,0)_58%),linear-gradient(180deg,var(--background)_0%,#000_100%)]",
};

export default function OrganizerPageShell({
  children,
  background = "events",
  className = "",
  contentClassName = "max-w-[1360px]",
  paddingClassName = "px-4 py-5 md:px-6 lg:px-7",
}: {
  children: ReactNode;
  background?: keyof typeof pageBackgrounds;
  className?: string;
  contentClassName?: string;
  paddingClassName?: string;
}) {
  return (
    <div
      className={`min-h-[calc(100dvh-4rem)] ${pageBackgrounds[background]} ${paddingClassName} text-foreground ${className}`}
    >
      <div className={`mx-auto w-full ${contentClassName}`}>{children}</div>
    </div>
  );
}
