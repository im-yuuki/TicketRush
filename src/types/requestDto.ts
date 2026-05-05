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

// ── Booking Flow ──────────────────────────────────────────────

export interface CreateBookingRequest {
	eventId: string;
	seats: string[];
}

export interface BookingSessionMetadata {
	sessionId: string;
	expiresAt: string;
}

export interface CreateBookingResponse extends Response<BookingSessionMetadata> {}

export interface BookingDetailsRequest {
	fullName: string;
	email: string;
	phone: string;
	idDocument?: string;
}

export interface BookingSessionData {
	sessionId: string;
	eventId: string;
	seats: string[];
	seatToTierMap: Record<string, string>;
	fullName: string;
	email: string;
	phone: string;
	idDocument: string;
	totalAmount: number;
	paymentMethod: "bank_transfer" | "credit_card";
	expiresAt: string;
	status: "pending" | "info_filled" | "paid" | "expired";
}

export interface GetBookingSessionResponse extends Response<BookingSessionData> {}

export interface UpdateBookingDetailsResponse extends Response<BookingSessionData> {}

export interface PaymentRequest {
	paymentMethod: "bank_transfer" | "credit_card";
	discountCode?: string;
}

export interface PaymentMetadata {
	transactionId: string;
	qrUrl?: string;
	bankName?: string;
	accountNumber?: string;
	accountHolder?: string;
}

export interface PaymentResponse extends Response<PaymentMetadata> {}

export interface ConfirmPaymentResponse extends Response<{ transactionId: string }> {}

export interface ValidateDiscountRequest {
	code: string;
	eventId: string;
}

export interface DiscountMetadata {
	code: string;
	discountPercent: number;
	discountAmount: number;
}

export interface ValidateDiscountResponse extends Response<DiscountMetadata> {}

// ── Seatmap ───────────────────────────────────────────────────

export interface SeatmapRow {
	label: string;
	count: number;
	tierId?: string;
}

export interface SeatmapBlock {
	id: string;
	name: string;
	rows: SeatmapRow[];
}

export interface SeatmapData {
	id: string;
	name: string;
	blocks: SeatmapBlock[];
}

export interface GetSeatmapResponse extends Response<SeatmapData> {}

export interface GetBookedSeatsResponse extends Response<string[]> {}