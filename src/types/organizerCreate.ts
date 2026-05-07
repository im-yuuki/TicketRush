export const organizerCreateSteps = [
  "eventInfo",
  "timeAndTickets",
  "settings",
  "paymentInfo",
] as const;

export type ShowTime = {
  id: number;
  start: string;
  end: string;
  tickets: TicketTypeData[];
};

export type TicketTypeData = {
  id: number;
  name: string;
  price: string;
  isFree: boolean;
  totalQuantity: string;
  minPerOrder: string;
  maxPerOrder: string;
  saleStart: string;
  saleEnd: string;
  description: string;
};

export type BusinessType = "individual" | "organization";
export type EventLocationMode = "offline" | "online";
export type EventCategory =
  | "music"
  | "conference"
  | "workshop"
  | "sports"
  | "theater"
  | "festival"
  | "exhibition"
  | "networking";

export type EventCategoryOption = {
  value: EventCategory;
  label: string;
};
