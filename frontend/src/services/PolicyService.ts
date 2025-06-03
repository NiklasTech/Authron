import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

interface PasswordPolicy {
  id?: number;
  name: string;
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special: boolean;
  max_age_days: number;
}

export const getAllPolicies = async (): Promise<PasswordPolicy[]> => {
  try {
    const response = await axios.get(`${API_URL}/policies`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Passwort-Richtlinien:", error);
    throw error;
  }
};

export const createPolicy = async (
  policyData: PasswordPolicy
): Promise<PasswordPolicy> => {
  try {
    const response = await axios.post(`${API_URL}/policies`, policyData);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Erstellen der Passwort-Richtlinie:", error);
    throw error;
  }
};

export const updatePolicy = async (
  policyId: number,
  policyData: PasswordPolicy
): Promise<PasswordPolicy> => {
  try {
    const response = await axios.put(
      `${API_URL}/policies/${policyId}`,
      policyData
    );
    return response.data;
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Passwort-Richtlinie:", error);
    throw error;
  }
};

export const deletePolicy = async (policyId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/policies/${policyId}`);
  } catch (error) {
    console.error("Fehler beim Löschen der Passwort-Richtlinie:", error);
    throw error;
  }
};
