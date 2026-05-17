import { createBrowserRouter, Navigate } from "react-router";

import Home from "./pages/Home.tsx";
import NotFound from "./pages/NotFound.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Event from "./pages/Event.tsx";
import Booking from "./pages/Booking.tsx";
import BookingDetails from "./pages/BookingDetails.tsx";
import Payment from "./pages/Payment.tsx";
import Checkout from "./pages/Checkout.tsx";
import MyTickets from "./pages/MyTickets.tsx";
import AccountProfile from "./pages/AccountProfile.tsx";
import OrganizationProfile from "./pages/OrganizationProfile.tsx";
import Settings from "./pages/Settings.tsx";
import OrganizerSettings from "./pages/organizer/OrganizerSettings.tsx";
import OrganizerEvents from "./pages/organizer/OrganizerEvents.tsx";
import OrganizerCreateEvent from "./pages/organizer/OrganizerCreateEvent.tsx";
import OrganizerEventPreview from "./pages/organizer/OrganizerEventPreview.tsx";
import OrganizerSeatConfig from "./pages/organizer/OrganizerSeatConfig.tsx";
import { OrganizerReports, OrganizerTerms } from "./pages/organizer/OrganizerPlaceholder.tsx";

import AppLayout from "./layouts/AppLayout.tsx";
import PartnerLayout from "./layouts/PartnerLayout.tsx";
import EventLayout from "./layouts/EventLayout.tsx";
import OrganizerLayout from "./layouts/OrganizerLayout.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import OTP from "./pages/OTP.tsx";

const AppRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/privacy",
        element: <Privacy />,
      },
      {
        path: "/terms",
        element: <Terms />,
      },
      {
        path: "/my-tickets",
        element: <MyTickets />,
      },
      {
        path: "/account",
        element: <AccountProfile />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/events/:eventId",
        element: <EventLayout />,
        children: [
          {
            index: true,
            element: <Event />,
          },
        ],
      },
	  {
		path: "/login",
		element: <Login />,
	  },
	  {
		path: "/register/",
		element: <Register />,
	  },
	  {
		path: "/otp",
		element: <OTP />,
	  },
      {
        path: "/:eventId",
        element: <OrganizerEventPreview />,
        children: [
          {
            index: true,
            element: <Event />,
          },
        ],
      },
    ],
  },
  {
    path: "/events/:eventId/booking",
    element: <Booking />,
  },
  {
    path: "/events/:eventId/booking-details",
    element: <BookingDetails />,
  },
  {
    path: "/events/:eventId/payment",
    element: <Payment />,
  },
  {
    path: "/checkout/:sessionId",
    element: <Checkout />,
  },
  {
    path: "/organizer",
    element: <OrganizerLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/organizer/events" replace />,
      },
      {
        path: "events",
        element: <OrganizerEvents />,
      },
      {
        path: "profile",
        element: <OrganizationProfile />,
      },
      {
        path: "settings",
        element: <OrganizerSettings />,
      },
      {
        path: "events/create",
        element: <OrganizerCreateEvent />,
      },
      {
        path: "events/:eventId/edit",
        element: <OrganizerCreateEvent />,
      },
      {
        path: "events/:eventId/seats",
        element: <OrganizerSeatConfig />,
      },
      {
        path: "reports",
        element: <OrganizerReports />,
      },
      {
        path: "terms",
        element: <OrganizerTerms />,
      },
    ],
  },
  {
    element: <PartnerLayout />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default AppRouter;
