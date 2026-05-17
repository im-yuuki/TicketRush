import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "./client";
import type { Response } from "../types/requestDto";
import type {
  UpdateOrganizationInfoRequest,
  CreateEventRequest,
  UpdateEventRequest,
  AddSalesRoundRequest,
  UpdateSalesRoundRequest,
  AddEventStaffRequest,
  CreateTicketClassRequest,
} from "../types/requestDto";
import type {
  FullOrganizationInfo,
  BasicEventInfo,
  FullEventInfo,
} from "../types/requestDto";
// ── Organization Profile ──────────────────────────────────

export function getOrganizationInfo() {
  return apiGet<FullOrganizationInfo>("/organization");
}

export function updateOrganizationInfo(payload: UpdateOrganizationInfoRequest) {
  return apiPatch<Response<{}>, UpdateOrganizationInfoRequest>("/organization", payload);
}

export function updateOrganizationAvatar(formData: FormData) {
  return apiPut<Response<{}>, FormData>("/organization/avatar", formData);
}

export function updateOrganizationBanner(formData: FormData) {
  return apiPut<Response<{}>, FormData>("/organization/banner", formData);
}

// ── Organization Events ───────────────────────────────────

export function getOrganizationEvents() {
  return apiGet<BasicEventInfo[]>("/organization/events");
}

export function createOrganizationEvent(payload: CreateEventRequest) {
  return apiPost<Response<{}>, CreateEventRequest>("/organization/events", payload);
}

export function getOrganizationEventDetails(eventId: number) {
  return apiGet<FullEventInfo>(`/organization/events/${eventId}`);
}

export function updateOrganizationEvent(eventId: number, payload: UpdateEventRequest) {
  return apiPatch<Response<{}>, UpdateEventRequest>(`/organization/events/${eventId}`, payload);
}

export function deleteOrganizationEvent(eventId: number) {
  return apiDelete<Response<{}>>(`/organization/events/${eventId}`);
}

export function updateEventBanner(eventId: number, formData: FormData) {
  return apiPut<Response<{}>, FormData>(`/organization/events/${eventId}/banner`, formData);
}

export function publishEvent(eventId: number) {
  return apiPost<Response<{}>>(`/organization/events/${eventId}/publish`);
}

// ── Sales Rounds ──────────────────────────────────────────

export function addSalesRound(eventId: number, payload: AddSalesRoundRequest) {
  return apiPost<Response<{}>, AddSalesRoundRequest>(
    `/organization/events/${eventId}/sales-rounds`,
    payload,
  );
}

export function updateSalesRound(eventId: number, roundId: number, payload: UpdateSalesRoundRequest) {
  return apiPatch<Response<{}>, UpdateSalesRoundRequest>(
    `/organization/events/${eventId}/sales-rounds/${roundId}`,
    payload,
  );
}

export function deleteSalesRound(eventId: number, roundId: number) {
  return apiDelete<Response<{}>>(`/organization/events/${eventId}/sales-rounds/${roundId}`);
}

// ── Seat Zones ────────────────────────────────────────────

export function createSeatZone(eventId: number, payload: { name: string; positionX: number; positionY: number; rows: { index: number; label: string; seats: { index: number; number: number }[] }[] }) {
  return apiPost<Response<{}>, Record<string, unknown>>(
    `/organization/events/${eventId}/seat-zones`,
    payload as unknown as Record<string, unknown>,
  );
}

export function deleteSeatZone(eventId: number, zoneId: number) {
  return apiDelete<Response<{}>>(`/organization/events/${eventId}/seat-zones/${zoneId}`);
}

// ── Staff ─────────────────────────────────────────────────

export function addEventStaff(eventId: number, payload: AddEventStaffRequest) {
  return apiPost<Response<{}>, AddEventStaffRequest>(
    `/organization/events/${eventId}/staff`,
    payload,
  );
}

export function deleteEventStaff(eventId: number, staffId: number) {
  return apiDelete<Response<{}>>(`/organization/events/${eventId}/staff/${staffId}`);
}

// ── Ticket Classes ────────────────────────────────────────

export function createTicketClass(eventId: number, payload: CreateTicketClassRequest) {
  return apiPost<Response<{}>, CreateTicketClassRequest>(
    `/organization/events/${eventId}/ticket-classes`,
    payload,
  );
}

export function deleteTicketClass(eventId: number, ticketClassId: number) {
  return apiDelete<Response<{}>>(`/organization/events/${eventId}/ticket-classes/${ticketClassId}`);
}
