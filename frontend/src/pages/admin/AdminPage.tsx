import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import { Button } from "../../components/Buttons";
import { useAuth } from "../../context/AuthContext";
import * as UserService from "../../services/UserService";
import * as SystemService from "../../services/SystemServices";
import { useNLSContext } from "../../context/NLSContext";

import { AdminDashboardCards } from "./components/AdminDashboardCards";
import { AdminCategoryChart } from "./components/AdminCategoryChart";
import { AdminUserManagement } from "./components/AdminUserManagement";
import { AccessDenied } from "./components/AccessDenied";
import { AdminBackupManager } from "./components/AdminBackupManager";

export function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useNLSContext();

  const [userCount, setUserCount] = useState<number | null>(null);
  const [passwordCount, setPasswordCount] = useState<number | null>(null);
  const [topCategories, setTopCategories] = useState<
    UserService.CategoryCount[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserService.User[]>([]);
  const [systemStatus, setSystemStatus] = useState<
    SystemService.SystemStatusCheck[]
  >([]);
  const [, setSystemInfo] = useState<SystemService.SystemInfo | null>(null);

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userStats = await UserService.getUserStats();
        const passwordStats = await UserService.getPasswordStats();
        const usersList = await UserService.getAllUsers();
        const systemStatusData = await SystemService.getSystemStatus();
        setUserCount(userStats.count);
        setPasswordCount(passwordStats.count);
        setTopCategories(passwordStats.top_categories || []);
        setUsers(usersList);
        setSystemStatus(systemStatusData.status_checks);
        setSystemInfo(systemStatusData.system_info);
      } catch (err) {
        console.error("Fehler beim Laden der Admin-Statistiken:", err);
        setError(t("admin_stats_error"));
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.is_admin) {
      fetchAdminStats();
    }
  }, [user, navigate, t]);

  const refreshData = async () => {
    if (user?.is_admin) {
      setIsLoading(true);
      setError(null);

      try {
        const userStats = await UserService.getUserStats();
        const passwordStats = await UserService.getPasswordStats();
        const usersList = await UserService.getAllUsers();
        const systemStatusData = await SystemService.getSystemStatus();

        setUserCount(userStats.count);
        setPasswordCount(passwordStats.count);
        setTopCategories(passwordStats.top_categories || []);
        setUsers(usersList);
        setSystemStatus(systemStatusData.status_checks);
        setSystemInfo(systemStatusData.system_info);
      } catch (err) {
        console.error("Fehler beim Laden der Admin-Statistiken:", err);
        setError(t("admin_stats_error"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!user?.is_admin) {
    return <AccessDenied />;
  }

  return (
    <div className="h-screen pt-20 pb-24 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <FiShield className="mr-2" size={24} />
            {t("admin_panel")}
          </h1>
          <Button
            onClick={refreshData}
            className="flex items-center"
            disabled={isLoading}
          >
            <FiRefreshCw
              className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
              size={16}
            />
            {t("refresh")}
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-300">
            <div className="flex items-center">
              <FiAlertCircle className="mr-2 flex-shrink-0" size={18} />
              <div>{error}</div>
            </div>
          </div>
        )}

        <AdminDashboardCards
          userCount={userCount}
          passwordCount={passwordCount}
          systemStatus={systemStatus}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 gap-6 mb-6">
          <AdminCategoryChart
            topCategories={topCategories}
            isLoading={isLoading}
          />
        </div>

        <AdminUserManagement
          users={users}
          refreshData={refreshData}
          currentUser={user}
        />

        <AdminBackupManager refreshData={refreshData} />
      </div>
    </div>
  );
}
