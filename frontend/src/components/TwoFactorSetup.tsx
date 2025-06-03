import { useState } from "react";
import { Button } from "./Buttons";
import { TextField } from "./TextField";
import { useNLSContext } from "../context/NLSContext";
import { useAuth } from "../context/AuthContext";

interface TwoFactorSetupProps {
  onComplete?: () => void;
}

export function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const { t } = useNLSContext();
  const { setupTwoFactor, verifyTwoFactor } = useAuth();
  const [step, setStep] = useState<"initial" | "setup" | "verify" | "complete">(
    "initial"
  );
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSetup = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await setupTwoFactor();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setStep("setup");
    } catch {
      setError(t("twofa_setup_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError(t("twofa_code_invalid"));
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const success = await verifyTwoFactor(verificationCode);
      if (success) {
        setStep("complete");
        if (onComplete) onComplete();
      } else {
        setError(t("twofa_code_incorrect"));
      }
    } catch {
      setError(t("twofa_verification_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
          {error}
        </div>
      )}

      {step === "initial" && (
        <div className="text-center">
          <h3 className="text-lg font-medium mb-3">{t("twofa_setup_title")}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("twofa_setup_description")}
          </p>
          <Button onClick={handleSetup} disabled={isLoading}>
            {isLoading ? t("loading") : t("twofa_setup_start")}
          </Button>
        </div>
      )}

      {step === "setup" && (
        <div>
          <h3 className="text-lg font-medium mb-3">{t("twofa_scan_title")}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("twofa_scan_description")}
          </p>

          <div className="flex justify-center mb-4">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium mb-1">
              {t("twofa_manual_entry")}
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center font-mono">
              {secret}
            </div>
          </div>

          <TextField
            label={t("twofa_verification_code")}
            placeholder="123456"
            value={verificationCode}
            onChange={setVerificationCode}
          />

          <div className="flex justify-end mt-4">
            <Button onClick={handleVerify} disabled={isLoading}>
              {isLoading ? t("verifying") : t("verify")}
            </Button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div className="text-center">
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-medium mb-2">
              {t("twofa_setup_success")}
            </h3>
            <p>{t("twofa_setup_success_description")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
