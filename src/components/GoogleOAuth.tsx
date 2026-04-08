import { GoogleLogin } from "@react-oauth/google";

export default function GoogleOAuth() {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        console.log("Authorization with Google successful: ", credentialResponse);
        // Send credential to backend
      }}
      onError={() => {
        console.log("Authorization with Google failed");
      }}
      shape="pill"
      text="continue_with"
    />
  );
}
