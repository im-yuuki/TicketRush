import { apiGet, apiPost, apiDelete } from "./client";
import type {
  PurchaseEventView,
  HoldView,
  CompletedPurchaseView,
} from "../types/seat";

// ── Purchase APIs ────────────────────────────────────────────

export function getSeatStatuses(eventId: number) {
  return apiGet<import("../types/seat").ActiveHoldView & { seatZones: import("../types/seat").ServerSeatZoneView[] }>(
    `/purchase/event/${eventId}/seats`,
  );
}

export function getPurchaseEvent(eventId: number) {
  return apiGet<PurchaseEventView>(`/purchase/event/${eventId}`);
}

export function createHold(eventId: number) {
  return apiPost<HoldView, { eventId: number }>("/purchase/hold", { eventId });
}

export function addSeatToHold(holdId: string, seatId: number, ticketClassId: number) {
  return apiPost<HoldView, { seatId: number; ticketClassId: number }>(
    `/purchase/hold/${holdId}/seat`,
    { seatId, ticketClassId },
  );
}

export function getHold(holdId: string) {
  return apiGet<HoldView>(`/purchase/hold/${holdId}`);
}

export function releaseHold(holdId: string) {
  return apiDelete<{ success: boolean; message: string }>(`/purchase/hold/${holdId}`);
}

export function payHold(holdId: string) {
  return apiPost<CompletedPurchaseView, Record<string, never>>(
    `/purchase/pay/${holdId}`,
    {} as Record<string, never>,
  );
}
