"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await login(email, password);
      // El router push está dentro de login context
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }}>
      {/* Background decorativo */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse at 20% 50%, #f8717110 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #3b82f610 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "400px" }}>
        
        {/* Botón Volver */}
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
          <Link href="/" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            textDecoration: "none",
            fontWeight: "500",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}>
            <span>←</span> Volver al Inicio
          </Link>
        </div>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "64px", height: "64px",
            background: "var(--accent)",
            borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", fontWeight: "800", color: "white",
            margin: "0 auto 1rem",
            boxShadow: "0 0 30px #f8717140",
          }}>M</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>
            Macavilpaz
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Sistema de Gestión de Activos Fijos
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.5rem" }}>
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="admin@macavilpaz.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p style={{ color: "#f87171", fontSize: "0.8rem", background: "#7f1d1d22", padding: "0.5rem 0.75rem", borderRadius: "0.5rem" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: "0.5rem", padding: "0.75rem", fontSize: "0.95rem", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Ingresando..." : "Ingresar al Sistema"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "1.5rem" }}>
          Constructora Macavilpaz © 2026
        </p>
      </div>
    </div>
  );
}
