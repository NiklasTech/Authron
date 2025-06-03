import { useState, useEffect } from "react";
import {
  FiDatabase,
  FiDownload,
  FiTrash2,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/Buttons";
import { useNLSContext } from "../../../context/NLSContext";
import * as BackupService from "../../../services/BackupService";
import { Toggle } from "../../../components/Switch";

interface AdminBackupManagerProps {
  refreshData: () => Promise<void>;
}

export function AdminBackupManager({ refreshData }: AdminBackupManagerProps) {
  const { t } = useNLSContext();
  const [backups, setBackups] = useState<BackupService.Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isDeletingBackup, setIsDeletingBackup] = useState<string | null>(null);

  const [backupEnabled, setBackupEnabled] = useState(false);
  const [backupInterval, setBackupInterval] = useState(24);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const loadBackups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await BackupService.listBackups();
      setBackups(data);
    } catch (err) {
      console.error("Fehler beim Laden der Backups:", err);
      setError(t("error_loading_backups"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadBackupSchedule = async () => {
    setIsScheduleLoading(true);
    try {
      const schedule = await BackupService.getBackupSchedule();
      setBackupEnabled(schedule.enabled);
      if (schedule.interval) {
        setBackupInterval(schedule.interval);
      }
    } catch (err) {
      console.error("Fehler beim Laden des Backup-Zeitplans:", err);
    } finally {
      setIsScheduleLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
    loadBackupSchedule();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setError(null);
    try {
      await BackupService.createBackup();
      await loadBackups();
      refreshData();
    } catch (err) {
      console.error("Fehler beim Erstellen des Backups:", err);
      setError(t("backup_creation_error"));
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    setIsDeletingBackup(filename);
    try {
      await BackupService.deleteBackup(filename);
      await loadBackups();
      refreshData();
    } catch (err) {
      console.error(`Fehler beim Löschen des Backups '${filename}':`, err);
    } finally {
      setIsDeletingBackup(null);
    }
  };

  const handleSaveSchedule = async () => {
    setIsScheduleLoading(true);
    try {
      await BackupService.scheduleBackup(backupInterval, backupEnabled);
      setScheduleSaved(true);
      setTimeout(() => setScheduleSaved(false), 3000);
    } catch (err) {
      console.error("Fehler beim Speichern des Backup-Zeitplans:", err);
    } finally {
      setIsScheduleLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <FiDatabase className="mr-2" size={18} />
          {t("backup_management")}
        </h3>
        <Button
          onClick={handleCreateBackup}
          className="flex items-center"
          disabled={isCreatingBackup}
        >
          <FiDownload
            className={`mr-2 ${isCreatingBackup ? "animate-spin" : ""}`}
            size={16}
          />
          {isCreatingBackup ? t("creating_backup") : t("create_backup")}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 text-red-700 dark:text-red-300">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2 flex-shrink-0" size={18} />
            <div>{error}</div>
          </div>
        </div>
      )}

      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h4 className="text-md font-medium mb-3 flex items-center">
          <FiClock className="mr-2" size={16} />
          {t("automatic_backups")}
        </h4>
        <div className="flex items-center mb-4">
          <Toggle checked={backupEnabled} onChange={setBackupEnabled} />
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            {backupEnabled
              ? t("auto_backup_enabled")
              : t("auto_backup_disabled")}
          </span>
        </div>

        {backupEnabled && (
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-gray-700 dark:text-gray-300">
              {t("backup_interval")}:
            </label>
            <select
              value={backupInterval}
              onChange={(e) => setBackupInterval(parseInt(e.target.value))}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-1"
              disabled={isScheduleLoading}
            >
              <option value="1">1 {t("hour")}</option>
              <option value="6">6 {t("hours")}</option>
              <option value="12">12 {t("hours")}</option>
              <option value="24">24 {t("hours")}</option>
              <option value="48">2 {t("days")}</option>
              <option value="168">7 {t("days")}</option>
            </select>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSaveSchedule}
            disabled={isScheduleLoading}
            variant={scheduleSaved ? "secondary" : "primary"}
            className="flex items-center"
          >
            {isScheduleLoading ? (
              <span className="flex items-center">
                <FiRefreshCw className="animate-spin mr-2" size={16} />
                {t("saving")}
              </span>
            ) : scheduleSaved ? (
              t("saved")
            ) : (
              t("save_settings")
            )}
          </Button>
        </div>
      </div>

      <h4 className="text-md font-medium mb-2">{t("existing_backups")}</h4>
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t("loading")}</p>
        </div>
      ) : backups.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{t("no_backups_found")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {t("backup_name")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {t("creation_date")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {t("size")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {backups.map((backup) => (
                <tr key={backup.filename}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {backup.filename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(backup.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {backup.size_mb.toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteBackup(backup.filename)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      disabled={isDeletingBackup === backup.filename}
                    >
                      {isDeletingBackup === backup.filename ? (
                        <FiRefreshCw className="animate-spin" size={18} />
                      ) : (
                        <FiTrash2 size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
