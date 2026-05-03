export interface Response<T> {
	success: boolean;
	message: string;
	metadata?: T;
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

export interface LoginResponse extends Response<unknown> {}