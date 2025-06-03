import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export interface SystemStatusCheck {
  name: string;
  status: "ok" | "warning" | "error";
  message?: string;
}

export interface SystemInfo {
  cpu_usage: number;
  memory_usage: number;
  uptime: string;
  last_backup: string;
}

export interface SystemStatusResponse {
  status_checks: SystemStatusCheck[];
  system_info: SystemInfo;
  timestamp: string;
}

export const getSystemStatus = async (): Promise<SystemStatusResponse> => {
  try {
    const response = await axios.get(`${API_URL}/system/status`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Laden des Systemstatus:", error);
    throw error;
  }
};
