// ── Server response types (mirror PurchaseData.java) ────────────

export type SeatAvailability = "AVAILABLE" | "SOLD" | "HELD_BY_ME" | "HELD";

export interface ServerSeatView {
  id: number;
  index: number;
  number: number;
  availability: SeatAvailability;
}

export interface ServerSeatRowView {
  id: number;
  index: number;
  label: string;
  seats: ServerSeatView[];
}

export interface ServerSeatZoneView {
  id: number;
  name: string;
  positionX: number;
  positionY: number;
  rows: ServerSeatRowView[];
}

export interface ServerTicketClassView {
  id: number;
  name: string;
  description: string;
  price: number;
  salesRoundId: number;
  seatZoneId: number;
}

export interface ServerSalesRoundView {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  maxTicketsPerPurchase: number;
}

export interface ActiveHoldView {
  holdId: string;
  expiresAt: string;
  totalAmount: number;
}

export interface PurchaseEventView {
  eventId: number;
  eventName: string;
  eventDateTime: string;
  salesRounds: ServerSalesRoundView[];
  ticketClasses: ServerTicketClassView[];
  seatZones: ServerSeatZoneView[];
  myActiveHold: ActiveHoldView | null;
}

export interface HoldView {
  holdId: string;
  expiresAt: string;
  totalAmount: number;
  items: { seatId: number; ticketClassId: number; price: number }[];
}

export interface CompletedPurchaseView {
  purchaseId: number;
  amount: number;
  ticketIds: number[];
}

// ── Organizer config types ──────────────────────────────────────

export type TierDimensions = {
  tierId: string;
  name: string;
  rows: number;
  cols: number;
};

export type SeatConfigRecord = Record<string, TierDimensions[]>;
// key = eventId (no showTimeId — one showtime per event)
