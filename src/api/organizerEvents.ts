import { apiGet, apiPost, apiPut, apiDelete } from "./client";

export interface OrganizationInfo {
	id: number;
	name: string;
	email: string;
	createdAt: string;
	updatedAt: string;
	verified: boolean;
	description: string;
	aliasName: string;
	avatarUrl: string;
	bannerUrl: string;
	websiteUrl: string;
}

export interface BasicEventInfo {
	id: number;
	name: string;
	bannerUrl: string;
	dateTime: string;
	venue: string;
}

export interface FullEventInfo {
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

export interface UpdateEventPayload {
	name?: string;
	description?: string;
	isOnlineEvent?: boolean;
	venue?: string;
	address?: string;
	dateTime?: string;
}

export interface AddSalesRoundPayload {
	name: string;
	startTime: string;
	endTime: string;
	maxTicketsPerPurchase: number;
}

export interface CreateTicketClassPayload {
	name: string;
	description: string;
	price: number;
	salesRoundId: number;
	seatZoneId: number;
}

export interface CreateSeatZonePayload {
	name: string;
	positionX: number;
	positionY: number;
	capacity: number;
	rows: Array<{
		index: number;
		label: string;
		seats: Array<{
			index: number;
			number: number;
		}>;
	}>;
}

export interface AddEventStaffPayload {
	name: string;
	email: string;
	password: string;
}

export interface UpdateOrganizationInfoPayload {
	description?: string;
	aliasName?: string;
	websiteUrl?: string;
}

export interface OperationResult {
	success: boolean;
	message: string;
	resourceId?: number | null;
}

// Organization Info
export function getOrganizationInfo() {
	return apiGet<OrganizationInfo>("/organization/info");
}

export function updateOrganizationInfo(payload: UpdateOrganizationInfoPayload) {
	return apiPut<OperationResult, UpdateOrganizationInfoPayload>("/organization/info", payload);
}

export function updateOrganizationAvatar(file: File) {
	const formData = new FormData();
	formData.append("file", file);
	return apiPut<OperationResult>("/organization/avatar", formData);
}

export function updateOrganizationBanner(file: File) {
	const formData = new FormData();
	formData.append("file", file);
	return apiPut<OperationResult>("/organization/banner", formData);
}

// Events
export function getOrganizationEvents() {
	return apiGet<BasicEventInfo[]>("/organization/events");
}

export function createOrganizationEvent(payload: CreateEventPayload) {
	return apiPost<OperationResult, CreateEventPayload>("/organization/events", payload);
}

export function getOrganizationEvent(eventId: number) {
	return apiGet<FullEventInfo>(`/organization/events/${eventId}`);
}

export function updateOrganizationEvent(eventId: number, payload: UpdateEventPayload) {
	return apiPut<OperationResult, UpdateEventPayload>(`/organization/events/${eventId}`, payload);
}

export function deleteOrganizationEvent(eventId: number) {
	return apiDelete<OperationResult>(`/organization/events/${eventId}`);
}

export function publishOrganizationEvent(eventId: number) {
	return apiPost<OperationResult>(`/organization/events/${eventId}/publish`);
}

export function updateEventBanner(eventId: number, file: File) {
	const formData = new FormData();
	formData.append("file", file);
	return apiPut<OperationResult>(`/organization/events/${eventId}/banner`, formData);
}

// Sales Rounds
export function addSalesRound(eventId: number, payload: AddSalesRoundPayload) {
	return apiPost<OperationResult, AddSalesRoundPayload>(`/organization/events/${eventId}/sales-rounds`, payload);
}

export function deleteSalesRound(eventId: number, roundId: number) {
	return apiDelete<OperationResult>(`/organization/events/${eventId}/sales-rounds/${roundId}`);
}

// Seat Zones
export function createSeatZone(eventId: number, payload: CreateSeatZonePayload) {
	return apiPost<OperationResult, CreateSeatZonePayload>(`/organization/events/${eventId}/seat-zones`, payload);
}

export function deleteSeatZone(eventId: number, zoneId: number) {
	return apiDelete<OperationResult>(`/organization/events/${eventId}/seat-zones/${zoneId}`);
}

// Ticket Classes
export function createTicketClass(eventId: number, payload: CreateTicketClassPayload) {
	return apiPost<OperationResult, CreateTicketClassPayload>(`/organization/events/${eventId}/ticket-classes`, payload);
}

export function deleteTicketClass(eventId: number, ticketClassId: number) {
	return apiDelete<OperationResult>(`/organization/events/${eventId}/ticket-classes/${ticketClassId}`);
}

// Event Staff
export function addEventStaff(eventId: number, payload: AddEventStaffPayload) {
	return apiPost<OperationResult, AddEventStaffPayload>(`/organization/events/${eventId}/staff`, payload);
}

export function deleteEventStaff(eventId: number, staffId: number) {
	return apiDelete<OperationResult>(`/organization/events/${eventId}/staff/${staffId}`);
}
