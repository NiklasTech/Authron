import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  password_count?: number;
}

export interface UserSettings {
  id?: number;
  user_id?: number;
  language: string;
  auto_logout_time: number;
  dark_mode: boolean;
  show_notifications: boolean;
  password_timeout: number;
  enable_two_factor: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  count: number;
  active: number;
  admins: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface PasswordStats {
  count: number;
  categories_count: number;
  top_categories: CategoryCount[];
  avg_per_user: number;
}

export interface NewUser {
  username: string;
  email: string;
  full_name: string;
  password: string;
  is_admin?: boolean;
}

export interface PasswordChange {
  old_password: string;
  new_password: string;
}

export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const response = await axios.get(`${API_URL}/users/settings`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Laden der Benutzereinstellungen:", error);
    throw error;
  }
};

export const saveUserSettings = async (
  settings: Partial<UserSettings>
): Promise<UserSettings> => {
  try {
    const response = await axios.put(`${API_URL}/users/settings`, settings);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Speichern der Benutzereinstellungen:", error);
    throw error;
  }
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/auth/change-password`, {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Fehler beim Ändern des Passworts:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.detail || "Passwort konnte nicht geändert werden"
      );
    }
    throw new Error("Ein unbekannter Fehler ist aufgetreten");
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${API_URL}/admin/users`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Laden der Benutzer:", error);
    throw error;
  }
};

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await axios.get(`${API_URL}/admin/stats/users`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Laden der Benutzerstatistiken:", error);
    throw error;
  }
};

export const getPasswordStats = async (): Promise<PasswordStats> => {
  try {
    const response = await axios.get(`${API_URL}/admin/stats/passwords`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Laden der Passwortstatistiken:", error);
    throw error;
  }
};

export const toggleUserActive = async (
  userId: number
): Promise<{ id: number; is_active: boolean }> => {
  try {
    const response = await axios.patch(
      `${API_URL}/admin/users/${userId}/toggle-active`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Fehler beim Umschalten des Aktivitätsstatus für Benutzer ${userId}:`,
      error
    );
    throw error;
  }
};

export const toggleUserAdmin = async (
  userId: number
): Promise<{ id: number; is_admin: boolean }> => {
  try {
    const response = await axios.patch(
      `${API_URL}/admin/users/${userId}/toggle-admin`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Fehler beim Umschalten des Admin-Status für Benutzer ${userId}:`,
      error
    );
    throw error;
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/admin/users/${userId}`);
  } catch (error) {
    console.error(`Fehler beim Löschen des Benutzers ${userId}:`, error);
    throw error;
  }
};

export const createUser = async (userData: NewUser): Promise<User> => {
  try {
    const response = await axios.post(`${API_URL}/admin/users`, userData);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Erstellen des Benutzers:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.detail || "Benutzer konnte nicht erstellt werden"
      );
    }
    throw new Error("Ein unbekannter Fehler ist aufgetreten");
  }
};
