import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { login as apiLogin } from "@/lib/api";
import type { UserProfile } from "@/types/api";

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticating: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "exlsmartassist.session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  React.useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { user: UserProfile; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const signIn = React.useCallback(async (username: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const result = await apiLogin(username, password);
      setUser(result.user);
      setToken(result.access_token);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user: result.user, token: result.access_token }));
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const signOut = React.useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticating, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
