import { Outlet } from "react-router";
import Footer from "../components/Footer.tsx";
import NavBar from "../components/NavBar.tsx";

export default function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <NavBar className="fixed top-0 left-0 right-0 z-50 border-b-2 border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-lg" />
      <main className="flex-1 container mx-auto">
        <Outlet />
      </main>
      <Footer className="border-t-2 border-border" />
    </div>
  );
}
