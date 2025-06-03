import { useState, useEffect } from "react";
import {
  FiSave,
  FiSettings,
  FiLock,
  FiShield,
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiDatabase,
} from "react-icons/fi";
import { Button } from "../components/Buttons";
import { Toggle } from "../components/Switch";
import { Modal } from "../components/Modal";
import * as UserService from "../services/UserService";
import { useAuth } from "../context/AuthContext";
import { useNLSContext } from "../context/NLSContext";
import { LanguageSelector } from "../components/LanguageSelector";
import { TwoFactorSetup } from "../components/TwoFactorSetup";
import {
  calculatePasswordStrength,
  getStrengthLabel,
} from "../services/PasswordServices";
import { useDarkMode } from "../hooks/useDarkMode";
import { FiDownload, FiUpload } from "react-icons/fi";
import { ExportImportModal } from "../components/ExporImportModal";
export function SettingsPage() {
  const {
    resetInactivityTimer,
    timeUntilLogout,
    twoFactorEnabled,
    disableTwoFactor,
  } = useAuth();
  const [language, setLanguage] = useState("de");
  const [autoLogoutTime, setAutoLogoutTime] = useState(30);
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const [showNotifications, setShowNotifications] = useState(true);
  const [passwordTimeout, setPasswordTimeout] = useState(10);
  const [isMasterPasswordModalOpen, setIsMasterPasswordModalOpen] =
    useState(false);
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showDisableTwoFactorDialog, setShowDisableTwoFactorDialog] =
    useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [disableTwoFactorError, setDisableTwoFactorError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeSuccess, setChangeSuccess] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const { t, changeLanguage } = useNLSContext();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await UserService.getUserSettings();

        if (settings.auto_logout_time !== undefined)
          setAutoLogoutTime(settings.auto_logout_time);
        if (settings.dark_mode !== undefined) setIsDarkMode(settings.dark_mode);
        if (settings.show_notifications !== undefined)
          setShowNotifications(settings.show_notifications);
        if (settings.password_timeout)
          setPasswordTimeout(settings.password_timeout);
        if (settings.enable_two_factor !== undefined)
          setEnableTwoFactor(settings.enable_two_factor);

        if (settings.language) {
          setLanguage(settings.language);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Einstellungen:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [setIsDarkMode]);

  useEffect(() => {
    setEnableTwoFactor(twoFactorEnabled);
  }, [twoFactorEnabled]);

  const autoLogoutPresets = [
    { label: "5 Minuten", value: 5 },
    { label: "15 Minuten", value: 15 },
    { label: "30 Minuten", value: 30 },
    { label: "1 Stunde", value: 60 },
    { label: "2 Stunden", value: 120 },
    { label: "4 Stunden", value: 240 },
    { label: t("never"), value: 0 },
  ];

  useEffect(() => {
    setPasswordRequirements({
      length: newPassword.length >= 12,
      lowercase: /[a-z]/.test(newPassword),
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^a-zA-Z0-9]/.test(newPassword),
    });

    setPasswordStrength(calculatePasswordStrength(newPassword));
  }, [newPassword]);

  const handleChangeMasterPassword = async () => {
    setChangeError("");
    setIsChangingPassword(true);

    if (newPassword !== confirmPassword) {
      setChangeError(t("password_no_match"));
      setIsChangingPassword(false);
      return;
    }

    const allRequirementsMet = Object.values(passwordRequirements).every(
      (req) => req
    );
    if (!allRequirementsMet) {
      setChangeError(t("password_requirements"));
      setIsChangingPassword(false);
      return;
    }

    if (passwordStrength < 50) {
      setChangeError(t("password_too_weak"));
      setIsChangingPassword(false);
      return;
    }

    try {
      await UserService.changePassword(oldPassword, newPassword);
      setChangeSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setIsMasterPasswordModalOpen(false);
        setChangeSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Fehler beim Ändern des Passworts:", error);
      if (error instanceof Error) {
        setChangeError(error.message);
      } else {
        setChangeError(t("unexpected_error"));
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const saveSettings = async () => {
    setSaveSuccess(false);
    setSaveError("");

    try {
      await UserService.saveUserSettings({
        language,
        auto_logout_time: autoLogoutTime,
        dark_mode: isDarkMode,
        show_notifications: showNotifications,
        password_timeout: passwordTimeout,
        enable_two_factor: enableTwoFactor,
      });
      resetInactivityTimer();
      changeLanguage(language);
      resetInactivityTimer();
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError(t("unexpected_error"));
      }
    }
  };

  const handleAutoLogoutChange = (value: number) => {
    setAutoLogoutTime(value);
  };

  const handleDisableTwoFactor = async () => {
    setDisableTwoFactorError("");
    try {
      const success = await disableTwoFactor(disablePassword);
      if (success) {
        setEnableTwoFactor(false);
        setShowDisableTwoFactorDialog(false);
        setDisablePassword("");
      } else {
        setDisableTwoFactorError(t("twofa_disable_error"));
      }
    } catch (error) {
      console.error("Fehler beim Deaktivieren von 2FA:", error);
      setDisableTwoFactorError(t("twofa_disable_error"));
    }
  };

  return (
    <div className="h-screen pt-16 pb-24 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex items-center mb-6">
          <FiSettings
            className="mr-2 text-gray-800 dark:text-white"
            size={24}
          />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t("settings")}
          </h1>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {t("loading_data")}
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-6">
            {saveSuccess && (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center">
                <FiCheck className="mr-2 flex-shrink-0" size={18} />
                <span>{t("settings_saved")}</span>
              </div>
            )}

            {saveError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center">
                <FiAlertCircle className="mr-2 flex-shrink-0" size={18} />
                <span>{saveError}</span>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {t("general_settings")}
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("language")}
                  </span>
                  <LanguageSelector
                    value={language}
                    setLanguage={setLanguage}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("show_notifications")}
                  </span>
                  <Toggle
                    checked={showNotifications}
                    onChange={setShowNotifications}
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                    <div className="flex items-center">
                      <FiClock
                        className="mr-2 text-gray-500 dark:text-gray-400"
                        size={20}
                      />
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                        {t("auto_logout")}
                      </h3>
                    </div>

                    <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium">
                      {timeUntilLogout === 0
                        ? t("deactivated")
                        : t("logout_in", {
                            minutes: Math.floor(timeUntilLogout / 60),
                            seconds: timeUntilLogout % 60,
                          })}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t("auto_logout_inactive")}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {autoLogoutPresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handleAutoLogoutChange(preset.value)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors
                          ${
                            autoLogoutTime === preset.value
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                      <span>{t("custom_minutes")}</span>
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        value={autoLogoutTime}
                        onChange={(e) =>
                          setAutoLogoutTime(parseInt(e.target.value) || 0)
                        }
                        className="sm:ml-2 w-full sm:w-20 md:w-24 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded px-2 py-1"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {autoLogoutTime === 0
                        ? t("never_logout")
                        : t("logout_timer", { minutes: autoLogoutTime })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("password_auto_hide")}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={passwordTimeout}
                    onChange={(e) =>
                      setPasswordTimeout(parseInt(e.target.value))
                    }
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white w-full sm:w-16 md:w-20 px-2 py-1 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {t("security_settings")}
              </h2>

              <div className="mb-6 flex justify-end">
                <Button
                  onClick={() => setIsMasterPasswordModalOpen(true)}
                  className="flex items-center"
                >
                  <FiLock className="mr-2" size={16} />
                  {t("change_master_password")}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <FiShield className="mr-2" size={18} />
                    {t("data_security")}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                      <div className="rounded-full bg-green-900/20 p-1 mr-2 mt-0.5">
                        <svg
                          className="h-3 w-3 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      {t("encryption_active")}
                    </li>
                    <li className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full gap-2">
                        <div className="flex items-center">
                          <div className="rounded-full bg-green-900/20 p-1 mr-2">
                            <svg
                              className="h-3 w-3 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          {t("two_factor_auth")}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Toggle
                            checked={enableTwoFactor}
                            onChange={() => {
                              if (!enableTwoFactor) {
                                setShowTwoFactorSetup(true);
                              } else {
                                setShowDisableTwoFactorDialog(true);
                              }
                            }}
                          />
                          {enableTwoFactor && (
                            <Button
                              variant="secondary"
                              className="text-xs py-1 px-2"
                              onClick={() =>
                                setShowDisableTwoFactorDialog(true)
                              }
                            >
                              {t("disable")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-yellow-800 dark:text-yellow-300 mb-2 flex items-center">
                    <FiAlertCircle className="mr-2" size={18} />
                    {t("security_notice")}
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    {t("last_login", {
                      date: new Date().toLocaleDateString("de-DE"),
                      time: new Date().toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {t("data_management")}
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <FiDatabase className="mr-2" size={18} />
                    {t("import_export_title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {t("import_export_description")}
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setIsExportImportModalOpen(true)}
                      className="flex items-center"
                      variant="secondary"
                    >
                      <FiDownload className="mr-2" size={16} />
                      {t("export_passwords")}
                    </Button>
                    <Button
                      onClick={() => setIsExportImportModalOpen(true)}
                      className="flex items-center"
                      variant="secondary"
                    >
                      <FiUpload className="mr-2" size={16} />
                      {t("import_passwords")}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                    <FiAlertCircle className="mr-2" size={18} />
                    {t("backup_info")}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    {t("backup_description")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={saveSettings}
                className="flex items-center"
                disabled={saveSuccess}
              >
                <FiSave className="mr-2" size={16} />
                {saveSuccess ? t("saved") : t("save_settings")}
              </Button>
            </div>
          </div>
        )}
      </div>
      <Modal
        isOpen={isMasterPasswordModalOpen}
        onClose={() => {
          setIsMasterPasswordModalOpen(false);
          setChangeSuccess(false);
          setChangeError("");
        }}
        title={t("change_master_password")}
      >
        {changeSuccess ? (
          <div className="text-center py-4">
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6">
              <svg
                className="mx-auto mb-2"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p>{t("password_changed")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {changeError && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
                {changeError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("current_password")}
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("new_password")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("confirm_password")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                <p className="font-medium mb-2">
                  {t("password_requirements_title")}
                </p>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                        passwordRequirements.length
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {passwordRequirements.length ? "✓" : "✗"}
                    </span>
                    {t("req_min_length")}
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                        passwordRequirements.lowercase
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {passwordRequirements.lowercase ? "✓" : "✗"}
                    </span>
                    {t("req_lowercase")}
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                        passwordRequirements.uppercase
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {passwordRequirements.uppercase ? "✓" : "✗"}
                    </span>
                    {t("req_uppercase")}
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                        passwordRequirements.number
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {passwordRequirements.number ? "✓" : "✗"}
                    </span>
                    {t("req_number")}
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                        passwordRequirements.special
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {passwordRequirements.special ? "✓" : "✗"}
                    </span>
                    {t("req_special")}
                  </li>
                </ul>
              </div>

              {newPassword && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("password_strength")}
                    </span>
                    <span className="text-sm font-medium">
                      {(() => {
                        const strengthLabel = getStrengthLabel(
                          passwordStrength,
                          t
                        );
                        return (
                          <span className={`text-${strengthLabel.color}`}>
                            {t(strengthLabel.text)}
                          </span>
                        );
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${(() => {
                        const strengthLabel = getStrengthLabel(
                          passwordStrength,
                          t
                        );
                        return `bg-${strengthLabel.color}`;
                      })()}`}
                      style={{
                        width: `${Math.min(100, passwordStrength)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsMasterPasswordModalOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleChangeMasterPassword}
                disabled={
                  !oldPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  isChangingPassword
                }
              >
                {isChangingPassword ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("loading")}
                  </span>
                ) : (
                  t("change_master_password")
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={showTwoFactorSetup}
        onClose={() => setShowTwoFactorSetup(false)}
      >
        <TwoFactorSetup
          onComplete={() => {
            setEnableTwoFactor(true);
            setShowTwoFactorSetup(false);
          }}
        />
      </Modal>
      <Modal
        isOpen={showDisableTwoFactorDialog}
        onClose={() => {
          setShowDisableTwoFactorDialog(false);
          setDisablePassword("");
          setDisableTwoFactorError("");
        }}
        title={t("disable_twofa")}
      >
        <div className="space-y-4">
          {disableTwoFactorError && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
              {disableTwoFactorError}
            </div>
          )}

          <p className="text-gray-700 dark:text-gray-300">
            {t("disable_twofa_confirm")}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("twofa_enter_password")}
            </label>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="secondary"
              onClick={() => setShowDisableTwoFactorDialog(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={handleDisableTwoFactor}
              disabled={!disablePassword}
            >
              {t("disable")}
            </Button>
          </div>
        </div>
      </Modal>
      <ExportImportModal
        isOpen={isExportImportModalOpen}
        onClose={() => setIsExportImportModalOpen(false)}
        onImportSuccess={() => {
          setIsExportImportModalOpen(false);
        }}
      />
    </div>
  );
}
