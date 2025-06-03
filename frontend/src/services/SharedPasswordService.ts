import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export interface SharedPassword {
  id: number;
  title: string;
  username: string;
  email?: string;
  website?: string;
  category: string;
  notes?: string;
  team_id: number;
  team_name: string;
  created_by: number;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

export interface SharedPasswordWithSecret extends SharedPassword {
  password: string;
}

export interface SharedPasswordCreate {
  title: string;
  username: string;
  password: string;
  email?: string;
  website?: string;
  category: string;
  notes?: string;
  team_id: number;
}

export const getAllSharedPasswords = async (): Promise<SharedPassword[]> => {
  try {
    const response = await axios.get(`${API_URL}/shared/passwords`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Abrufen der geteilten Passwörter:", error);
    throw error;
  }
};

export const getSharedPasswordsByTeam = async (
  teamId: number
): Promise<SharedPassword[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/shared/passwords?team_id=${teamId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Fehler beim Abrufen der geteilten Passwörter für Team ${teamId}:`,
      error
    );
    throw error;
  }
};

export const getSharedPassword = async (
  passwordId: number
): Promise<SharedPassword> => {
  try {
    const response = await axios.get(
      `${API_URL}/shared/passwords/${passwordId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Fehler beim Abrufen des geteilten Passworts mit ID ${passwordId}:`,
      error
    );
    throw error;
  }
};

export const getSharedPasswordWithSecret = async (
  passwordId: number
): Promise<SharedPasswordWithSecret> => {
  try {
    const response = await axios.get(
      `${API_URL}/shared/passwords/${passwordId}/decrypt`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Fehler beim Abrufen des entschlüsselten geteilten Passworts mit ID ${passwordId}:`,
      error
    );
    throw error;
  }
};

export const createSharedPassword = async (
  passwordData: SharedPasswordCreate
): Promise<SharedPassword> => {
  try {
    const response = await axios.post(
      `${API_URL}/shared/passwords`,
      passwordData
    );
    return response.data;
  } catch (error) {
    console.error("Fehler beim Erstellen des geteilten Passworts:", error);
    throw error;
  }
};

export const updateSharedPassword = async (
  passwordId: number,
  passwordData: Partial<SharedPasswordCreate>
): Promise<SharedPassword> => {
  try {
    const response = await axios.put(
      `${API_URL}/shared/passwords/${passwordId}`,
      passwordData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Fehler beim Aktualisieren des geteilten Passworts mit ID ${passwordId}:`,
      error
    );
    throw error;
  }
};

export const deleteSharedPassword = async (
  passwordId: number
): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/shared/passwords/${passwordId}`);
  } catch (error) {
    console.error(
      `Fehler beim Löschen des geteilten Passworts mit ID ${passwordId}:`,
      error
    );
    throw error;
  }
};

export const markSharedPasswordAsUsed = async (
  passwordId: number
): Promise<void> => {
  try {
    await axios.post(`${API_URL}/shared/passwords/${passwordId}/used`);
  } catch (error) {
    console.error(
      `Fehler beim Markieren des geteilten Passworts mit ID ${passwordId} als verwendet:`,
      error
    );
    throw error;
  }
};
