import { createContext, useContext, useState, type ReactNode } from "react";
import type { Utilisateur } from "../api/types";

interface AuthState {
  utilisateur: Utilisateur | null;
  token: string | null;
  login: (token: string, utilisateur: Utilisateur) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(() => {
    const stored = localStorage.getItem("utilisateur");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newToken: string, user: Utilisateur) => {
    setToken(newToken);
    setUtilisateur(user);
    localStorage.setItem("token", newToken);
    localStorage.setItem("utilisateur", JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUtilisateur(null);
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
  };

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
