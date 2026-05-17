import {
  Armchair,
  ClipboardList,
  Pencil,
  PieChart,
  Trash2,
  UsersRound,
} from "lucide-react";

export type OrganizerEventTab = "upcoming" | "past" | "draft";

export const organizerEventTabs: Array<{ key: OrganizerEventTab; labelKey: string }> = [
  { key: "upcoming", labelKey: "upcoming" },
  { key: "past", labelKey: "past" },
  { key: "draft", labelKey: "draft" },
];

export const organizerEventActions = [
  { labelKey: "overview", icon: PieChart },
  { labelKey: "members", icon: UsersRound },
  { labelKey: "orders", icon: ClipboardList },
  { labelKey: "seatMap", icon: Armchair },
  { labelKey: "edit", icon: Pencil },
  { labelKey: "delete", icon: Trash2 },
];

export function formatStoredEventDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
