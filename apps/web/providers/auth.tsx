"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

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
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("df_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    // Token is stored as an httpOnly cookie by the server — don't keep it in localStorage
    localStorage.setItem("df_user", JSON.stringify(newUser));
    setToken(newToken); // Keep in memory only (for components that read it)
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
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
