import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  permissions: string[];
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isPostLoginLoading: boolean;
  login: (data: { token: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  useCan: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostLoginLoading, setIsPostLoginLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem("token");

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(savedToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

        const { data } = await api.get("/auth/me");

        setUser(data);
      } catch (error: any) {
        console.error("Error al obtener /auth/me:", error);

        if (error.response?.status === 401 || error.response?.status === 422) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (data: { token: string }) => {
    setIsPostLoginLoading(true);
    try {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      const res = await api.get("/auth/me");
      setUser(res.data);

      navigate("/dashboard");
    } catch (error) {
      console.error("Error en login:", error);
    } finally {
      setIsPostLoginLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common["Authorization"];
    navigate("/");
  };

  const useCan = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };


  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isPostLoginLoading,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    useCan,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
