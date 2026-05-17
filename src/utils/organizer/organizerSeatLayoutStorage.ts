import type { TierDimensions } from "../../types/seat";

const STORAGE_KEY = "ticketrush.organizer.seatConfigs";

function canUseStorage() {
  return typeof window !== "undefined";
}

// Key = eventId (no showTimeId — one showtime per event)

export function readAllSeatConfigs(): Record<string, TierDimensions[]> {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSeatConfig(eventId: string): TierDimensions[] | null {
  const all = readAllSeatConfigs();
  return all[eventId] ?? null;
}

export function saveSeatConfig(eventId: string, tiers: TierDimensions[]) {
  if (!canUseStorage()) return;
  const all = readAllSeatConfigs();
  all[eventId] = tiers;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
