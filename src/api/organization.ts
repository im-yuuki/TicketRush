import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "./client";

// ── Types matching backend DTOs ──────────────────────────────

export interface OperationResult {
	success: boolean;
	message: string;
	resourceId?: number;
}

export interface OrgBasicEventInfo {
	id: number;
	name: string;
	bannerUrl: string;
	dateTime: string;
	venue: string;
}

export interface OrgFullEventInfo {
	id: number;
	name: string;
	description: string;
	published: boolean;
	isOnlineEvent: boolean;
	venue: string;
	address: string;
	dateTime: string;
	bannerUrl: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateEventPayload {
	name: string;
	description: string;
	isOnlineEvent: boolean;
	venue: string;
	address: string;
	dateTime: string;
}

export interface AddSalesRoundPayload {
	name: string;
	startTime: string;
	endTime: string;
	maxTicketsPerPurchase: number;
}

export interface CreateSeatZonePayload {
	name: string;
	positionX: number;
	positionY: number;
	rows: {
		index: number;
		label: string;
		seats: { index: number; number: number }[];
	}[];
}

export interface CreateTicketClassPayload {
	name: string;
	description: string;
	price: number;
	salesRoundId: number;
	seatZoneId: number;
}

// ── API Functions ────────────────────────────────────────────

export function createEvent(payload: CreateEventPayload) {
	return apiPost<OperationResult, CreateEventPayload>("/organization/events", payload);
}

export function getOrgEvents() {
	return apiGet<OrgBasicEventInfo[]>("/organization/events");
}

export function getOrgEventDetails(eventId: number) {
	return apiGet<OrgFullEventInfo>(`/organization/events/${eventId}`);
}

export function updateEvent(eventId: number, payload: Partial<CreateEventPayload>) {
	return apiPatch<OperationResult, Partial<CreateEventPayload>>(
		`/organization/events/${eventId}`,
		payload,
	);
}

export function deleteEvent(eventId: number) {
	return apiDelete<OperationResult>(`/organization/events/${eventId}`);
}

export function publishEvent(eventId: number) {
	return apiPost<OperationResult>(`/organization/events/${eventId}/publish`);
}

export function uploadEventBanner(eventId: number, file: File) {
	const formData = new FormData();
	formData.append("file", file);
	return apiPut<OperationResult, FormData>(
		`/organization/events/${eventId}/banner`,
		formData,
	);
}

// ── Sales Rounds ─────────────────────────────────────────────

export function addSalesRound(eventId: number, payload: AddSalesRoundPayload) {
	return apiPost<OperationResult, AddSalesRoundPayload>(
		`/organization/events/${eventId}/sales-rounds`,
		payload,
	);
}

// ── Seat Zones ───────────────────────────────────────────────

export function createSeatZone(eventId: number, payload: CreateSeatZonePayload) {
	return apiPost<OperationResult, CreateSeatZonePayload>(
		`/organization/events/${eventId}/seat-zones`,
		payload,
	);
}

// ── Ticket Classes ───────────────────────────────────────────

export function createTicketClass(eventId: number, payload: CreateTicketClassPayload) {
	return apiPost<OperationResult, CreateTicketClassPayload>(
		`/organization/events/${eventId}/ticket-classes`,
		payload,
	);
}
