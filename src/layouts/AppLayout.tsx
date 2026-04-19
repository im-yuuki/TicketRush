import { Outlet } from "react-router";
import Footer from "../components/Footer.tsx";
import NavBar from "../components/NavBar.tsx";

export default function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
