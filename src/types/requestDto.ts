export interface Response<T = unknown> {
	success: boolean;
	message: string;
	resourceId?: number | null;
	metadata?: T;
}

export type RegisterResponse = Response;

export type ResetResponse = Response;

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
	birthDate: string;
	gender: "male" | "female" | "other";
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

export type LoginResponse = Response;

export interface ProfileModel {
	id: number;
	name: string;
	email: string;
	avatarUrl?: string;
}

export interface UserProfileModel extends ProfileModel {
	birthDate: string;
	gender: string;
	phoneNumber?: string;
	addressLine?: string;
}

export interface OrganizationProfileModel extends ProfileModel {
	bannerUrl?: string;
	aliasName?: string;
	description?: string;
	websiteUrl?: string;
}

export type AccountResponse = ProfileModel | UserProfileModel | OrganizationProfileModel;
