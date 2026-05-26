"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { tokenStore } from "~/lib/token-store";

interface User {
  id: string;
  fullName: string;
  email: string;
  plan: string;
  profileImageUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Token is now in an httpOnly cookie — only restore non-sensitive user display info
    const storedUser = localStorage.getItem("df_user");
    const storedToken = tokenStore.get(); // restore from sessionStorage if available
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        if (storedToken) setToken(storedToken);
      } catch {
        localStorage.removeItem("df_user");
        tokenStore.set(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    // Store token in sessionStorage via tokenStore so tRPC client can send it as Authorization header
    tokenStore.set(newToken);
    localStorage.setItem("df_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    tokenStore.set(null);
    localStorage.removeItem("df_user");
    setToken(null);
    setUser(null);
    // Clear the httpOnly cookie via the REST endpoint
    const baseUrl =
      (typeof window !== "undefined" && (process.env.NEXT_PUBLIC_API_URL?.replace("/trpc", "") ?? "http://localhost:8000")) ||
      "http://localhost:8000";
    fetch(`${baseUrl}/logout`, { method: "POST", credentials: "include" }).catch(() => {});
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("df_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
