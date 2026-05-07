import { FileText, FolderOpen } from "lucide-react";
import OrganizerPageShell from "../../components/organizer/OrganizerPageShell";
import OrganizerPlaceholderCard from "../../components/organizer/OrganizerPlaceholderCard";

type PlaceholderKind = "reports" | "terms";

const placeholderIcons = {
  reports: FolderOpen,
  terms: FileText,
};

function OrganizerPlaceholder({ kind }: { kind: PlaceholderKind }) {
  return (
    <OrganizerPageShell
      background="placeholder"
      contentClassName=""
      paddingClassName="px-4 py-8 md:px-6 lg:px-7"
    >
      <OrganizerPlaceholderCard icon={placeholderIcons[kind]} kind={kind} />
    </OrganizerPageShell>
  );
}

export function OrganizerReports() {
  return <OrganizerPlaceholder kind="reports" />;
}

export function OrganizerTerms() {
  return <OrganizerPlaceholder kind="terms" />;
}
