"use client";

import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";

const routeConfig: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":    { title: "Dashboard",       subtitle: "Resumen general del sistema" },
  "/activos":      { title: "Activos Fijos",   subtitle: "Gestión del inventario de activos" },
  "/asignaciones": { title: "Asignaciones",    subtitle: "Control de activos en obra" },
  "/obras":        { title: "Obras",           subtitle: "Gestión de proyectos y obras" },
  "/suministros":  { title: "Suministros",     subtitle: "Gestión de inventario de materiales" },
  "/solicitudes":  { title: "Solicitudes",     subtitle: "Flujo de pedidos de materiales" },
  "/movimientos":  { title: "Movimientos",     subtitle: "Historial de entradas y salidas" },
  "/usuarios":     { title: "Usuarios",        subtitle: "Gestión de accesos y roles" },
};

export default function Topbar() {
  const pathname = usePathname();
  const config = routeConfig[pathname] || { title: "Macavilpaz", subtitle: "Sistema de Gestión" };

  return (
    <header
      className="topbar"
      style={{
        height: "80px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--header-shadow)",
        zIndex: 50,
      }}
    >
      {/* Formas animadas de fondo */}
      <div className="header-shape header-shape-1" style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }} />
      <div className="header-shape header-shape-2" style={{ borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%" }} />

      {/* Estela de Cuadrados Premium (20 Partículas) */}
      <div className="square-particle sq-1" />
      <div className="square-particle sq-2" />
      <div className="square-particle sq-3" />
      <div className="square-particle sq-4" />
      <div className="square-particle sq-5" />
      <div className="square-particle sq-6" />
      <div className="square-particle sq-7" />
      <div className="square-particle sq-8" />
      <div className="square-particle sq-9" />
      <div className="square-particle sq-10" />
      <div className="square-particle sq-11" />
      <div className="square-particle sq-12" />
      <div className="square-particle sq-13" />
      <div className="square-particle sq-14" />
      <div className="square-particle sq-15" />
      <div className="square-particle sq-16" />
      <div className="square-particle sq-17" />
      <div className="square-particle sq-18" />
      <div className="square-particle sq-19" />
      <div className="square-particle sq-20" />

      <div style={{ position: "relative", zIndex: 10 }}>
        <h1
          className="topbar-title"
          style={{ 
            fontSize: "1.45rem", 
            fontWeight: "800", 
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: "1.2"
          }}
        >
          {config.title}
        </h1>
        {config.subtitle && (
          <p
            className="topbar-subtitle"
            style={{ 
              fontSize: "0.95rem", 
              color: "var(--text-secondary)", 
              marginTop: "2px",
              opacity: 0.8
            }}
          >
            {config.subtitle}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", position: "relative", zIndex: 10 }}>
        <ThemeToggle />
      </div>
    </header>
  );
}
