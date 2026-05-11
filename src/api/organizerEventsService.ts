/**
 * Organizer Events Service
 *
 * Abstraction layer between components and data source.
 * Currently backed by localStorage. Swap implementation to API
 * when backend is ready — callers stay unchanged.
 */

import {
  readStoredOrganizerEvents,
  findStoredOrganizerEvent,
  findStoredOrganizerEventByPreviewId,
  appendStoredOrganizerEvent,
  updateStoredOrganizerEvent,
  deleteStoredOrganizerEvent,
  reserveNextOrganizerEventSequenceId,
  getStoredOrganizerEventPreviewId,
  ORGANIZER_EVENTS_CHANGE_EVENT,
  type StoredOrganizerEvent,
  type StoredOrganizerTicketTier,
} from "../utils/organizer/organizerEventsStorage";

// ── Re-export types so callers import from service only ───

export type { StoredOrganizerEvent, StoredOrganizerTicketTier };
export { getStoredOrganizerEventPreviewId, ORGANIZER_EVENTS_CHANGE_EVENT };

// ── Service Interface ────────────────────────────────────
// Define shape here. When switching to API, re-implement
// these functions with fetch calls — signature stays the same.

export interface OrganizerEventsService {
  list(): StoredOrganizerEvent[];
  findById(id: string): StoredOrganizerEvent | undefined;
  findByPreviewId(previewId: string): StoredOrganizerEvent | undefined;
  create(event: StoredOrganizerEvent): void;
  update(id: string, event: StoredOrganizerEvent): void;
  remove(id: string): void;
  reserveNextSequenceId(): number;
}

// ── LocalStorage Implementation ──────────────────────────

function createLocalService(): OrganizerEventsService {
  return {
    list: () => readStoredOrganizerEvents(),
    findById: (id) => findStoredOrganizerEvent(id),
    findByPreviewId: (previewId) => findStoredOrganizerEventByPreviewId(previewId),
    create: (event) => appendStoredOrganizerEvent(event),
    update: (id, event) => updateStoredOrganizerEvent(id, event),
    remove: (id) => deleteStoredOrganizerEvent(id),
    reserveNextSequenceId: () => reserveNextOrganizerEventSequenceId(),
  };
}

// ── Future: API Implementation ───────────────────────────
// Uncomment and implement when backend is ready.
//
// import {
//   fetchOrganizerEvents,
//   fetchOrganizerEvent,
//   createOrganizerEventAPI,
//   updateOrganizerEventAPI,
//   deleteOrganizerEventAPI,
// } from "../api/organizerEvents";
//
// function createApiService(): OrganizerEventsService {
//   return {
//     async list() {
//       const res = await fetchOrganizerEvents();
//       return res.metadata;
//     },
//     async findById(id) {
//       const res = await fetchOrganizerEvent(id);
//       return res.metadata;
//     },
//     // ... etc
//   };
// }

// ── Active Service Instance ──────────────────────────────

/**
 * Switch this to `createApiService()` when backend is ready.
 * All components use `organizerEventsService` — no import changes needed.
 */
export const organizerEventsService: OrganizerEventsService = createLocalService();
