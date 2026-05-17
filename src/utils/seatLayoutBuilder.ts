import type { VenueLayout } from "../components/SeatMap";
import type { ServerSeatZoneView, TierDimensions } from "../types/seat";

// ── Server zone → VenueLayout (for SeatMap rendering) ────────

/**
 * Convert a server SeatZone into a VenueLayout that SeatMap can render.
 * Each zone becomes one block with its rows and seats.
 */
export function buildLayoutFromZone(zone: ServerSeatZoneView): VenueLayout {
  return {
    id: String(zone.id),
    name: zone.name,
    blocks: [
      {
        id: String(zone.id),
        name: zone.name,
        rows: zone.rows.map((row) => ({
          label: row.label,
          count: row.seats.length,
        })),
      },
    ],
  };
}

// ── Organizer TierDimensions → VenueLayout (for preview) ─────

/**
 * Build a VenueLayout from organizer tier dimensions for preview.
 * Each tier becomes a block stacked vertically.
 */
export function buildLayoutFromTiers(tiers: TierDimensions[]): VenueLayout {
  return {
    id: "preview",
    name: "Preview",
    blocks: tiers.map((tier) => ({
      id: tier.tierId,
      name: tier.name,
      rows: Array.from({ length: tier.rows }, (_, i) => ({
        label: String.fromCharCode(65 + i), // A, B, C, ...
        count: tier.cols,
      })),
    })),
  };
}

// ── Organizer TierDimensions → Server payload ────────────────

/**
 * Build CreateSeatZonePayload from a single TierDimensions.
 * positionY is cumulative offset so zones don't overlap.
 */
export function buildZonePayload(tier: TierDimensions, offsetY: number) {
  return {
    name: tier.name,
    positionX: 0,
    positionY: offsetY,
    rows: Array.from({ length: tier.rows }, (_, i) => ({
      index: i + 1,
      label: String.fromCharCode(65 + i),
      seats: Array.from({ length: tier.cols }, (_, j) => ({
        index: j + 1,
        number: j + 1,
      })),
    })),
  };
}

// ── Seat ID helpers ──────────────────────────────────────────

/**
 * Convert a seat ID string to a human-readable label.
 * Seat ID format: "${blockId}-${rowLabel}-${seatNumber}"
 * where blockId may contain "-" (e.g., "1-1").
 * Returns label like "A1", "B3".
 */
export function seatIdToLabel(seatId: string): string {
  const parts = seatId.split("-");
  const row = parts[parts.length - 2] ?? "";
  const num = parts[parts.length - 1] ?? "";
  return `${row}${num}`;
}

// ── Seat ID mapping (string ↔ server numeric) ────────────────

/**
 * Build map from string seat ID (for UI) to server numeric seat ID.
 * Format: "${zoneId}-${rowLabel}-${seatNumber}" → serverId
 */
export function buildSeatIdMap(zone: ServerSeatZoneView): Record<string, number> {
  const map: Record<string, number> = {};
  for (const row of zone.rows) {
    for (const seat of row.seats) {
      map[`${zone.id}-${row.label}-${seat.number}`] = seat.id;
    }
  }
  return map;
}

/**
 * Get booked/occupied seat IDs (string format) from a zone.
 * Includes SOLD, HELD, and HELD_BY_ME seats.
 */
export function getOccupiedSeatIds(zone: ServerSeatZoneView): string[] {
  const occupied: string[] = [];
  for (const row of zone.rows) {
    for (const seat of row.seats) {
      if (seat.availability !== "AVAILABLE") {
        occupied.push(`${zone.id}-${row.label}-${seat.number}`);
      }
    }
  }
  return occupied;
}
