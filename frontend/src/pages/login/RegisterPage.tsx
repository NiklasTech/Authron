import { useState, useEffect } from "react";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Buttons";
import { Card } from "../../components/Card";
import { Link, useNavigate } from "react-router-dom";
import { FiShield } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useNLSContext } from "../../context/NLSContext";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { register, isLoading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const { t, currentLanguage } = useNLSContext();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !username || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (!agreeTerms) {
      return;
    }

    try {
      await register(name, email, username, password);
    } catch {
      // Error is handled in the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 mb-4">
            {t("app_name")}
          </h1>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t("create_account")}
          </h2>
        </div>

        <Card>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <TextField
              label={t("full_name")}
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={setName}
            />

            <TextField
              label={t("email")}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={setEmail}
            />

            <TextField
              label={t("username")}
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={setUsername}
            />

            <TextField
              label={t("password")}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
            />

            <TextField
              label={t("confirm_password")}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                {currentLanguage === "de" ? (
                  <>
                    {t("terms_agree")}{" "}
                    <a
                      href="/terms"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t("terms_of_service")}
                    </a>{" "}
                    {t("and")}{" "}
                    <a
                      href="/privacy"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t("privacy_policy")}
                    </a>{" "}
                    {t("to")}
                  </>
                ) : (
                  <>
                    {t("terms_agree")}{" "}
                    <a
                      href="/terms"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t("terms_of_service")}
                    </a>{" "}
                    {t("and")}{" "}
                    <a
                      href="/privacy"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t("privacy_policy")}
                    </a>
                  </>
                )}
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !agreeTerms}
              className="w-full flex justify-center mt-6"
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
                  {t("registering")}
                </span>
              ) : (
                t("register")
              )}
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("have_account")}{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t("sign_in")}
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center">
          <span className="bg-blue-500 p-2 rounded-full text-white">
            <FiShield size={20} />
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {t("secured_with_aes")}{" "}
          </span>
        </div>
      </div>
    </div>
  );
}
