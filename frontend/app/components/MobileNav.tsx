"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

// ─── Icons (mismos que Sidebar) ───────────────────────────────────────────────
const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
  ),
  Activos: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-4-4H4a2 2 0 0 0-2 2z"/><path d="M16 4v4h4"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  Suministros: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  ),
  Solicitudes: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/></svg>
  ),
  Obras: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
  ),
  Almacenes: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V7L12 3L21 7V21H16V14H8V21H3Z"/></svg>
  ),
  Usuarios: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Mantenimiento: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  ),
  Asignaciones: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  ),
  Depreciacion: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
  ),
  Movimientos: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-3 3-3-3"/><path d="M12 12v9"/><path d="m9 6 3-3 3 3"/><path d="M12 3v9"/></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  ),
};

// ─── Configuración de ítems por rol ───────────────────────────────────────────

const adminMainItems = [
  { href: "/dashboard",    label: "Dashboard",   icon: Icons.Dashboard },
  { href: "/activos",      label: "Activos",      icon: Icons.Activos },
  { href: "/suministros",  label: "Suministros",  icon: Icons.Suministros },
  { href: "/solicitudes",  label: "Solicitudes",  icon: Icons.Solicitudes },
];

const adminDrawerItems = [
  { href: "/mantenimiento", label: "Mantenimiento",  icon: Icons.Mantenimiento },
  { href: "/asignaciones",  label: "Asignaciones",   icon: Icons.Asignaciones },
  { href: "/depreciacion",  label: "Depreciación",   icon: Icons.Depreciacion },
  { href: "/obras",         label: "Obras",          icon: Icons.Obras },
  { href: "/almacenes",     label: "Almacenes",      icon: Icons.Almacenes },
  { href: "/movimientos",   label: "Movimientos",    icon: Icons.Movimientos },
  { href: "/usuarios",      label: "Usuarios",       icon: Icons.Usuarios },
];

const roleItems: Record<string, { href: string; label: string; icon: () => JSX.Element }[]> = {
  "Almacén": [
    { href: "/dashboard",   label: "Dashboard",  icon: Icons.Dashboard },
    { href: "/suministros", label: "Suministros",icon: Icons.Suministros },
    { href: "/solicitudes", label: "Solicitudes",icon: Icons.Solicitudes },
    { href: "/movimientos", label: "Movimientos",icon: Icons.Movimientos },
    { href: "/almacenes",   label: "Almacenes",  icon: Icons.Almacenes },
  ],
  "Supervisor de Obra": [
    { href: "/dashboard",   label: "Dashboard",  icon: Icons.Dashboard },
    { href: "/obras",       label: "Obras",      icon: Icons.Obras },
    { href: "/activos",     label: "Activos",    icon: Icons.Activos },
    { href: "/suministros", label: "Suministros",icon: Icons.Suministros },
    { href: "/solicitudes", label: "Solicitudes",icon: Icons.Solicitudes },
  ],
  "Técnico": [
    { href: "/dashboard",     label: "Dashboard",    icon: Icons.Dashboard },
    { href: "/activos",       label: "Activos",      icon: Icons.Activos },
    { href: "/mantenimiento", label: "Mantenimiento",icon: Icons.Mantenimiento },
    { href: "/suministros",   label: "Suministros",  icon: Icons.Suministros },
    { href: "/solicitudes",   label: "Solicitudes",  icon: Icons.Solicitudes },
  ],
  "Contabilidad": [
    { href: "/dashboard",     label: "Dashboard",   icon: Icons.Dashboard },
    { href: "/activos",       label: "Activos",     icon: Icons.Activos },
    { href: "/depreciacion",  label: "Depreciación",icon: Icons.Depreciacion },
    { href: "/mantenimiento", label: "Mantenimiento",icon: Icons.Mantenimiento },
    { href: "/obras",         label: "Obras",       icon: Icons.Obras },
  ],
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cerrar drawer al cambiar de ruta
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const isAdmin = user?.rol === "Administrador";
  const mainItems = isAdmin ? adminMainItems : (roleItems[user?.rol ?? ""] ?? []).slice(0, 4);
  const drawerItems = isAdmin ? adminDrawerItems : [];

  const showMore = isAdmin || (roleItems[user?.rol ?? ""] ?? []).length > 4;

  return (
    <>
      {/* ── Bottom Navigation Bar ─────────────────────────────── */}
      <nav
        className="mobile-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "64px",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 200,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {mainItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                flex: 1,
                height: "100%",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.2s",
                position: "relative",
              }}
            >
              {isActive && (
                <span style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: "2px",
                  background: "var(--accent)",
                  borderRadius: "0 0 4px 4px",
                  boxShadow: "0 0 8px var(--accent)",
                }} />
              )}
              <item.icon />
              <span style={{
                fontSize: "0.6rem",
                fontWeight: isActive ? "700" : "500",
                letterSpacing: "0.01em",
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Botón "Más" */}
        {showMore && (
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              flex: 1,
              height: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: drawerOpen ? "var(--accent)" : "var(--text-secondary)",
              transition: "color 0.2s",
            }}
          >
            <Icons.Menu />
            <span style={{ fontSize: "0.6rem", fontWeight: "500" }}>Más</span>
          </button>
        )}
      </nav>

      {/* ── Drawer lateral (menú completo) ────────────────────── */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 300,
            }}
          />

          {/* Panel del drawer */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: "var(--bg-secondary)",
              borderRadius: "1.25rem 1.25rem 0 0",
              zIndex: 400,
              padding: "1.5rem",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.3)",
            }}
          >
            {/* Handle + encabezado */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}>
              <div>
                <div style={{ fontWeight: "800", fontSize: "1rem", color: "var(--text-primary)" }}>
                  Menú completo
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {user?.nombre} · <span style={{ color: "var(--accent)" }}>{user?.rol}</span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                <Icons.Close />
              </button>
            </div>

            {/* Ítems del drawer */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {(isAdmin ? adminDrawerItems : (roleItems[user?.rol ?? ""] ?? []).slice(4)).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      padding: "0.875rem 1rem",
                      borderRadius: "0.75rem",
                      color: isActive ? "var(--accent)" : "var(--text-primary)",
                      background: isActive ? "rgba(var(--accent-rgb), 0.1)" : "transparent",
                      fontWeight: isActive ? "700" : "500",
                      fontSize: "0.95rem",
                      textDecoration: "none",
                      transition: "background 0.2s",
                      boxShadow: isActive ? "inset 4px 0 0 var(--accent)" : "none",
                    }}
                  >
                    <item.icon />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Cerrar sesión */}
            <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
              <button
                onClick={logout}
                style={{
                  width: "100%",
                  padding: "0.875rem",
                  background: "transparent",
                  color: "#ef4444",
                  border: "1.5px solid #ef444430",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
