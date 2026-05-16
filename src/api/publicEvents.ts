import { apiGet } from "./client";

export interface PublicOrganizationInfo {
	id: number;
	name: string;
	description: string;
	aliasName?: string | null;
	avatarUrl?: string | null;
	bannerUrl?: string | null;
	websiteUrl?: string | null;
}

export interface PublicEventInfo {
	id: number;
	name: string;
	description: string;
	published: boolean;
	isOnlineEvent: boolean;
	venue: string;
	address: string;
	dateTime: string;
	bannerUrl?: string | null;
	createdAt: string;
	updatedAt?: string | null;
	organization: PublicOrganizationInfo;
}

export function getPublicEvent(eventId: number) {
	return apiGet<PublicEventInfo>(`/event/${eventId}`);
}
