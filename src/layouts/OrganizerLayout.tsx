import { Outlet } from "react-router";
import OrganizerHeader from "../components/organizer/OrganizerHeader";
import OrganizerSidebar, { OrganizerLanguageSwitch } from "../components/organizer/OrganizerSidebar";

export default function OrganizerLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      <OrganizerSidebar />

      <div className="min-w-0">
        <OrganizerHeader />

        <main className="min-h-dvh overflow-x-hidden pt-16">
          <Outlet />
        </main>

        <div className="border-t border-border p-4 lg:hidden">
          <OrganizerLanguageSwitch />
        </div>
      </div>
    </div>
  );
}
