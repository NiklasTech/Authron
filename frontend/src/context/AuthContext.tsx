import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import * as UserService from "../services/UserService";

const API_URL = "http://localhost:8000/api/v1";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_admin?: boolean;
  is_active?: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  register: (
    name: string,
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  resetInactivityTimer: () => void;
  timeUntilLogout: number;
  twoFactorEnabled: boolean;
  setupTwoFactor: () => Promise<{ qrCode: string; secret: string }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  disableTwoFactor: (password: string) => Promise<boolean>;
  requires2FA: boolean;
  verify2FALogin: (code: string) => Promise<void>;
  getSavedLoginCredentials: () => { email: string; password: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoLogoutTime, setAutoLogoutTime] = useState<number>(30);
  const [timeUntilLogout, setTimeUntilLogout] = useState<number>(30 * 60);
  const logoutTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [requires2FA, setRequires2FA] = useState<boolean>(false);
  const [tempLoginCredentials, setTempLoginCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const saveLoginCredentials = (email: string, password: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("saved_login_email", email);
      localStorage.setItem("saved_login_password", btoa(password));
    }
  };

  const getSavedLoginCredentials = (): { email: string; password: string } => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("saved_login_email") || "";
      const password = localStorage.getItem("saved_login_password") || "";
      return {
        email,
        password: password ? atob(password) : "",
      };
    }
    return { email: "", password: "" };
  };

  const clearSavedLoginCredentials = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("saved_login_email");
      localStorage.removeItem("saved_login_password");
    }
  };

  const resetInactivityTimer = () => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (user && autoLogoutTime > 0) {
      setTimeUntilLogout(autoLogoutTime * 60);

      countdownIntervalRef.current = window.setInterval(() => {
        setTimeUntilLogout((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              window.clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      logoutTimerRef.current = window.setTimeout(() => {
        logout();
      }, autoLogoutTime * 60 * 1000);
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const setupTwoFactor = async (): Promise<{
    qrCode: string;
    secret: string;
  }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/2fa/setup`);
      return {
        qrCode: response.data.qr_code,
        secret: response.data.secret,
      };
    } catch (error) {
      console.error("Fehler beim Einrichten von 2FA:", error);
      throw error;
    }
  };

  const verifyTwoFactor = async (code: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/2fa/verify`, {
        otp_code: code,
      });
      if (response.data.success) {
        setTwoFactorEnabled(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Fehler bei der 2FA-Verifizierung:", error);
      return false;
    }
  };

  const disableTwoFactor = async (password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/2fa/disable`, {
        password,
      });
      if (response.data.success) {
        setTwoFactorEnabled(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Fehler beim Deaktivieren von 2FA:", error);
      return false;
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);
    console.log("Login versucht für:", email);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      console.log("Login-Antwort:", response.data);

      if (response.data.success === false) {
        setError(response.data.detail || "Login fehlgeschlagen");
        setIsLoading(false);
        return;
      }

      if (response.data.requires_2fa) {
        console.log("2FA erforderlich, zeige 2FA-Dialog an");
        setRequires2FA(true);
        setTempLoginCredentials({ email, password });
        localStorage.setItem("remember_me", rememberMe.toString());
        setIsLoading(false);
        return;
      }

      const { access_token } = response.data;

      if (rememberMe) {
        localStorage.setItem("token", access_token);
        sessionStorage.removeItem("token");
        saveLoginCredentials(email, password);
      } else {
        sessionStorage.setItem("token", access_token);
        localStorage.removeItem("token");
        clearSavedLoginCredentials();
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      const userResponse = await axios.get(`${API_URL}/auth/me`);
      setUser(userResponse.data);
      setTwoFactorEnabled(userResponse.data.otp_enabled || false);
      setRequires2FA(false);
      setTempLoginCredentials(null);
    } catch (error: unknown) {
      console.error("Login failed:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("Ungültige Anmeldeinformationen");
        } else if (error.response?.data?.detail) {
          setError(error.response.data.detail);
        } else {
          setError("Ein unerwarteter Fehler ist aufgetreten");
        }
      } else {
        setError("Ein unerwarteter Fehler ist aufgetreten");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FALogin = async (code: string): Promise<void> => {
    if (!tempLoginCredentials) {
      throw new Error("Keine temporären Anmeldedaten vorhanden");
    }

    setIsLoading(true);
    setError(null);

    try {
      const { email, password } = tempLoginCredentials;
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        otp_code: code,
      });

      const { access_token } = response.data;

      const rememberMe = localStorage.getItem("remember_me") === "true";
      if (rememberMe) {
        localStorage.setItem("token", access_token);
        sessionStorage.removeItem("token");
        saveLoginCredentials(email, password);
      } else {
        sessionStorage.setItem("token", access_token);
        localStorage.removeItem("token");
        clearSavedLoginCredentials();
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      const userResponse = await axios.get(`${API_URL}/auth/me`);
      setUser(userResponse.data);
      setTwoFactorEnabled(true);
      setRequires2FA(false);
      setTempLoginCredentials(null);
    } catch (error: unknown) {
      console.error("2FA Verification failed:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("Ungültiger 2FA-Code. Bitte versuche es erneut.");
        } else if (error.response?.data?.detail) {
          setError(error.response.data.detail);
        } else {
          setError("Fehler bei der 2FA-Verifizierung.");
        }
      } else {
        setError("Ein unerwarteter Fehler ist aufgetreten.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      if (user) {
        try {
          const settings = await UserService.getUserSettings();
          if (settings.auto_logout_time !== undefined) {
            setAutoLogoutTime(settings.auto_logout_time);
          }
        } catch (error) {
          console.error("Error loading user settings:", error);
        }
      }
    };

    loadUserSettings();
  }, [user]);

  useEffect(() => {
    resetInactivityTimer();
  }, [autoLogoutTime, user]);

  useEffect(() => {
    if (user) {
      const activityEvents = [
        "mousedown",
        "mousemove",
        "keydown",
        "scroll",
        "touchstart",
      ];

      const handleUserActivity = () => {
        resetInactivityTimer();
      };

      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity);
      });

      resetInactivityTimer();

      return () => {
        activityEvents.forEach((event) => {
          window.removeEventListener(event, handleUserActivity);
        });
        if (logoutTimerRef.current) {
          window.clearTimeout(logoutTimerRef.current);
        }
        if (countdownIntervalRef.current) {
          window.clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [user, autoLogoutTime]);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/auth/me`);
        setUser(response.data);
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (
    name: string,
    email: string,
    username: string,
    password: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        username,
        full_name: name,
        password,
      });

      await login(email, password, false);
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Registration failed. Please try again.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email });
    } catch (error: unknown) {
      console.error("Password reset failed:", error);
      setError(
        (axios.isAxiosError(error) && error.response?.data?.detail) ||
          "Password reset failed. Please try again."
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    resetPassword,
    clearError,
    resetInactivityTimer,
    timeUntilLogout,
    twoFactorEnabled,
    setupTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    requires2FA,
    verify2FALogin,
    getSavedLoginCredentials,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
