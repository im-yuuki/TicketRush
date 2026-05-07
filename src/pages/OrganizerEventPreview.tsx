import { useParams } from "react-router";
import EventLayout from "../layouts/EventLayout";
import NotFound from "./NotFound";

export default function OrganizerEventPreview() {
  const { eventId } = useParams<{ eventId: string }>();

  if (!eventId?.startsWith("-")) {
    return <NotFound />;
  }

  return <EventLayout eventIdOverride={eventId.slice(1)} />;
}
