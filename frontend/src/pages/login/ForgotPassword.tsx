import { useState, useEffect } from "react";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Buttons";
import { Card } from "../../components/Card";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useNLSContext } from "../../context/NLSContext";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const { t } = useNLSContext();
  const { resetPassword, isLoading, error, clearError } = useAuth();
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!email) {
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch {
      // Error is handled in the auth context
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
            {t("reset_password")}
          </h2>
        </div>

        <Card>
          {success ? (
            <div className="text-center py-4">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6">
                <FiMail className="mx-auto mb-2" size={24} />
                <p>{t("reset_instructions_sent")}</p>
                <p className="text-sm mt-1">{t("check_email")}</p>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {t("didnt_receive_email")}
              </p>
              <Button onClick={() => setSuccess(false)}>
                {t("try_again")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
              />

              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
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
                    {t("loading")}
                  </span>
                ) : (
                  t("send_reset_instructions")
                )}
              </Button>
            </form>
          )}
        </Card>

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <FiArrowLeft className="mr-1" size={16} />
            {t("back_to_sign_in")}
          </Link>
        </div>

        <div className="flex items-center justify-center mt-6">
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <p>
              {t("contact_support")}{" "}
              <a
                href="mailto:support@passwordmanager.com"
                className="text-blue-600 dark:text-blue-400"
              >
                support@passwordmanager.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
