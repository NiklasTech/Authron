import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

interface ActivityLog {
  id: number;
  user_id: number;
  username: string;
  action: string;
  resource_type: string | null;
  resource_id: number | null;
  details: string | null;
  ip_address: string | null;
  timestamp: string;
}

interface LogsResponse {
  logs: ActivityLog[];
  total_logs: number;
  total_pages: number;
  page: number;
}

interface LogFilter {
  page?: number;
  user?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
}

export const getActivityLogs = async (
  filters: LogFilter = {}
): Promise<LogsResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.user) params.append("user", filters.user);
    if (filters.action) params.append("action", filters.action);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const response = await axios.get(`${API_URL}/logs?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Aktivitätsprotokolle:", error);
    throw error;
  }
};

export const exportLogs = async (filters: LogFilter = {}): Promise<void> => {
  try {
    const params = new URLSearchParams();
    if (filters.user) params.append("user", filters.user);
    if (filters.action) params.append("action", filters.action);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const response = await axios.get(
      `${API_URL}/logs/export?${params.toString()}`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    const now = new Date();
    const filename = `activity_logs_${now.toISOString().slice(0, 10)}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Fehler beim Exportieren der Aktivitätsprotokolle:", error);
    throw error;
  }
};
