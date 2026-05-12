const STORAGE_KEY = "ticketrush.organizer.seatLayouts";

export type SeatLayoutConfig = {
  /** Preset layout id (e.g. "cinema", "concert-hall", "small-theater") */
  layoutId: string;
  /** Map of seatId → tierId (e.g. "screen-A-1" → "svip") */
  seatTierMap: Record<string, string>;
};

/** Key = `${eventId}::${showTimeId}` */
export type SeatLayoutRecord = Record<string, SeatLayoutConfig>;

function canUseStorage() {
  return typeof window !== "undefined";
}

function buildKey(eventId: string, showTimeId: number) {
  return `${eventId}::${showTimeId}`;
}

export function readAllSeatLayouts(): SeatLayoutRecord {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSeatLayout(eventId: string, showTimeId: number): SeatLayoutConfig | null {
  const all = readAllSeatLayouts();
  return all[buildKey(eventId, showTimeId)] ?? null;
}

export function saveSeatLayout(
  eventId: string,
  showTimeId: number,
  config: SeatLayoutConfig,
) {
  if (!canUseStorage()) return;
  const all = readAllSeatLayouts();
  all[buildKey(eventId, showTimeId)] = config;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
