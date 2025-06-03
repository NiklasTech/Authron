import { useState, useEffect } from "react";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Buttons";
import { Card } from "../../components/Card";
import { Link, useNavigate } from "react-router-dom";
import { FiLock, FiShield } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { CustomCheckbox } from "../../components/CustomCheckbox";
import { useNLSContext } from "../../context/NLSContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { t } = useNLSContext();
  const {
    login,
    isLoading,
    error,
    isAuthenticated,
    clearError,
    requires2FA,
    verify2FALogin,
    getSavedLoginCredentials,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedCredentials = getSavedLoginCredentials();
    if (savedCredentials.email && savedCredentials.password) {
      setEmail(savedCredentials.email);
      setPassword(savedCredentials.password);
      setRememberMe(true);
    }
  }, [getSavedLoginCredentials]);

  useEffect(() => {
    console.log("requires2FA Status:", requires2FA);

    if (isAuthenticated && !requires2FA) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, requires2FA, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password, rememberMe);
    } catch {
      // Handle login error if needed
      // The error will be displayed in the UI via the `error` state
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await verify2FALogin(twoFactorCode);
    } catch {
      // Handle login error if needed
      // The error will be displayed in the UI via the `error` state
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (requires2FA) {
        handleVerify2FA(e as unknown as React.FormEvent);
      } else {
        handleLogin(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 mb-4">
            {t("app_name")}
          </h1>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {requires2FA ? t("two_factor_auth") : t("sign_in")}
          </h2>
        </div>

        <Card>
          {requires2FA ? (
            <form onSubmit={handleVerify2FA} className="space-y-6">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <div className="text-center mb-4">
                <FiShield className="mx-auto mb-2 text-blue-500" size={24} />
                <p className="text-gray-700 dark:text-gray-300">
                  {t("twofa_prompt")}
                </p>
              </div>

              <div className="flex justify-center">
                <input
                  type="text"
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-center text-2xl tracking-wide w-40 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  value={twoFactorCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 6) {
                      setTwoFactorCode(value);
                    }
                  }}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || twoFactorCode.length !== 6}
                className="w-full flex justify-center"
              >
                {isLoading ? (
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
                    {t("verifying")}
                  </span>
                ) : (
                  t("verify")
                )}
              </Button>

              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    setTwoFactorCode("");
                    clearError();
                    navigate("/login");
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {t("back_to_sign_in")}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <TextField
                label={t("email")}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={setEmail}
                onKeyDown={handleKeyDown}
              />

              <TextField
                label={t("password")}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                onKeyDown={handleKeyDown}
              />

              <div className="flex items-center justify-between">
                <CustomCheckbox
                  id="remember-me"
                  checked={rememberMe}
                  onChange={setRememberMe}
                  label={t("remember_me")}
                />

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {t("forgot_password")}
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full flex justify-center"
              >
                {isLoading ? (
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
                    {t("signing_in")}
                  </span>
                ) : (
                  t("sign_in")
                )}
              </Button>
            </form>
          )}
        </Card>

        {!requires2FA && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("no_account")}{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t("create_account")}
              </Link>
            </p>
          </div>
        )}

        <div className="flex items-center justify-center mt-6">
          <span className="bg-blue-500 p-2 rounded-full text-white">
            <FiLock size={20} />
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {t("encryption_active")}
          </span>
        </div>
      </div>
    </div>
  );
}
