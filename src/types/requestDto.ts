export interface Response<T> {
	code: string;
	success: boolean;
	message: string;
	metadata: T;
}

export interface RegisterKeyMetadata {
	confirm_key: string;
}

export interface RegisterResponse extends Response<RegisterKeyMetadata> {}

export interface ResetResponse extends Response<RegisterKeyMetadata> {}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
	birthDate: string;
	country: string;
}

export interface RegisterOtpRequest {
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

export type AccountMetadata = ProfileModel | UserProfileModel | OrganizationProfileModel;

export interface AccountResponse extends Response<AccountMetadata> {}
