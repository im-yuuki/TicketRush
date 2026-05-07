export const ORGANIZER_EVENTS_STORAGE_KEY = "ticketrush.organizer.events";
export const ORGANIZER_EVENTS_CHANGE_EVENT = "ticketrush-organizer-events-change";

export type StoredOrganizerEvent = {
  id: string;
  title: string;
  status: string;
  start: string;
  end?: string;
  showtimeCount: number;
  ticketTypeCount: number;
  createdAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readStoredOrganizerEvents() {
  if (!canUseStorage()) return [];

  try {
    const value = window.localStorage.getItem(ORGANIZER_EVENTS_STORAGE_KEY);
    if (!value) return [];
    return JSON.parse(value) as StoredOrganizerEvent[];
  } catch {
    return [];
  }
}

export function appendStoredOrganizerEvent(event: StoredOrganizerEvent) {
  if (!canUseStorage()) return;

  const events = readStoredOrganizerEvents();
  window.localStorage.setItem(
    ORGANIZER_EVENTS_STORAGE_KEY,
    JSON.stringify([event, ...events]),
  );
  window.dispatchEvent(new Event(ORGANIZER_EVENTS_CHANGE_EVENT));
}
