import type { ShowTime } from "../../types/organizerCreate";

export const ORGANIZER_EVENTS_STORAGE_KEY = "ticketrush.organizer.events";
export const ORGANIZER_EVENTS_CHANGE_EVENT = "ticketrush-organizer-events-change";
export const ORGANIZER_EVENTS_SEQUENCE_KEY = "ticketrush.organizer.events.sequence";

export type StoredOrganizerEvent = {
  id: string;
  sequenceId?: number;
  bannerImageKey?: string;
  bannerImageUrl?: string;
  showTimes?: ShowTime[];
  ticketTiers?: StoredOrganizerTicketTier[];
  title: string;
  status: string;
  published?: boolean;
  start: string;
  end?: string;
  showtimeCount: number;
  ticketTypeCount: number;
  createdAt: string;
  // Event info fields
  locationMode?: "offline" | "online";
  venueName?: string;
  provinceCode?: string;
  provinceName?: string;
  wardCode?: string;
  wardName?: string;
  streetAddress?: string;
  // Organizer info fields
  organizerName?: string;
  organizerDescription?: string;
  organizerLogoKey?: string;
  organizerLogoUrl?: string;
  // Event description
  eventDescription?: string;
};

export type StoredOrganizerTicketTier = {
  id: string;
  name: string;
  price: number;
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

function getStoredEventSequenceId(event: StoredOrganizerEvent) {
  if (typeof event.sequenceId === "number" && Number.isFinite(event.sequenceId)) {
    return event.sequenceId;
  }

  return 0;
}

export function getNextOrganizerEventSequenceId() {
  const events = readStoredOrganizerEvents();
  const highestSequenceId = events.reduce(
    (highest, event) => Math.max(highest, getStoredEventSequenceId(event)),
    0,
  );

  return Math.max(highestSequenceId, events.length) + 1;
}

export function reserveNextOrganizerEventSequenceId() {
  if (!canUseStorage()) return getNextOrganizerEventSequenceId();

  const currentCounter = Number(window.localStorage.getItem(ORGANIZER_EVENTS_SEQUENCE_KEY));
  const currentSequence = Number.isFinite(currentCounter) ? currentCounter : 0;
  const nextSequenceId = Math.max(currentSequence, getNextOrganizerEventSequenceId() - 1) + 1;

  window.localStorage.setItem(ORGANIZER_EVENTS_SEQUENCE_KEY, String(nextSequenceId));
  return nextSequenceId;
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

export function findStoredOrganizerEvent(eventId: string) {
  return readStoredOrganizerEvents().find((event) => event.id === eventId);
}

export function getStoredOrganizerEventPreviewId(event: StoredOrganizerEvent) {
  return String(event.sequenceId ?? event.id);
}

export function findStoredOrganizerEventByPreviewId(previewId: string) {
  return readStoredOrganizerEvents().find(
    (event) => getStoredOrganizerEventPreviewId(event) === previewId,
  );
}

export function updateStoredOrganizerEvent(eventId: string, updatedEvent: StoredOrganizerEvent) {
  if (!canUseStorage()) return;

  const events = readStoredOrganizerEvents();
  window.localStorage.setItem(
    ORGANIZER_EVENTS_STORAGE_KEY,
    JSON.stringify(
      events.map((event) => (event.id === eventId ? updatedEvent : event)),
    ),
  );
  window.dispatchEvent(new Event(ORGANIZER_EVENTS_CHANGE_EVENT));
}

export function deleteStoredOrganizerEvent(eventId: string) {
  if (!canUseStorage()) return;

  const events = readStoredOrganizerEvents();
  const filtered = events.filter((event) => event.id !== eventId);
  window.localStorage.setItem(ORGANIZER_EVENTS_STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event(ORGANIZER_EVENTS_CHANGE_EVENT));
}
