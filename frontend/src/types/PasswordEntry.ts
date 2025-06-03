export interface PasswordEntry {
  id: number;
  label: string;
  username: string;
  password?: string;
  url?: string;
  category?: string;
  categoryId?: string;
  favorite?: boolean;
  totp_enabled?: boolean;
  totp_secret?: string;
  lastUpdated?: string;
  lastUsed?: string;
}
