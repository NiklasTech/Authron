import { useState, useEffect, useRef } from "react";
import {
  FiCopy,
  FiTag,
  FiShield,
  FiEye,
  FiEyeOff,
  FiExternalLink,
  FiTrash2,
  FiEdit2,
  FiAlertTriangle,
  FiChevronLeft,
  FiCalendar,
  FiClock,
  FiLoader,
  FiShare2,
} from "react-icons/fi";
import { Card } from "./Card";
import { Button } from "./Buttons";
import { CustomCheckbox } from "./CustomCheckbox";
import { Modal } from "./Modal";
import { TextField } from "./TextField";
import { PasswordEntry } from "../types/PasswordEntry";
import * as PasswordService from "../services/PasswordServices";
import { useNLSContext } from "../context/NLSContext";
import * as TOTPService from "../services/TOTPService";
import { TOTPSetupModal } from "./TOTPModal";
import * as PasswordSharingService from "../services/PasswordSharingService";

interface PasswordDetailProps {
  entry: PasswordEntry;
  onEdit: () => void;
  onDelete: () => void;
  onBack?: () => void;
  onToggleFavorite?: (entryId: number) => void;
  onUpdateEntry?: (entry: PasswordEntry) => void;
  loading?: boolean;
}

export function PasswordDetail({
  entry,
  onEdit,
  onDelete,
  onBack,
  onToggleFavorite,
  onUpdateEntry,
  loading = false,
}: PasswordDetailProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isTOTPSetupModalOpen, setIsTOTPSetupModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState("");
  const [, setCopySuccess] = useState(false);
  const [totpCode, setTotpCode] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isLoadingTOTP, setIsLoadingTOTP] = useState<boolean>(false);
  const lastTimeStepRef = useRef<number>(0);
  const lastRenderedSecondRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const { t } = useNLSContext();

  const passwordStrength = PasswordService.calculatePasswordStrength(
    entry.password || ""
  );
  const strengthLabel = PasswordService.getStrengthLabel(passwordStrength, t);

  useEffect(() => {
    if (!intervalRef.current && entry.totp_enabled && entry.id) {
      const loadTOTPCode = async () => {
        try {
          setIsLoadingTOTP(true);
          const data = await TOTPService.getTOTPCode(entry.id);
          setTotpCode(data.code);

          lastTimeStepRef.current = Math.floor(Date.now() / 1000 / 30);
          lastRenderedSecondRef.current = data.remaining_seconds;

          setRemainingTime(data.remaining_seconds);
          setIsLoadingTOTP(false);
        } catch (error) {
          console.error("Fehler beim Laden des TOTP-Codes:", error);
          setIsLoadingTOTP(false);
        }
      };

      const timerCallback = () => {
        if (!entry.totp_enabled) return;

        const now = Date.now() / 1000;
        const currentTimeStep = Math.floor(now / 30);
        const remaining = 30 - (now % 30);

        const progressElement = document.getElementById(
          `totp-progress-${entry.id}`
        );
        if (progressElement) {
          progressElement.style.width = `${(remaining / 30) * 100}%`;
        }

        if (Math.floor(remaining) !== lastRenderedSecondRef.current) {
          lastRenderedSecondRef.current = Math.floor(remaining);
          setRemainingTime(Math.floor(remaining));
        }

        if (currentTimeStep !== lastTimeStepRef.current) {
          lastTimeStepRef.current = currentTimeStep;
          loadTOTPCode();
        }
      };

      loadTOTPCode();

      intervalRef.current = window.setInterval(timerCallback, 250);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [entry.id, entry.totp_enabled]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [entry.id]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);

      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Fehler beim Kopieren:", err);
    }
  };

  const copyTOTPCode = async () => {
    if (totpCode) {
      try {
        await navigator.clipboard.writeText(totpCode);
        setCopySuccess(true);

        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (error) {
        console.error("Fehler beim Kopieren des TOTP-Codes:", error);
      }
    }
  };

  const handleOpenWebsite = () => {
    if (!entry.url) return;

    let url = entry.url.trim();

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    try {
      new URL(url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      console.error("Ungültige URL:", entry.url);
    }
  };

  const handleDisableTOTP = async () => {
    if (!entry.id) return;

    try {
      await TOTPService.disableTOTP(entry.id);
      if (onUpdateEntry) {
        onUpdateEntry({ ...entry, totp_enabled: false });
      }
    } catch (error) {
      console.error("Fehler beim Deaktivieren von TOTP:", error);
    }
  };

  const handleShare = async () => {
    if (!shareEmail || !entry.id) return;

    setIsSharing(true);
    setShareError("");
    setShareSuccess(false);

    try {
      await PasswordSharingService.sharePassword(entry.id, shareEmail);

      setShareSuccess(true);
      setTimeout(() => {
        setIsShareModalOpen(false);
        setShareEmail("");
        setShareSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Fehler beim Teilen des Passworts:", error);
      setShareError(t("share_error"));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card title={entry.label} className="w-full p-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-2 flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 text-sm"
        >
          <FiChevronLeft className="mr-1" size={14} />
          {t("back_to_list")}
        </button>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          {onToggleFavorite && (
            <CustomCheckbox
              id={`favorite-${entry.id}`}
              checked={entry.favorite || false}
              onChange={() => onToggleFavorite(entry.id)}
              label={t("mark_favorite")}
              className="mb-0"
            />
          )}

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 text-sm"
            title={t("share_password")}
          >
            <FiShare2 className="mr-1" size={16} />
            {t("share_password")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
          <div className="flex items-center">
            <FiTag
              className="text-gray-500 dark:text-gray-400 mr-2"
              size={16}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-1">
              {t("category")}:
            </span>
            <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {entry.category || t("general")}
            </span>
          </div>
          <div className="flex items-center">
            <FiCalendar
              className="text-gray-500 dark:text-gray-400 mr-2"
              size={16}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-1">
              {t("last_updated")}:
            </span>
            <span className="text-sm">{entry.lastUpdated || "Unbekannt"}</span>
          </div>
          {entry.lastUsed && (
            <div className="flex items-center">
              <FiClock
                className="text-gray-500 dark:text-gray-400 mr-2"
                size={16}
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-1">
                {t("last_used")}:
              </span>
              <span className="text-sm">{entry.lastUsed}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("username")}
        </label>
        <div className="flex h-9">
          <div className="flex-1 bg-gray-100 dark:bg-gray-600 p-2 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-500 break-all flex items-center text-sm">
            {entry.username}
          </div>
          <button
            onClick={() => copyToClipboard(entry.username)}
            className="bg-gray-200 dark:bg-gray-700 p-2 rounded-r-lg border border-gray-300 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
            title={t("copy")}
          >
            <FiCopy size={15} />
          </button>
        </div>
      </div>

      {entry.url && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("website")}
          </label>
          <div className="flex h-9">
            <div className="flex-1 bg-gray-100 dark:bg-gray-600 p-2 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-500 break-all flex items-center text-sm">
              {entry.url}
            </div>
            <button
              onClick={() => copyToClipboard(entry.url || "")}
              className="bg-gray-200 dark:bg-gray-700 p-2 border border-r-0 border-gray-300 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
              title={t("copy")}
            >
              <FiCopy size={15} />
            </button>
            <button
              onClick={handleOpenWebsite}
              className="bg-gray-200 dark:bg-gray-700 p-2 rounded-r-lg border border-gray-300 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
              title={t("open_website")}
            >
              <FiExternalLink size={15} />
            </button>
          </div>
        </div>
      )}

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("password")}
        </label>
        <div className="flex h-9">
          <div className="flex-1 bg-gray-100 dark:bg-gray-600 p-2 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-500 break-all flex items-center text-sm">
            {loading ? (
              <div className="flex items-center justify-center w-full">
                <FiLoader
                  className="animate-spin text-gray-500 dark:text-gray-400"
                  size={18}
                />
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {t("password_being_decrypted")}
                </span>
              </div>
            ) : showPassword ? (
              entry.password || "••••••••••"
            ) : (
              "••••••••••"
            )}
          </div>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="bg-gray-200 dark:bg-gray-700 p-2 border border-r-0 border-gray-300 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
            title={showPassword ? t("hide_password") : t("show_password")}
            disabled={loading || !entry.password}
          >
            {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
          <button
            onClick={() => entry.password && copyToClipboard(entry.password)}
            className="bg-gray-200 dark:bg-gray-700 p-2 rounded-r-lg border border-gray-300 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
            title={t("copy")}
            disabled={loading || !entry.password}
          >
            <FiCopy size={15} />
          </button>
        </div>
      </div>

      {!loading && entry.password && (
        <>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">
                {t("password_strength")}
              </span>
              <span
                className={`text-sm font-medium text-${strengthLabel.color}`}
              >
                {strengthLabel.text}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div
                className={`h-2 rounded-full bg-${strengthLabel.color}`}
                style={{ width: `${passwordStrength}%` }}
              ></div>
            </div>
          </div>

          {passwordStrength < 40 && (
            <div className="mb-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-2 rounded-lg flex items-center">
              <FiAlertTriangle className="mr-2 flex-shrink-0" size={14} />
              <div className="text-sm">
                <span className="font-medium">{t("password_too_weak")}</span>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium flex items-center">
            <FiShield
              className="mr-2 text-gray-500 dark:text-gray-400"
              size={18}
            />
            {t("two_factor_auth")}
          </h3>

          {entry.totp_enabled ? (
            <Button
              variant="danger"
              onClick={handleDisableTOTP}
              className="text-xs py-1 px-2"
            >
              {t("disable")}
            </Button>
          ) : (
            <Button
              onClick={() => setIsTOTPSetupModalOpen(true)}
              className="text-xs py-1 px-2"
            >
              {t("setup")}
            </Button>
          )}
        </div>

        {entry.totp_enabled && (
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{t("current_code")}:</span>
              {isLoadingTOTP ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  <span className="text-sm">{t("loading")}</span>
                </div>
              ) : totpCode ? (
                <div className="flex items-center">
                  <span className="text-xl font-mono tracking-wider">
                    {totpCode}
                  </span>
                  <button
                    onClick={copyTOTPCode}
                    className="ml-2 p-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                    title={t("copy")}
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t("error_loading")}
                </span>
              )}
            </div>

            {totpCode && (
              <>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(remainingTime / 30) * 100}%`,
                      transition: "width 0.1s linear",
                    }}
                  ></div>
                </div>
                <div className="text-right text-xs mt-1 text-gray-500 dark:text-gray-400">
                  {t("refreshes_in")} {remainingTime} {t("seconds")}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-3">
        <Button
          variant="secondary"
          onClick={onEdit}
          className="flex items-center justify-center px-4 py-1.5 text-sm"
        >
          <FiEdit2 className="mr-1" size={14} />
          {t("edit")}
        </Button>
        <Button
          variant="danger"
          onClick={onDelete}
          className="flex items-center justify-center px-4 py-1.5 text-sm"
        >
          <FiTrash2 className="mr-1" size={14} />
          {t("delete")}
        </Button>
      </div>

      <TOTPSetupModal
        isOpen={isTOTPSetupModalOpen}
        onClose={() => setIsTOTPSetupModalOpen(false)}
        passwordId={entry.id}
        onSetupComplete={() => {
          if (onUpdateEntry) {
            onUpdateEntry({
              ...entry,
              totp_enabled: true,
            });
          }
        }}
      />

      <Modal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareEmail("");
          setShareError("");
          setShareSuccess(false);
        }}
        title={t("share_password")}
      >
        <div className="space-y-4">
          {shareSuccess ? (
            <div className="text-center py-4">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg">
                <p className="font-medium">{t("share_success")}</p>
                <p className="text-sm mt-1">{t("share_success_description")}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t("sharing_password")}:
                </p>
                <p className="font-medium">{entry.label}</p>
              </div>

              {shareError && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
                  <p className="text-sm">{shareError}</p>
                </div>
              )}

              <TextField
                label={t("recipient_email")}
                type="email"
                placeholder="user@example.com"
                value={shareEmail}
                onChange={setShareEmail}
              />

              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t("share_info")}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsShareModalOpen(false);
                    setShareEmail("");
                    setShareError("");
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={!shareEmail || isSharing}
                >
                  {isSharing ? t("sharing_password") : t("share_send_password")}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </Card>
  );
}
