import { useState } from "react";
import { FiShield, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { Modal } from "./Modal";
import { Button } from "./Buttons";
import { TextField } from "./TextField";
import * as TOTPService from "../services/TOTPService";
import { useNLSContext } from "../context/NLSContext";

interface TOTPSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  passwordId: number;
  onSetupComplete: () => void;
}

export function TOTPSetupModal({
  isOpen,
  onClose,
  passwordId,
  onSetupComplete,
}: TOTPSetupModalProps) {
  const { t } = useNLSContext();
  const [totpSecret, setTotpSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!totpSecret.trim()) {
      setError(t("please_enter_totp_secret"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await TOTPService.setupTOTP(passwordId, totpSecret.trim());
      setIsSuccess(true);
      setTimeout(() => {
        onSetupComplete();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Fehler beim Einrichten des TOTP-Secrets:", err);
      setError(t("totp_setup_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("add_totp_authenticator")}
    >
      {isSuccess ? (
        <div className="text-center py-4">
          <FiCheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <p className="text-lg font-medium mb-2">{t("totp_setup_success")}</p>
          <p className="text-gray-600 dark:text-gray-400">
            {t("totp_setup_success_description")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-center">
              <FiAlertCircle className="mr-2 flex-shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FiShield className="text-blue-500 mr-2" size={18} />
              <h3 className="text-blue-800 dark:text-blue-300 font-medium">
                {t("totp_setup_info")}
              </h3>
            </div>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              {t("totp_setup_instruction")}
            </p>
          </div>

          <TextField
            label={t("totp_secret")}
            placeholder="ABCDEFGHIJKLMNOP"
            value={totpSecret}
            onChange={setTotpSecret}
          />

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>{t("totp_secret_help")}</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{t("totp_secret_help_1")}</li>
              <li>{t("totp_secret_help_2")}</li>
              <li>{t("totp_secret_help_3")}</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="secondary" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !totpSecret.trim()}
            >
              {isLoading ? t("saving") : t("save")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
