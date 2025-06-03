import { useState, useEffect, useCallback } from "react";
import { FiCopy, FiRefreshCw } from "react-icons/fi";
import { Modal } from "./Modal";
import { Button } from "./Buttons";
import { CustomCheckbox } from "./CustomCheckbox";
import { useNLSContext } from "../context/NLSContext";

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassword: (password: string) => void;
}

interface PasswordStrength {
  value: number;
  label: string;
  color: string;
}

export function PasswordGeneratorModal({
  isOpen,
  onClose,
  onSelectPassword,
}: PasswordGeneratorModalProps) {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    value: 0,
    label: "",
    color: "",
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const { t } = useNLSContext();

  const calculatePasswordStrength = useCallback(
    (password: string): PasswordStrength => {
      if (!password || password === t("select_char_type"))
        return { value: 0, label: t("strength_not_rated"), color: "gray-500" };

      let strength = 0;
      let complexity = 0;

      strength += Math.min(60, password.length * 2);

      if (/[a-z]/.test(password)) complexity += 1;
      if (/[A-Z]/.test(password)) complexity += 1;
      if (/[0-9]/.test(password)) complexity += 1;
      if (/[^a-zA-Z0-9]/.test(password)) complexity += 1;

      if (complexity === 1) strength += 5;
      if (complexity === 2) strength += 12;
      if (complexity === 3) strength += 25;
      if (complexity === 4) strength += 40;

      const repeatPattern = /(.)\1{2,}/g;
      const repeats = password.match(repeatPattern);
      if (repeats) {
        strength -= repeats.length * 5;
      }

      const sequences = [
        "abcdefghijklmnopqrstuvwxyz",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "0123456789",
      ];
      for (const seq of sequences) {
        for (let i = 3; i < seq.length; i++) {
          const fragment = seq.substring(i - 3, i);
          if (password.includes(fragment)) {
            strength -= 3;
          }
        }
      }

      strength = Math.max(0, Math.min(100, strength));

      let label: string;
      let color: string;

      if (strength < 30) {
        label = t("very_weak");
        color = "red-500";
      } else if (strength < 60) {
        label = t("medium");
        color = "yellow-500";
      } else if (strength < 80) {
        label = t("good");
        color = "green-500";
      } else if (strength < 90) {
        label = t("strong");
        color = "green-600";
      } else {
        label = t("very_strong");
        color = "blue-600";
      }

      return { value: strength, label, color };
    },
    [t]
  );

  const generatePassword = useCallback(() => {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let chars = "";
    if (includeUppercase) chars += uppercaseChars;
    if (includeLowercase) chars += lowercaseChars;
    if (includeNumbers) chars += numberChars;
    if (includeSymbols) chars += symbolChars;

    if (chars.length === 0) {
      setGeneratedPassword(t("select_char_type"));
      setPasswordStrength({
        value: 0,
        label: t("strength_not_rated"),
        color: "gray-500",
      });
      return;
    }

    let password = "";
    let hasUppercase = false;
    let hasLowercase = false;
    let hasNumber = false;
    let hasSymbol = false;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      const char = chars[randomIndex];
      password += char;

      if (uppercaseChars.includes(char)) hasUppercase = true;
      if (lowercaseChars.includes(char)) hasLowercase = true;
      if (numberChars.includes(char)) hasNumber = true;
      if (symbolChars.includes(char)) hasSymbol = true;
    }

    let modifiedPassword = password;

    if (includeUppercase && !hasUppercase) {
      const randomPos = Math.floor(Math.random() * password.length);
      const randomChar =
        uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
      modifiedPassword =
        modifiedPassword.substring(0, randomPos) +
        randomChar +
        modifiedPassword.substring(randomPos + 1);
    }

    if (includeLowercase && !hasLowercase) {
      const randomPos = Math.floor(Math.random() * password.length);
      const randomChar =
        lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
      modifiedPassword =
        modifiedPassword.substring(0, randomPos) +
        randomChar +
        modifiedPassword.substring(randomPos + 1);
    }

    if (includeNumbers && !hasNumber) {
      const randomPos = Math.floor(Math.random() * password.length);
      const randomChar =
        numberChars[Math.floor(Math.random() * numberChars.length)];
      modifiedPassword =
        modifiedPassword.substring(0, randomPos) +
        randomChar +
        modifiedPassword.substring(randomPos + 1);
    }

    if (includeSymbols && !hasSymbol) {
      const randomPos = Math.floor(Math.random() * password.length);
      const randomChar =
        symbolChars[Math.floor(Math.random() * symbolChars.length)];
      modifiedPassword =
        modifiedPassword.substring(0, randomPos) +
        randomChar +
        modifiedPassword.substring(randomPos + 1);
    }

    setGeneratedPassword(modifiedPassword);
    setPasswordStrength(calculatePasswordStrength(modifiedPassword));
  }, [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    calculatePasswordStrength,
    t,
  ]);

  const copyToClipboard = async () => {
    if (generatedPassword && generatedPassword !== t("select_char_type")) {
      try {
        await navigator.clipboard.writeText(generatedPassword);
        setCopySuccess(true);

        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (err) {
        console.error("Fehler beim Kopieren:", err);
      }
    }
  };

  const handleUse = () => {
    if (
      generatedPassword &&
      generatedPassword.length > 0 &&
      generatedPassword !== t("select_char_type")
    ) {
      onSelectPassword(generatedPassword);
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      generatePassword();
    }
  }, [isOpen, generatePassword]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("password_generator_title")}
    >
      <div className="mb-6">
        <div className="relative mb-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="font-mono break-all text-lg flex-1">
              {generatedPassword}
            </div>
            <div className="flex gap-2 ml-3">
              <button
                onClick={copyToClipboard}
                className={`p-2 rounded-lg text-white transition-colors ${
                  copySuccess
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                title={copySuccess ? t("copied") : t("copy_to_clipboard")}
              >
                {copySuccess ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <FiCopy size={18} />
                )}
              </button>
              <button
                onClick={generatePassword}
                className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                title={t("generate_new")}
              >
                <FiRefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">
                {t("password_strength")}: {passwordStrength.label}
              </span>
              <span
                className={`text-sm font-medium text-${passwordStrength.color}`}
              >
                {Math.round(passwordStrength.value)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-${passwordStrength.color} transition-all duration-500`}
                style={{ width: `${passwordStrength.value}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            {t("password_length")}: {length} {t("characters")}
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs">8</span>
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-xs">32</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <div className="text-center">
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                {t("weak")}
              </span>
            </div>
            <div className="text-center">
              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                {t("medium")}
              </span>
            </div>
            <div className="text-center">
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                {t("strong")}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium">{t("included_chars")}</h3>
          <div className="grid grid-cols-2 gap-2">
            <CustomCheckbox
              id="uppercase"
              checked={includeUppercase}
              onChange={setIncludeUppercase}
              label={t("uppercase")}
            />
            <CustomCheckbox
              id="lowercase"
              checked={includeLowercase}
              onChange={setIncludeLowercase}
              label={t("lowercase")}
            />
            <CustomCheckbox
              id="numbers"
              checked={includeNumbers}
              onChange={setIncludeNumbers}
              label={t("numbers")}
            />
            <CustomCheckbox
              id="symbols"
              checked={includeSymbols}
              onChange={setIncludeSymbols}
              label={t("symbols")}
            />
          </div>
        </div>

        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-blue-800 dark:text-blue-300 text-sm">
          <h4 className="font-medium">{t("password_tips")}:</h4>
          <ul className="list-disc list-inside mt-1 ml-1 space-y-1">
            <li>{t("tip_length")}</li>
            <li>{t("tip_variety")}</li>
            <li>{t("tip_unique")}</li>
            <li>{t("tip_manager")}</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={handleUse}
          disabled={
            !generatedPassword || generatedPassword === t("select_char_type")
          }
        >
          {t("use_password")}
        </Button>
      </div>
    </Modal>
  );
}
