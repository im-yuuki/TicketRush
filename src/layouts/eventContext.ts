import { useOutletContext } from "react-router";
import type { EventData } from "../data/events";

export type EventContext = { event: EventData };

export function useEvent() {
  return useOutletContext<EventContext>().event;
}
