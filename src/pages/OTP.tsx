import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { Card } from "@heroui/react";
import { triggerOTPEmail, verifyOTPRegister } from "../api/auth";

export default function OTP() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { key } = useParams<{ key: string }>();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const handleSubmit = useCallback(async () => {
    if (!key || isSubmitting) {
      return;
    }

    const otpCode = otp.join("");
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await verifyOTPRegister(key, { otpCode });
      console.log("OTP submitted:", { key, otpCode });
      setSuccessMessage("OTP verified successfully");
      window.setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "OTP verification failed";
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, key, otp]);

  useEffect(() => {
    if (key) {
      triggerOTPEmail(key).catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to send OTP email";
        setSubmitError(message);
      });
    }
  }, [key]);

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [otp, handleSubmit]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit (0-9)
    const digit = value.replace(/[^0-9]/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Handle backspace to move to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");

    const newOtp = Array(6).fill("");
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input or input 5
    const lastFilledIndex = newOtp.findIndex((d) => d === "");
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex - 1;
    inputRefs.current[Math.max(0, focusIndex)]?.focus();
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <Card.Header className="flex flex-col gap-3 border-b border-border pb-4">
          <h1 className="text-2xl font-bold">
            {t("auth.verifyOTP", "Verify OTP")}
          </h1>
          <p className="text-sm text-muted">
            {t(
              "auth.otpDescription",
              "Enter the 6-digit code sent to your email",
            )}
          </p>
        </Card.Header>

        <Card.Content className="gap-4">
          {successMessage && <p className="text-sm text-success">{successMessage}</p>}
          {submitError && <p className="text-sm text-danger">{submitError}</p>}

          {/* OTP Input Grid */}
          <div className="flex gap-3 justify-center my-4">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) =>
                    handleInputChange(index, e.currentTarget.value)
                  }
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  placeholder=""
                  autoFocus={index === 0}
                  className={`w-12 h-20 text-center text-2xl font-bold rounded-md transition-all ${
                    otp[index]
                      ? "border-2 border-accent text-accent"
                      : "border border-border hover:border-accent focus:border-accent"
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
                />
              ))}
          </div>

          {/* Resend OTP Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-muted">
              {t("auth.noCodeReceived", "Didn't receive the code?")}
              <button className="ml-1 text-accent hover:underline">
                {t("auth.resendOTP", "Resend OTP")}
              </button>
            </p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
