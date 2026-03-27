"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Recuperar sesión del localStorage al cargar
    const storedUser = localStorage.getItem("macavilpaz_user");
    const storedToken = localStorage.getItem("macavilpaz_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.usuario);
        setToken(data.token);
        localStorage.setItem("macavilpaz_token", data.token);
        localStorage.setItem("macavilpaz_user", JSON.stringify(data.usuario));
        router.push("/dashboard");
      } else {
        throw new Error(data.mensaje || "Error al iniciar sesión");
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("macavilpaz_token");
    localStorage.removeItem("macavilpaz_user");
    router.push("/");
  };

  const value = React.useMemo(() => ({
    user,
    token,
    login,
    logout,
    loading
  }), [user, token, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
