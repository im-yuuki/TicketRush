import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import AppRouter from "./routes.tsx";
import { BookingProvider } from "./contexts/BookingContext.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";

import "./i18n.ts";
import "./globals.css";

const GOOGLE_CLIENT_ID = "136819472606-lggdq3cb52ogfb6ebjc0hn6l30hmkb2j.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BookingProvider>
          <RouterProvider router={AppRouter} />
        </BookingProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
