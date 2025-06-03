import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export interface Backup {
  filename: string;
  created_at: string;
  size_mb: number;
}

export interface BackupSchedule {
  enabled: boolean;
  interval: number | null;
}

export const createBackup = async (): Promise<{
  message: string;
  timestamp: string;
  filename: string;
}> => {
  try {
    const response = await axios.post(`${API_URL}/backup/create`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Erstellen des Backups:", error);
    throw error;
  }
};

export const listBackups = async (): Promise<Backup[]> => {
  try {
    const response = await axios.get(`${API_URL}/backup/list`);
    return response.data.backups;
  } catch (error) {
    console.error("Fehler beim Abrufen der Backups:", error);
    throw error;
  }
};

export const deleteBackup = async (
  filename: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/backup/${filename}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Löschen des Backups '${filename}':`, error);
    throw error;
  }
};

export const scheduleBackup = async (
  interval: number,
  enabled: boolean
): Promise<{ message: string; enabled: boolean; interval: number }> => {
  try {
    const response = await axios.post(`${API_URL}/backup/schedule`, {
      interval,
      enabled,
    });
    return response.data;
  } catch (error) {
    console.error("Fehler beim Einrichten des Backup-Zeitplans:", error);
    throw error;
  }
};

export const getBackupSchedule = async (): Promise<BackupSchedule> => {
  try {
    const response = await axios.get(`${API_URL}/backup/schedule`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Abrufen des Backup-Zeitplans:", error);
    throw error;
  }
};
