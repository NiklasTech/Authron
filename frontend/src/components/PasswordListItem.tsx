import { useState, useEffect, useRef } from "react";
import { FiCopy, FiTag, FiStar, FiShield, FiLock } from "react-icons/fi";
import { PasswordEntry } from "../types/PasswordEntry";
import { useNLSContext } from "../context/NLSContext";
import * as TOTPService from "../services/TOTPService";

interface PasswordListItemProps {
  entry: PasswordEntry;
  isSelected: boolean;
  onSelect: () => void;
  onCopy: (field: "username" | "password") => void;
}

export function PasswordListItem({
  entry,
  isSelected,
  onSelect,
  onCopy,
}: PasswordListItemProps) {
  const { t } = useNLSContext();
  const [totpCode, setTotpCode] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isLoadingTOTP, setIsLoadingTOTP] = useState<boolean>(false);
  const intervalIdRef = useRef<number | null>(null);
  const lastTimeStepRef = useRef<number>(0);
  const lastRenderedSecondRef = useRef<number>(0);

  useEffect(() => {
    const loadTOTPCode = async () => {
      if (!entry.totp_enabled || !entry.id) return;

      try {
        setIsLoadingTOTP(true);
        const data = await TOTPService.getTOTPCode(entry.id);

        setTotpCode(data.code);
        setRemainingTime(data.remaining_seconds);
        lastRenderedSecondRef.current = Math.floor(data.remaining_seconds);

        const now = Date.now() / 1000;
        const timeStep = Math.floor(now / 30);
        lastTimeStepRef.current = timeStep;
      } catch (error) {
        console.error("Fehler beim Laden des TOTP-Codes:", error);
        setTotpCode("");
      } finally {
        setIsLoadingTOTP(false);
      }
    };

    const updateDisplay = () => {
      if (!entry.totp_enabled) return;

      const now = Date.now() / 1000;
      const currentTimeStep = Math.floor(now / 30);
      const remaining = 30 - (now % 30);
      const remainingFloor = Math.floor(remaining);

      if (currentTimeStep !== lastTimeStepRef.current) {
        lastTimeStepRef.current = currentTimeStep;
        loadTOTPCode();
        return;
      }

      if (remainingFloor !== lastRenderedSecondRef.current) {
        lastRenderedSecondRef.current = remainingFloor;
        setRemainingTime(remainingFloor);
      }
    };

    if (entry.totp_enabled && !intervalIdRef.current) {
      loadTOTPCode();

      intervalIdRef.current = window.setInterval(updateDisplay, 100);
    } else if (!entry.totp_enabled && intervalIdRef.current) {
      setTotpCode("");
      setRemainingTime(0);
    }

    return () => {
      if (intervalIdRef.current) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [entry.id, entry.totp_enabled]);

  const copyTOTPCode = async () => {
    if (totpCode) {
      try {
        await navigator.clipboard.writeText(totpCode);
        console.log("TOTP-Code kopiert!");
      } catch (error) {
        console.error("Fehler beim Kopieren des TOTP-Codes:", error);
      }
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`
        p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200
        ${
          isSelected
            ? "bg-blue-500 text-white shadow-md"
            : "bg-white dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
        }
        border border-gray-200 dark:border-gray-600
      `}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-medium truncate">{entry.label}</h3>
        <div className="flex space-x-1 ml-2 flex-shrink-0">
          {entry.favorite && (
            <span
              className={`flex items-center ${
                isSelected ? "text-yellow-200" : "text-yellow-500"
              }`}
            >
              <FiStar size={14} fill="currentColor" />
            </span>
          )}
          {entry.totp_enabled && (
            <span
              className={`flex items-center ${
                isSelected ? "text-green-200" : "text-green-500"
              }`}
              title={t("totp_enabled")}
            >
              <FiShield size={14} />
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy("username");
            }}
            className={`p-1 rounded-full ${
              isSelected
                ? "hover:bg-blue-600"
                : "hover:bg-gray-200 dark:hover:bg-gray-500"
            }`}
            title={t("copy_username")}
          >
            <FiCopy size={14} />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center mt-1">
        <p
          className={`text-xs truncate ${
            isSelected ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {entry.username}
        </p>
        {entry.category && (
          <span
            className={`flex items-center text-xs rounded-full px-2 py-0.5 ${
              isSelected
                ? "bg-blue-600 text-blue-100"
                : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
            }`}
          >
            <FiTag size={10} className="mr-1" />
            {entry.category}
          </span>
        )}
      </div>

      {entry.totp_enabled && totpCode && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiLock
                size={12}
                className={`mr-1 ${
                  isSelected
                    ? "text-blue-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isSelected
                    ? "text-blue-100"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                TOTP:
              </span>
            </div>
            {isLoadingTOTP ? (
              <span className="text-xs italic">Lädt...</span>
            ) : (
              <div className="flex items-center">
                <span
                  className={`text-sm font-mono ${
                    isSelected
                      ? "text-white font-semibold"
                      : "text-gray-800 dark:text-gray-100"
                  }`}
                >
                  {totpCode}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyTOTPCode();
                  }}
                  className={`ml-2 p-1 rounded-full ${
                    isSelected
                      ? "hover:bg-blue-600"
                      : "hover:bg-gray-200 dark:hover:bg-gray-500"
                  }`}
                  title={t("copy")}
                >
                  <FiCopy size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="mt-1 w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isSelected ? "bg-green-300" : "bg-green-500"
              }`}
              style={{
                width: `${(remainingTime / 30) * 100}%`,
                transition: "width 1s linear",
              }}
            ></div>
          </div>
        </div>
      )}

      {entry.lastUpdated && (
        <div
          className={`text-xs mt-1 ${
            isSelected ? "text-blue-100" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {t("refreshed")} {entry.lastUpdated}
        </div>
      )}
    </div>
  );
}
