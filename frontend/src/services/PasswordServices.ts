import axios from "axios";
import { PasswordEntry } from "../types/PasswordEntry";

const API_URL = "http://localhost:8000/api/v1";

export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;

  strength += Math.min(40, password.length * 4);

  const patterns = {
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    numbers: /[0-9]/,
    symbols: /[^a-zA-Z0-9]/,
  };

  let varietyCount = 0;
  for (const pattern of Object.values(patterns)) {
    if (pattern.test(password)) {
      varietyCount++;
      strength += 10;
    }
  }

  if (varietyCount >= 3) strength += 10;
  if (varietyCount === 4) strength += 10;

  if (/(.)(\1{2,})/.test(password)) strength -= 10;
  if (/^[a-zA-Z]+$/.test(password)) strength -= 10;
  if (/^[0-9]+$/.test(password)) strength -= 10;
  if (/^[a-z]+$/.test(password)) strength -= 15;
  if (/^[A-Z]+$/.test(password)) strength -= 15;

  const commonPatterns = [
    "password",
    "passwort",
    "123456",
    "qwerty",
    "admin",
    "welcome",
    "letmein",
  ];

  const lowerPassword = password.toLowerCase();
  for (const pattern of commonPatterns) {
    if (lowerPassword.includes(pattern)) {
      strength -= 15;
      break;
    }
  }

  if (
    /abcdef|bcdefg|cdefgh|defghi|efghij|123456|234567|345678|456789/.test(
      lowerPassword
    )
  ) {
    strength -= 15;
  }

  return Math.max(0, Math.min(100, strength));
}

export function getStrengthLabel(strength: number, t: (key: string) => string) {
  if (strength < 20) return { text: t("very_weak"), color: "red-600" };
  if (strength < 40) return { text: t("weak"), color: "orange-600" };
  if (strength < 60) return { text: t("medium"), color: "yellow-600" };
  if (strength < 80) return { text: t("strong"), color: "green-600" };
  return { text: t("very_strong"), color: "green-800" };
}

interface PasswordEntryResponse {
  totp_enabled: boolean;
  id: number;
  title: string;
  username: string;
  encrypted_password: string;
  email?: string;
  website?: string;
  category?: string;
  notes?: string;
  favorite?: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
}

const convertToPasswordEntry = (data: PasswordEntryResponse): PasswordEntry => {
  return {
    id: data.id,
    label: data.title,
    username: data.username || data.email || "",
    password: "",
    url: data.website,
    category: data.category,
    lastUpdated: new Date(data.updated_at).toLocaleDateString("de-DE"),
    favorite: data.favorite || false,
    totp_enabled: data.totp_enabled || false,
  };
};

export const getAllPasswords = async (): Promise<PasswordEntry[]> => {
  try {
    const response = await axios.get(`${API_URL}/passwords`);
    const passwords: PasswordEntryResponse[] = response.data;

    return passwords.map(convertToPasswordEntry);
  } catch (error) {
    console.error("Fehler beim Abrufen der Passwörter:", error);
    return [];
  }
};

export const getDecryptedPassword = async (id: number): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/passwords/${id}/decrypt`);
    return response.data.password;
  } catch (error) {
    console.error("Fehler beim Entschlüsseln des Passworts:", error);
    return "[Passwort kann nicht entschlüsselt werden]";
  }
};

export const createPassword = async (
  entry: Omit<PasswordEntry, "id" | "lastUpdated">
): Promise<PasswordEntry> => {
  try {
    const payload = {
      title: entry.label,
      username: entry.username,
      password: entry.password,
      email: entry.username.includes("@") ? entry.username : undefined,
      website: entry.url,
      category: entry.category || "Allgemein",
      favorite: entry.favorite || false,
      notes: "",
    };

    const response = await axios.post(`${API_URL}/passwords`, payload);
    return convertToPasswordEntry(response.data);
  } catch (error) {
    console.error("Fehler beim Erstellen des Passworteintrags:", error);
    throw error;
  }
};

export const updatePassword = async (
  id: number,
  entry: Partial<PasswordEntry>
): Promise<PasswordEntry> => {
  try {
    const payload: Partial<{
      title: string;
      username: string;
      email?: string;
      password: string;
      website?: string;
      category?: string;
      favorite?: boolean;
    }> = {};

    if (entry.label) payload.title = entry.label;
    if (entry.username) {
      payload.username = entry.username;
      if (entry.username.includes("@")) payload.email = entry.username;
    }
    if (entry.password) payload.password = entry.password;
    if (entry.url !== undefined) payload.website = entry.url;
    if (entry.category) payload.category = entry.category;
    if (entry.favorite !== undefined) payload.favorite = entry.favorite;

    const response = await axios.put(`${API_URL}/passwords/${id}`, payload);
    return convertToPasswordEntry(response.data);
  } catch (error) {
    console.error(
      `Fehler beim Aktualisieren des Passworteintrags (ID: ${id}):`,
      error
    );
    throw error;
  }
};

export const deletePassword = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/passwords/${id}`);
  } catch (error) {
    console.error(
      `Fehler beim Löschen des Passworteintrags (ID: ${id}):`,
      error
    );
    throw error;
  }
};

export const toggleFavorite = async (
  id: number,
  isFavorite: boolean
): Promise<void> => {
  try {
    await axios.patch(`${API_URL}/passwords/${id}/favorite`, {
      favorite: isFavorite,
    });
  } catch (error) {
    console.error(
      `Fehler beim Aktualisieren des Favoritenstatus (ID: ${id}):`,
      error
    );
    throw error;
  }
};

export const markAsUsed = async (id: number): Promise<void> => {
  try {
    await axios.post(`${API_URL}/passwords/${id}/used`);
  } catch (error) {
    console.error(`Fehler beim Markieren der Verwendung (ID: ${id}):`, error);
  }
};
