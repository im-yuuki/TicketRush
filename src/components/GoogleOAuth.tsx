import { GoogleLogin } from "@react-oauth/google";

export default function GoogleOAuth() {
  return (
    <div style={{ colorScheme: "light" }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          console.log("Authorization with Google successful: ", credentialResponse);
          // Send credential to backend
        }}
        onError={() => {
          console.log("Authorization with Google failed");
        }}
        text="continue_with"
      />
    </div>
  );
}
