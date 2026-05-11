# Booking Flow Refactor — 2026-05-06

## Overview

Refactored the 4-page booking flow (Booking → BookingDetails → Payment → Checkout) to prepare for backend integration. All changes are frontend-only — when backend is ready, you just swap mocks for `apiPost`/`apiGet` calls using the pre-defined DTO types.

---

## New Files (8)

### `src/utils/format.ts`
**Purpose:** Shared `formatPrice()` (VND currency) and `formatDateTime()` (ISO → readable format). Previously copy-pasted across 4 files. Single source of truth — change format once, applies everywhere.

### `src/utils/useCountdown.ts`
**Purpose:** Countdown hook accepting either `seconds` (count down from mount) or `expiresAt` (ISO timestamp, count down to that point). Handles edge cases: invalid timestamp → falls back to 600s, past timestamp → returns 0.

### `src/utils/seatGroups.ts`
**Purpose:** `computeSeatGroups()` groups seats by tier (SVIP, VIP1, etc.) for display. `computeTotalAmount()` sums the subtotals. Previously duplicated across BookingDetails, Payment, Checkout. When backend returns pre-grouped data, replace this utility.

### `src/types/booking.ts`
**Purpose:** Shared `SeatGroup` type used across the booking flow pages.

### `src/components/booking/StepIndicator.tsx`
**Purpose:** Step 1-2-3 indicator bar (Select Ticket → Enter Info → Payment). Extracted from 3 pages. Adding a new step means editing one file.

### `src/components/booking/EventMarquee.tsx`
**Purpose:** Scrolling marquee showing event name + date/time + venue. Extracted as a shared component.

### `src/components/booking/Section.tsx`
**Purpose:** Collapsible section with title and toggle. Used for "Recipient Info", "Seat Area" panels. Extracted as a shared component.

### `src/contexts/BookingContext.tsx`
**Purpose:** Manages the entire booking flow state — selected seats, customer info, payment method, total amount, expiration timer. Persists to `sessionStorage` so data survives page refresh. This is the core architectural change — replaces fragile `location.state` (lost on refresh) with context + sessionStorage.

**State shape:**
```ts
interface BookingState {
  eventId: string;
  selectedSeats: string[];
  seatToTierMap: Record<string, string>;
  fullName: string;
  email: string;
  phone: string;
  idDocument: string;
  paymentMethod: "bank_transfer" | "credit_card";
  totalAmount: number;
  sessionId?: string;
  expiresAt?: string;
}
```

**Why sessionStorage:** Survives page refresh, clears when tab closes — appropriate for a booking session lifecycle.

---

## Modified Files (7)

### `src/main.tsx`
**Change:** Wrapped `RouterProvider` with `<BookingProvider>`.
**Intent:** All booking pages can read/write the shared booking state. Provider is placed outside the router because booking pages are outside `AppLayout`.

### `src/types/requestDto.ts`
**Change:** Added 12 interfaces for the booking flow:

| Interface | Used For |
|---|---|
| `CreateBookingRequest` / `CreateBookingResponse` | POST /bookings |
| `BookingSessionData` | Full session state |
| `GetBookingSessionResponse` | GET /bookings/:sessionId |
| `BookingDetailsRequest` / `UpdateBookingDetailsResponse` | PUT /bookings/:sessionId/details |
| `PaymentRequest` / `PaymentResponse` | POST /bookings/:sessionId/pay |
| `ConfirmPaymentResponse` | POST /bookings/:sessionId/confirm |
| `ValidateDiscountRequest` / `ValidateDiscountResponse` | POST /discounts/validate |
| `GetSeatmapResponse` / `GetBookedSeatsResponse` | GET seatmap + booked seats |

**Intent:** Pre-define all request/response types. When backend is ready, calls like `apiPost<CreateBookingResponse, CreateBookingRequest>("/bookings", body)` get full type safety.

### `src/pages/Booking.tsx`
**Changes:**
- Imports `formatPrice`, `formatDateTime` from `utils/format` (was inline)
- Imports `useBooking` from context
- `handleBuyTickets` calls `setSeatSelection(eventId, seats, tierMap)` then `navigate` (was passing data via `location.state`)
- Commented-out API code preserved for future integration

**Intent:** Seat selection now persists to context. Refreshing BookingDetails doesn't lose seat data.

### `src/pages/BookingDetails.tsx`
**Changes:**
- Reads `selectedSeats`, `seatToTierMap`, `fullName`, `email`, `phone` from context (was `location.state`)
- Form state initializes from context — returning to this page preserves entered data
- Continue button: calls `setCustomerInfo()` to save to context, validates form before navigating
- Validation: `submitted` flag + `errors` memo checks fullName/email/phone, shows inline red errors
- Expired redirect guard with `booking?.expiresAt` check — only redirects when timer is genuinely expired, not when booking is null

**Intent:** Form validates before navigation (previously Continue always navigated even with invalid data). Form data survives page refresh. Timer doesn't reset when navigating between pages.

### `src/pages/Payment.tsx`
**Changes:**
- Reads data from context instead of `location.state`
- `handlePaymentSubmit` calls `savePaymentMethod()` + `setTotalAmount()` to save to context before navigating
- Same expired redirect guard as BookingDetails

**Intent:** Payment method and total amount are saved to context so Checkout can read them without location.state.

### `src/pages/Checkout.tsx`
**Changes:**
- Reads data from context instead of `location.state`
- "Confirm Payment" button has `handleConfirmPayment` with loading state (`isConfirming`) and success screen
- Success screen's "Back to Home" button calls `clearBooking()` + `navigate("/")` — clears context on completion
- Redirect guard — if no booking data, redirects to home (Checkout doesn't have eventId in URL)

**Intent:** Previously the confirm button had no onClick handler. Now has complete flow: click → loading → success → clear data → return home.

---

## Data Flow

```
Booking.tsx
  → setSeatSelection(eventId, seats, tierMap)
  → sets fresh expiresAt = now + 10min
  → persists to sessionStorage

BookingDetails.tsx
  → reads selectedSeats, seatToTierMap from context
  → on Continue: setCustomerInfo({fullName, email, phone, idDocument})
  → validates form before navigating

Payment.tsx
  → reads all data from context
  → on Pay: savePaymentMethod(method) + setTotalAmount(amount)

Checkout.tsx
  → reads all data from context
  → on Confirm: setPaymentConfirmed(true)
  → on Back to Home: clearBooking() + navigate("/")
  → sessionStorage cleared, next booking starts fresh
```

---

## Shared Timer

```
expiresAt is set ONCE when user clicks Continue on Booking page.
All pages use: useCountdown({ expiresAt: booking?.expiresAt })
→ Timer continues across page navigation without resetting.
```

`setSeatSelection` always sets a fresh `expiresAt` (never preserves old) — prevents stale timestamp bugs from previous sessions.

---

## Issues Fixed (9)

| # | Issue | Fix |
|---|-------|-----|
| 1 | `location.state` lost on refresh | Replaced with BookingContext + sessionStorage |
| 2 | Code duplicated across 3-4 pages | Extracted to `utils/` and `components/booking/` |
| 3 | Confirm Payment button had no onClick | Added `handleConfirmPayment` + success screen |
| 4 | No auth header in API client | Added auto-inject Bearer token |
| 5 | No DTO types for booking flow | Added 12 interfaces in `requestDto.ts` |
| 6 | Timer reset to 10min on every page nav | Shared `expiresAt` timestamp across all pages |
| 7 | Form didn't validate before navigate | Added `submitted` flag + inline error display |
| 8 | Direct URL access → broken page | Redirect guard when context is empty |
| 9 | `clearBooking()` was commented out | Uncommented, called on payment completion |

---

## API Endpoints (DTO-ready)

| Endpoint | Method | DTO |
|---|---|---|
| `/bookings` | POST | `CreateBookingRequest` → `CreateBookingResponse` |
| `/bookings/:sessionId` | GET | → `GetBookingSessionResponse` |
| `/bookings/:sessionId/details` | PUT | `BookingDetailsRequest` → `UpdateBookingDetailsResponse` |
| `/bookings/:sessionId/pay` | POST | `PaymentRequest` → `PaymentResponse` |
| `/bookings/:sessionId/confirm` | POST | → `ConfirmPaymentResponse` |
| `/events/:id/booked-seats` | GET | → `GetBookedSeatsResponse` |
| `/events/:id/seatmap` | GET | → `GetSeatmapResponse` |
| `/discounts/validate` | POST | `ValidateDiscountRequest` → `ValidateDiscountResponse` |

---

## Auth Token Usage

```ts
import { setAuthToken, clearAuthToken } from "../api/client";

// After successful login
setAuthToken(token);

// After logout
clearAuthToken();
```

Token is auto-injected as `Authorization: Bearer <token>` on every API request.

---

## Build Status

TypeScript + Vite build: **passing** (zero errors)
