import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type AuthState = {
  isAuthed: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_KEY = "calendar_rn_ui_authed";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      const v = window.localStorage.getItem(STORAGE_KEY);
      setIsAuthed(v === "true");
    }
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: connect server auth here
    if (!email.trim() || !password.trim()) return false;
    setIsAuthed(true);
    if (Platform.OS === "web") window.localStorage.setItem(STORAGE_KEY, "true");
    return true;
  };

  const logout = () => {
    // TODO: connect server logout here
    setIsAuthed(false);
    if (Platform.OS === "web") window.localStorage.setItem(STORAGE_KEY, "false");
  };

  const value = useMemo(() => ({ isAuthed, login, logout }), [isAuthed]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
