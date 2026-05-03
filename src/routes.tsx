import { createBrowserRouter } from "react-router";

import Home from "./pages/Home.tsx";
import NotFound from "./pages/NotFound.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Event from "./pages/Event.tsx";

import AppLayout from "./layouts/AppLayout.tsx";
import PartnerLayout from "./layouts/PartnerLayout.tsx";
import PaymentLayout from "./layouts/PaymentLayout.tsx";
import EventLayout from "./layouts/EventLayout.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import OTP from "./pages/OTP.tsx";

const AppRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
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
		path: "/register/:key",
		element: <OTP />,
	  }
    ],
  },
  {
    element: <PartnerLayout />,
  },
  {
    element: <PaymentLayout />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default AppRouter;
