import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Input, Separator } from "@heroui/react";
import { useGoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router";
import { getAccount, loginUser } from "../api/auth";
import type { AccountResponse } from "../types/requestDto";
import { useAuth } from "../contexts/AuthContext";

function readAccountSnapshot(accountResponse: AccountResponse) {
  const displayName = accountResponse.name;
  const accountEmail = accountResponse.email;
  const avatarUrl = "avatarUrl" in accountResponse ? accountResponse.avatarUrl : undefined;
  const role = accountResponse.role;

  return {
    displayName,
    email: accountEmail,
    avatarUrl,
    role,
  };
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAccount } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (credentialResponse) => {
      console.log("Google login successful:", credentialResponse);
      // TODO: Send credential to backend
    },
    onError: () => {
      console.log("Google login failed");
    },
  });

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await loginUser({ email, password });
      const accountResponse = await getAccount();
      setAccount(readAccountSnapshot(accountResponse));
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("An unexpected error occurred");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <Card.Header className="flex flex-col gap-3 border-b border-border pb-4">
          <h1 className="text-2xl font-bold">{t("auth.login", "Login")}</h1>
          <p className="text-sm text-muted">
            {t("auth.noAccount", "Don't have an account?")}
            <Link to="/register" className="ml-1 text-accent hover:underline">
              {t("auth.createAccount", "Create one")}
            </Link>
          </p>
        </Card.Header>

        <Card.Content className="gap-4">
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="text-sm font-bold block">{t("auth.email", "Email")}</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onInput={(e) => {
                setEmail(e.currentTarget.value);
                if (submitError) setSubmitError(null);
              }}
              className="w-full border border-border hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors rounded-md"
              required
            />

            <label className="text-sm font-bold block">{t("auth.password", "Password")}</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onInput={(e) => {
                setPassword(e.currentTarget.value);
                if (submitError) setSubmitError(null);
              }}
              className="w-full border border-border hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors rounded-md"
              required
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                {t("auth.forgotPassword", "Forgot password?")}
              </Link>
            </div>

            {submitError && <p className="text-danger text-sm">{submitError}</p>}

            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              size="lg"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? t("auth.loggingIn", "Logging in...") : t("auth.loginWithEmail", "Login with Email")}
            </Button>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted">{t("auth.orContinueWith", "Or continue with")}</span>
            <Separator className="flex-1" />
          </div>

          {/* Google Login */}
          <div>
            <Button
              type="button"
              className="w-full bg-white text-accent-foreground hover:bg-white/90 flex items-center justify-center gap-2"
              size="lg"
              onClick={() => loginWithGoogle()}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.498 12.227c0-.78-.07-1.462-.201-2.096H12v3.968h6.356c-.273 1.472-1.11 2.72-2.367 3.556v2.96h3.823c2.237-2.061 3.686-5.088 3.686-8.388z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.966-1.073 7.954-2.913l-3.823-2.96c-1.064.713-2.43 1.134-4.131 1.134-3.181 0-5.878-2.146-6.838-5.03H1.213v3.164C3.182 21.81 7.286 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.162 14.231a7.205 7.205 0 010-4.462V6.606H1.213a11.998 11.998 0 000 10.788l3.949-3.163z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.771c1.76 0 3.344.606 4.592 1.797l3.439-3.439C17.966 1.204 15.24 0 12 0 7.286 0 3.182 2.19 1.213 5.606l3.949 3.163C6.122 6.917 8.819 4.771 12 4.771z"
                />
              </svg>
              {t("auth.loginWithGoogle", "Login with Google")}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
