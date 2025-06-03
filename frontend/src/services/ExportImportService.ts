import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export interface ImportResult {
  message: string;
  imported: number;
  skipped: number;
}

export const exportPasswords = async (
  format: "json" | "csv"
): Promise<void> => {
  try {
    const response = await axios.get(
      `${API_URL}/export-import/export/${format}`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    const filename = `passwords_export_${new Date()
      .toISOString()
      .slice(0, 10)}.${format}`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Fehler beim Exportieren der Passwörter:", error);
    throw error;
  }
};

export const importPasswords = async (file: File): Promise<ImportResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_URL}/export-import/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Fehler beim Importieren der Passwörter:", error);
    throw error;
  }
};
