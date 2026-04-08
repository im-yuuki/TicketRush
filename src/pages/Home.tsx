import { Link } from "react-router";

import GoogleOAuth from "../components/GoogleOAuth.tsx";

export default function App() {
  return (
    <>
      <GoogleOAuth />
      <Link to="/about">Go to About</Link>
    </>
  );
};
