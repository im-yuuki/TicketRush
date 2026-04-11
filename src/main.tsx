import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import AppRouter from "./routes.tsx";
import { NavigationBar } from "./layout/NavigationBar.tsx";
import { Footer } from "./layout/Footer.tsx";

import "./i18n.ts";
import "./globals.css";

const GOOGLE_CLIENT_ID = "136819472606-lggdq3cb52ogfb6ebjc0hn6l30hmkb2j.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex min-h-dvh flex-col">
        <NavigationBar />
        <main className="flex min-h-0 flex-1 flex-col">
          <RouterProvider router={AppRouter} />
        </main>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  </StrictMode>,
);
