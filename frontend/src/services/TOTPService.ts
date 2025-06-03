import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export interface TOTPCodeResponse {
  code: string;
  remaining_seconds: number;
  interval: number;
}

export interface TOTPSecretResponse {
  secret: string;
}

/**
 * Speichert einen TOTP-Secret für einen Passwort-Eintrag
 * @param passwordId Die ID des Passwort-Eintrags
 * @param totpSecret Der zu speichernde TOTP-Secret (z.B. aus Google Authenticator)
 */
export const setupTOTP = async (
  passwordId: number,
  totpSecret: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/totp/${passwordId}/setup`, {
      totp_secret: totpSecret,
    });
    return response.data;
  } catch (error) {
    console.error("Fehler beim Speichern des TOTP-Secrets:", error);
    throw error;
  }
};

/**
 * Ruft den aktuellen TOTP-Code für einen Passwort-Eintrag ab
 * @param passwordId Die ID des Passwort-Eintrags
 */
export const getTOTPCode = async (
  passwordId: number
): Promise<TOTPCodeResponse> => {
  try {
    const response = await axios.get(`${API_URL}/totp/${passwordId}/code`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Abrufen des TOTP-Codes:", error);
    throw error;
  }
};

/**
 * Ruft den gespeicherten TOTP-Secret für einen Passwort-Eintrag ab
 * @param passwordId Die ID des Passwort-Eintrags
 */
export const getTOTPSecret = async (
  passwordId: number
): Promise<TOTPSecretResponse> => {
  try {
    const response = await axios.get(`${API_URL}/totp/${passwordId}/secret`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Abrufen des TOTP-Secrets:", error);
    throw error;
  }
};

/**
 * Deaktiviert TOTP für einen Passwort-Eintrag
 * @param passwordId Die ID des Passwort-Eintrags
 */
export const disableTOTP = async (
  passwordId: number
): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(
      `${API_URL}/totp/${passwordId}/disable`
    );
    return response.data;
  } catch (error) {
    console.error("Fehler beim Deaktivieren von TOTP:", error);
    throw error;
  }
};
