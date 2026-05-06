import type { TicketTier } from "../data/events";
import type { SeatGroup } from "../types/booking";

export function computeSeatGroups(
  selectedSeats: string[],
  seatToTierMap: Record<string, string>,
  ticketTiers: TicketTier[],
  fallbackPrice: number,
): SeatGroup[] {
  const grouped: Record<string, string[]> = {};
  selectedSeats.forEach((seatId) => {
    const tierId = seatToTierMap[seatId] || ticketTiers[0]?.id || "";
    if (!grouped[tierId]) grouped[tierId] = [];
    grouped[tierId].push(seatId);
  });

  return Object.entries(grouped).map(([tierId, seats]) => {
    const tier = ticketTiers.find((t) => t.id === tierId);
    return {
      tierId,
      tierName: tier?.name || tierId,
      seats,
      unitPrice: tier?.price || fallbackPrice,
      subtotal: (tier?.price || fallbackPrice) * seats.length,
    };
  });
}

export function computeTotalAmount(groups: SeatGroup[]): number {
  return groups.reduce((sum, g) => sum + g.subtotal, 0);
}
