import {
  FiUsers,
  FiDatabase,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
} from "react-icons/fi";
import { Card } from "../../../components/Card";
import { useNLSContext } from "../../../context/NLSContext";

interface AdminDashboardCardsProps {
  userCount: number | null;
  passwordCount: number | null;
  systemStatus: Array<{
    name: string;
    status: "ok" | "warning" | "error";
    message?: string | null;
  }>;
  isLoading: boolean;
}

export function AdminDashboardCards({
  userCount,
  passwordCount,
  systemStatus,
  isLoading,
}: AdminDashboardCardsProps) {
  const { t } = useNLSContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="p-6">
        <div className="flex items-center mb-3">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
            <FiUsers size={20} />
          </div>
          <h2 className="ml-2 text-lg font-medium">{t("role_user")}</h2>
        </div>
        <div className="text-3xl font-bold mb-2">
          {isLoading ? "-" : userCount}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("registered_users_count")}
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center mb-3">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
            <FiDatabase size={20} />
          </div>
          <h2 className="ml-2 text-lg font-medium">{t("user_passwords")}</h2>
        </div>
        <div className="text-3xl font-bold mb-2">
          {isLoading ? "-" : passwordCount}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("stored_passwords_count")}
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center mb-3">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
            <FiActivity size={20} />
          </div>
          <h2 className="ml-2 text-lg font-medium">{t("system_monitoring")}</h2>
        </div>
        <div className="space-y-3">
          {systemStatus.map((system, index) => (
            <div
              key={index}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center">
                {system.status === "ok" ? (
                  <FiCheckCircle className="text-green-500 mr-2" size={16} />
                ) : system.status === "warning" ? (
                  <FiAlertCircle className="text-yellow-500 mr-2" size={16} />
                ) : (
                  <FiXCircle className="text-red-500 mr-2" size={16} />
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  {system.name}
                </span>
              </div>
              <div className="flex items-center">
                {system.message && (
                  <div className="relative group">
                    <button className="focus:outline-none">
                      <FiAlertCircle
                        className={
                          system.status === "warning"
                            ? "text-yellow-500 mr-2"
                            : system.status === "error"
                            ? "text-red-500 mr-2"
                            : "text-gray-500 mr-2"
                        }
                        size={14}
                      />
                    </button>
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 w-56 shadow-lg">
                        {system.message}
                      </div>
                    </div>
                  </div>
                )}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    system.status === "ok"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : system.status === "warning"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {system.status === "ok"
                    ? t("status_active")
                    : system.status === "warning"
                    ? t("status_warning")
                    : t("status_error")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
