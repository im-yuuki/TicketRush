import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { releaseHold } from "../api/purchaseApi";

export interface BookingState {
  eventId: string;
  selectedSeats: string[];
  selectedTierId: string;
  selectedTierName: string;
  selectedTierPrice: number;
  fullName: string;
  email: string;
  phone: string;
  idDocument: string;
  paymentMethod: "bank_transfer" | "credit_card";
  totalAmount: number;
  sessionId?: string;
  /** ISO timestamp when the reservation expires */
  expiresAt?: string;
}

interface BookingContextValue {
  booking: BookingState | null;
  setSeatSelection: (
    eventId: string,
    selectedSeats: string[],
    tierId: string,
    tierName: string,
    tierPrice: number,
  ) => void;
  setCustomerInfo: (info: { fullName: string; email: string; phone: string; idDocument: string }) => void;
  setPaymentMethod: (method: "bank_transfer" | "credit_card") => void;
  setTotalAmount: (amount: number) => void;
  setSessionId: (sessionId: string) => void;
  setExpiresAt: (expiresAt: string) => void;
  clearBooking: () => void;
  releaseAndClearBooking: () => void;
}

const STORAGE_KEY = "ticketrush_booking";

const BookingContext = createContext<BookingContextValue | null>(null);

function loadFromStorage(): BookingState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(state: BookingState | null) {
  if (state) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState | null>(() => loadFromStorage());

  const update = useCallback((updater: (prev: BookingState | null) => BookingState | null) => {
    setBooking((prev) => {
      const next = updater(prev);
      saveToStorage(next);
      return next;
    });
  }, []);

  const setSeatSelection = useCallback(
    (eventId: string, selectedSeats: string[], tierId: string, tierName: string, tierPrice: number) => {
      update((prev) => ({
        eventId,
        selectedSeats,
        selectedTierId: tierId,
        selectedTierName: tierName,
        selectedTierPrice: tierPrice,
        fullName: prev?.fullName ?? "",
        email: prev?.email ?? "",
        phone: prev?.phone ?? "",
        idDocument: prev?.idDocument ?? "",
        paymentMethod: prev?.paymentMethod ?? "bank_transfer",
        totalAmount: 0,
        sessionId: prev?.sessionId,
        expiresAt: prev?.expiresAt,
      }));
    },
    [update],
  );

  const setCustomerInfo = useCallback(
    (info: { fullName: string; email: string; phone: string; idDocument: string }) => {
      update((prev) => (prev ? { ...prev, ...info } : prev));
    },
    [update],
  );

  const setPaymentMethod = useCallback(
    (method: "bank_transfer" | "credit_card") => {
      update((prev) => (prev ? { ...prev, paymentMethod: method } : prev));
    },
    [update],
  );

  const setTotalAmount = useCallback(
    (amount: number) => {
      update((prev) => (prev ? { ...prev, totalAmount: amount } : prev));
    },
    [update],
  );

  const setSessionId = useCallback(
    (sessionId: string) => {
      update((prev) => (prev ? { ...prev, sessionId } : prev));
    },
    [update],
  );

  const setExpiresAt = useCallback(
    (expiresAt: string) => {
      update((prev) => (prev ? { ...prev, expiresAt } : prev));
    },
    [update],
  );

  // Keep a ref to the latest booking for releaseAndClearBooking
  const bookingRef = useRef(booking);
  bookingRef.current = booking;

  const clearBooking = useCallback(() => {
    setBooking(null);
    saveToStorage(null);
  }, []);

  const releaseAndClearBooking = useCallback(() => {
    const sessionId = bookingRef.current?.sessionId;
    if (sessionId) {
      releaseHold(sessionId).catch(() => {});
    }
    setBooking(null);
    saveToStorage(null);
  }, []);

  return (
    <BookingContext.Provider
      value={{ booking, setSeatSelection, setCustomerInfo, setPaymentMethod, setTotalAmount, setSessionId, setExpiresAt, clearBooking, releaseAndClearBooking }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
