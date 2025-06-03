import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export interface PendingShare {
  id: number;
  password_title: string;
  sender_email: string;
  created_at: string;
  invite_token: string;
}

export const sharePassword = async (
  passwordId: number,
  recipientEmail: string
): Promise<void> => {
  await axios.post(`${API_URL}/password-sharing/share`, {
    password_id: passwordId,
    recipient_email: recipientEmail,
  });
};

export const getPendingShares = async (): Promise<PendingShare[]> => {
  const response = await axios.get(`${API_URL}/password-sharing/pending`);
  return response.data;
};

export const acceptShare = async (inviteToken: string): Promise<void> => {
  await axios.post(`${API_URL}/password-sharing/accept/${inviteToken}`);
};

export const rejectShare = async (inviteToken: string): Promise<void> => {
  await axios.post(`${API_URL}/password-sharing/reject/${inviteToken}`);
};
