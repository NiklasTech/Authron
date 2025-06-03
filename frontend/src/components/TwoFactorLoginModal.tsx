import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Buttons";
import { useNLSContext } from "../context/NLSContext";

interface TwoFactorLoginModalProps {
  isOpen: boolean;
  onSubmit: (code: string) => Promise<void>;
  error: string | null;
}

export function TwoFactorLoginModal({
  isOpen,
  onSubmit,
  error,
}: TwoFactorLoginModalProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useNLSContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) return;

    setIsSubmitting(true);
    try {
      await onSubmit(code);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={t("two_factor_auth")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="text-center mb-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t("twofa_prompt")}
          </p>
        </div>

        <div className="flex justify-center">
          <input
            type="text"
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-center text-2xl tracking-wide w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 6) {
                setCode(value);
              }
            }}
            placeholder="000000"
            maxLength={6}
            autoFocus
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={code.length !== 6 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? t("verifying") : t("verify")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
