export interface Response<T> {
	code: string;
	success: boolean;
	message: string;
	metadata: T;
}

export interface RegisterResponse extends Response<{}> {}

export interface ResetResponse extends Response<{}> {}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
	birthDate: string;
	gender: "male" | "female" | "other";
	country: string;
}

export interface OTPRequest {
	otpCode: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export const AccountType = {
	UserAccount: "USER",
	InspectorAccount: "INSPECTOR",
	OrganizationAccount: "ORGANIZATION",
	AdminAccount: "ADMINISTRATOR"
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];

export interface LoginMetadata {
	account_type: AccountType;
}

export interface LoginResponse extends Response<LoginMetadata> {}

export interface ProfileModel {
	name: string;
	email: string;
	createdAt: string;
	type: AccountType;
}

export interface UserProfileModel extends ProfileModel {
	avatarUrl: string;
	birthDate: string;
	country: string;
	gender: string;
	phoneNumber: string;
	addressLine: string;
}

export interface OrganizationProfileModel extends ProfileModel {
	avatarUrl: string;
	bannerUrl: string;
	aliasName: string;
	description: string;
	websiteUrl: string;
}

export type AccountResponse = ProfileModel | UserProfileModel | OrganizationProfileModel;

// ── Auth (reset) ────────────────────────────────────────────────────────────────────────────

export interface ResetPasswordRequest {
	email: string;
	newPassword: string;
}

// ── Account ─────────────────────────────────────────────────────────────────────────────────

export interface UpdateEmailRequest {
	newEmail: string;
	currentPassword: string;
}

export interface UpdateNameRequest {
	newName: string;
}

export interface UpdatePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

// ── Organization ────────────────────────────────────────────────────────────────────────────

export interface UpdateOrganizationInfoRequest {
	description: string;
	aliasName: string;
	websiteUrl: string;
}

export interface CreateEventRequest {
	name: string;
	description: string;
	isOnlineEvent: boolean;
	venue: string;
	address: string;
	dateTime: string;
}

export interface UpdateEventRequest {
	name: string;
	description: string;
	isOnlineEvent: boolean;
	venue: string;
	address: string;
	dateTime: string;
}

export interface AddSalesRoundRequest {
	name: string;
	startTime: string;
	endTime: string;
	maxTicketsPerPurchase: number;
}

export interface UpdateSalesRoundRequest {
	name: string;
	startTime: string;
	endTime: string;
	maxTicketsPerPurchase: number;
}

export interface AddEventStaffRequest {
	name: string;
	email: string;
	password: string;
}

export interface CreateTicketClassRequest {
	name: string;
	description: string;
	price: number;
	salesRoundId: number;
	seatZoneId: number;
}

// ── Checkin ────────────────────────────────────────────────────────────────────────────────

export interface CheckInRequest {
	eventId: number;
	ticketId: number;
	userId: number;
	ticketSecretCode: string;
}

// ── User ───────────────────────────────────────────────────────────────────────────────────

export interface UpdateUserInfoRequest {
	birthDate: string;
	gender: "MALE" | "FEMALE" | "OTHER";
	phoneNumber: string;
	addressLine: string;
}

// ── Admin ──────────────────────────────────────────────────────────────────────────────────

export interface CreateOrganizationRequest {
	name: string;
	email: string;
	password: string;
}

// ── Feeds ───────────────────────────────────────────────────────────────────────────────────

export interface BasicEventInfo {
	id: number;
	name: string;
	bannerUrl: string;
	dateTime: string;
	venue: string;
}

// ── Public ──────────────────────────────────────────────────────────────────────────────────

export interface PublicOrganizationInfo {
	id: number;
	name: string;
	description: string;
	aliasName: string;
	avatarUrl: string;
	bannerUrl: string;
	websiteUrl: string;
	verified: boolean;
	followerCount: number;
}

export interface PublicEventInfo {
	id: number;
	name: string;
	description: string;
	isOnlineEvent: boolean;
	venue: string;
	address: string;
	dateTime: string;
	bannerUrl: string;
	organizationId: number;
	organizationName: string;
	organizationAlias: string;
}

// ── Account ─────────────────────────────────────────────────────────────────────────────────

export interface BasicUserInfo {
	id: number;
	name: string;
	email: string;
	avatarUrl: string;
	role: string;
}

// ── Organization ────────────────────────────────────────────────────────────────────────────

export interface FullOrganizationInfo {
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

// ── Checkin ─────────────────────────────────────────────────────────────────────────────────

export interface CheckInResult {
	ticketValid: boolean;
	checkInTime: string;
	checkInStaffName: string;
	ticketOwnerName: string;
	ticketOwnerEmail: string;
	ticketOwnerPhoneNumber: string;
	salesRoundName: string;
	ticketClassName: string;
	seatZoneName: string;
	seatRowLabel: string;
	seatNumber: number;
}

// ── User ────────────────────────────────────────────────────────────────────────────────────

export interface FullUserInfo {
	id: number;
	name: string;
	email: string;
	avatarUrl: string;
	birthDate: string;
	gender: string;
	phoneNumber: string;
	addressLine: string;
	createdAt: string;
	updatedAt: string;
}