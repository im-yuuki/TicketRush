import { useEffect, useState } from "react";
import { getEvent, fetchEventById, type EventData } from "../data/events";

/**
 * Load event data for booking/payment pages.
 * Tries sync lookup first (localStorage/mock), then async fetch from server.
 */
export function useEventData(eventId: string | undefined) {
  const localEvent = eventId ? getEvent(eventId) : null;
  const [serverEvent, setServerEvent] = useState<EventData | null>(null);
  const shouldFetch = !localEvent && !!eventId && /^\d+$/.test(eventId);
  const [loading, setLoading] = useState(shouldFetch);

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;
    fetchEventById(eventId).then((result) => {
      if (!cancelled) {
        setServerEvent(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [eventId, shouldFetch]);

  return {
    event: localEvent ?? serverEvent,
    loading,
  };
}
