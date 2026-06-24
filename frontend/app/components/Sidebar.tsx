"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
  ),
  Activos: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-4-4H4a2 2 0 0 0-2 2z"/><path d="M16 4v4h4"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  Asignaciones: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  ),
  Obras: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
  ),
  Suministros: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  ),
  Solicitudes: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/></svg>
  ),
  Movimientos: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-3 3-3-3"/><path d="M12 12v9"/><path d="m9 6 3-3 3 3"/><path d="M12 3v9"/><path d="M7 8 5 5 2 8"/><path d="M5 5v14a2 2 0 0 0 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1"/><path d="M17 16 19 19 22 16"/></svg>
  ),
  Usuarios: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Almacenes: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V7L12 3L21 7V21H16V14H8V21H3Z"/></svg>
  ),
  Mantenimiento: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  ),
  Depreciacion: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  ),
  // Ícono de grupo Activos Fijos
  GroupActivos: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
  ),
  // Ícono de grupo Suministros
  GroupSuministros: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14"/><path d="M5 12h14"/><path d="M5 16h14"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>
  ),
};

// ─── Nav config ───────────────────────────────────────────────────────────────

// Ítems simples (sin grupo) para el Administrador
const adminTopItems = [
  { href: "/dashboard", label: "Dashboard", icon: Icons.Dashboard },
];

// Grupos desplegables solo para Administrador
const adminGroups = [
  {
    key: "activos-fijos",
    label: "Activos Fijos",
    icon: Icons.GroupActivos,
    children: [
      { href: "/activos",       label: "Activos Fijos",  icon: Icons.Activos },
      { href: "/mantenimiento", label: "Mantenimiento",  icon: Icons.Mantenimiento },
      { href: "/asignaciones",  label: "Asignaciones",   icon: Icons.Asignaciones },
      { href: "/depreciacion",  label: "Depreciación",   icon: Icons.Depreciacion },
    ],
  },
  {
    key: "suministros",
    label: "Suministros",
    icon: Icons.GroupSuministros,
    children: [
      { href: "/suministros",  label: "Suministros",  icon: Icons.Suministros },
      { href: "/solicitudes",  label: "Solicitudes",  icon: Icons.Solicitudes },
      { href: "/movimientos",  label: "Movimientos",  icon: Icons.Movimientos },
    ],
  },
];

// Ítems simples para el Administrador (debajo de los grupos)
const adminBottomItems = [
  { href: "/obras",      label: "Obras",      icon: Icons.Obras },
  { href: "/almacenes",  label: "Almacenes",  icon: Icons.Almacenes },
  { href: "/usuarios",   label: "Usuarios",   icon: Icons.Usuarios },
];

// Ítems para otros roles (sin grupos)
const otherNavItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: Icons.Dashboard,    roles: ["Almacén", "Supervisor de Obra", "Técnico", "Contabilidad"] },
  { href: "/activos",      label: "Activos Fijos", icon: Icons.Activos,     roles: ["Contabilidad", "Almacén", "Técnico", "Supervisor de Obra"] },
  { href: "/depreciacion", label: "Depreciación",  icon: Icons.Depreciacion, roles: ["Contabilidad"] },
  { href: "/mantenimiento",label: "Mantenimiento", icon: Icons.Mantenimiento,roles: ["Contabilidad", "Técnico"] },
  { href: "/asignaciones", label: "Asignaciones",  icon: Icons.Asignaciones, roles: ["Almacén", "Supervisor de Obra"] },
  { href: "/obras",        label: "Obras",         icon: Icons.Obras,        roles: ["Supervisor de Obra", "Contabilidad", "Técnico"] },
  { href: "/almacenes",    label: "Almacenes",     icon: Icons.Almacenes,    roles: ["Almacén"] },
  { href: "/suministros",  label: "Suministros",   icon: Icons.Suministros,  roles: ["Almacén", "Supervisor de Obra", "Técnico"] },
  { href: "/solicitudes",  label: "Solicitudes",   icon: Icons.Solicitudes,  roles: ["Almacén", "Supervisor de Obra", "Técnico"] },
  { href: "/movimientos",  label: "Movimientos",   icon: Icons.Movimientos,  roles: ["Almacén"] },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLink({ href, label, icon: IconComp, isActive, isCollapsed, isChild = false }: {
  href: string; label: string; icon: () => JSX.Element;
  isActive: boolean; isCollapsed: boolean; isChild?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`nav-link ${isActive ? "nav-link-active" : ""}`}
      title={isCollapsed ? label : ""}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "flex-start",
        gap: isCollapsed ? "0" : "0.875rem",
        padding: isChild ? "0.55rem 0.75rem 0.55rem 1rem" : "0.75rem",
        borderRadius: "0.75rem",
        fontSize: isChild ? "0.875rem" : "0.95rem",
        fontWeight: isActive ? "700" : "500",
        color: isActive ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
        textDecoration: "none",
        background: isActive ? "rgba(var(--accent-rgb), 0.15)" : "transparent",
        position: "relative",
        transition: "all 0.25s ease",
        minWidth: isCollapsed ? "50px" : "auto",
        marginLeft: isChild && !isCollapsed ? "0.25rem" : "0",
      }}
    >
      {/* Dot indicator for child items */}
      {isChild && !isCollapsed && (
        <span style={{
          width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
          background: isActive ? "var(--accent)" : "var(--border)",
          transition: "background 0.2s",
        }} />
      )}
      {!isChild && (
        <div className="nav-icon" style={{
          display: "flex",
          color: isActive ? "var(--accent)" : "inherit",
          filter: isActive ? "drop-shadow(0 0 8px rgba(var(--accent-rgb), 0.4))" : "none",
          flexShrink: 0,
          transition: "transform 0.3s ease",
          transform: isCollapsed ? "scale(1.1)" : "scale(1)",
        }}>
          <IconComp />
        </div>
      )}
      <span style={{
        whiteSpace: "nowrap",
        opacity: isCollapsed ? 0 : 1,
        visibility: isCollapsed ? "hidden" : "visible",
        transition: "opacity 0.3s ease, visibility 0.3s",
        overflow: "hidden",
        width: isCollapsed ? "0" : "auto",
      }}>
        {label}
      </span>
      {isActive && !isCollapsed && (
        <div style={{
          position: "absolute", left: "0",
          width: "3px", height: "14px",
          background: "var(--accent)",
          borderRadius: "0 4px 4px 0",
          boxShadow: "0 0 8px var(--accent)",
        }} />
      )}
    </Link>
  );
}

function NavGroup({ groupKey, label, icon: IconComp, children, pathname, isCollapsed, openGroups, toggleGroup }: {
  groupKey: string; label: string; icon: () => JSX.Element;
  children: { href: string; label: string; icon: () => JSX.Element }[];
  pathname: string; isCollapsed: boolean;
  openGroups: Record<string, boolean>;
  toggleGroup: (key: string) => void;
}) {
  const isOpen = openGroups[groupKey] ?? false;
  const hasActive = children.some(c => pathname === c.href);

  return (
    <div>
      {/* Group header button */}
      <button
        onClick={() => { if (!isCollapsed) toggleGroup(groupKey); }}
        title={isCollapsed ? label : ""}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          gap: isCollapsed ? "0" : "0.875rem",
          padding: "0.75rem",
          borderRadius: "0.75rem",
          border: "none", cursor: "pointer",
          background: hasActive ? "rgba(var(--accent-rgb), 0.08)" : "transparent",
          color: hasActive ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
          fontWeight: hasActive ? "700" : "600",
          fontSize: "0.95rem",
          transition: "all 0.25s ease",
          outline: "none",
        }}
        onMouseOver={e => {
          if (!hasActive) e.currentTarget.style.background = "rgba(var(--accent-rgb), 0.06)";
        }}
        onMouseOut={e => {
          if (!hasActive) e.currentTarget.style.background = "transparent";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isCollapsed ? "0" : "0.875rem", flex: isCollapsed ? "none" : 1 }}>
          <div style={{
            display: "flex", flexShrink: 0,
            color: hasActive ? "var(--accent)" : "inherit",
            filter: hasActive ? "drop-shadow(0 0 8px rgba(var(--accent-rgb),0.4))" : "none",
            transform: isCollapsed ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}>
            <IconComp />
          </div>
          <span style={{
            whiteSpace: "nowrap",
            opacity: isCollapsed ? 0 : 1,
            visibility: isCollapsed ? "hidden" : "visible",
            transition: "opacity 0.3s ease, visibility 0.3s",
            overflow: "hidden",
            width: isCollapsed ? "0" : "auto",
          }}>
            {label}
          </span>
        </div>
        {/* Chevron */}
        {!isCollapsed && (
          <div style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            color: "var(--text-secondary)",
            flexShrink: 0,
          }}>
            <Icons.ChevronDown />
          </div>
        )}
      </button>

      {/* Children */}
      {!isCollapsed && (
        <div style={{
          overflow: "hidden",
          maxHeight: isOpen ? `${children.length * 52}px` : "0px",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}>
          {/* Vertical line */}
          <div style={{ position: "relative", paddingLeft: "1.5rem", marginTop: "2px" }}>
            <div style={{
              position: "absolute", left: "24px", top: "4px",
              bottom: "4px", width: "1px",
              background: "var(--border)",
            }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {children.map(child => (
                <NavLink
                  key={child.href}
                  href={child.href}
                  label={child.label}
                  icon={child.icon}
                  isActive={pathname === child.href}
                  isCollapsed={false}
                  isChild
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Profile modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ actual: "", nueva: "", confirmacion: "" });
  const [profileMessage, setProfileMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.nueva !== passwordData.confirmacion) {
      setProfileMessage({ type: 'error', text: "Las contraseñas no coinciden" });
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/cambiar-password`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          passwordActual: passwordData.actual,
          passwordNueva: passwordData.nueva
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al cambiar la contraseña");
      
      setProfileMessage({ type: 'success', text: "Contraseña cambiada exitosamente" });
      setPasswordData({ actual: "", nueva: "", confirmacion: "" });
      setTimeout(() => setShowProfileModal(false), 2000);
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.message });
    }
  };

  // Auto-open groups if current path belongs to them
  const getInitialGroups = () => {
    const state: Record<string, boolean> = {};
    adminGroups.forEach(g => {
      state[g.key] = g.children.some(c => c.href === pathname);
    });
    return state;
  };
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialGroups);

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isAdmin = user?.rol === "Administrador";

  const filteredOtherItems = otherNavItems.filter(item =>
    user && item.roles.includes(user.rol)
  );

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      style={{
        width: isCollapsed ? "80px" : "280px",
        minHeight: "100vh",
        background: "var(--sidebar-gradient)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
        boxShadow: "10px 0 30px rgba(0, 0, 0, 0.2)",
        zIndex: 60,
        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Decorativo fondo */}
      <div style={{
        position: "absolute", bottom: "-50px", left: "-50px",
        width: "200px", height: "200px",
        background: "var(--accent)", opacity: 0.03,
        borderRadius: "50%", filter: "blur(60px)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Logo */}
      <div style={{
        padding: isCollapsed ? "2rem 0.5rem" : "2rem 1.5rem",
        background: "linear-gradient(to bottom, transparent, rgba(var(--accent-rgb), 0.02))",
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center",
        justifyContent: isCollapsed ? "center" : "flex-start",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{
          width: "42px", height: "42px",
          background: "linear-gradient(135deg, var(--accent), #ff9a8b)",
          borderRadius: "12px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.25rem", fontWeight: "900", color: "white",
          boxShadow: "0 8px 16px rgba(248, 113, 113, 0.3)",
          flexShrink: 0,
        }}>M</div>
        <div style={{
          opacity: isCollapsed ? 0 : 1,
          visibility: isCollapsed ? "hidden" : "visible",
          transition: "opacity 0.3s ease, visibility 0.3s, width 0.3s ease",
          whiteSpace: "nowrap", overflow: "hidden",
          width: isCollapsed ? "0px" : "auto",
          marginLeft: isCollapsed ? "0px" : "1rem",
        }}>
          <div style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Macavilpaz
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500" }}>
            Sistema de Gestión
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        className="sidebar-nav"
        style={{
          flex: 1,
          padding: isCollapsed ? "1rem 0.5rem" : "1rem",
          display: "flex", flexDirection: "column", gap: "2px",
          position: "relative", zIndex: 1,
          overflowX: "hidden", overflowY: "auto",
          transition: "padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {isAdmin ? (
          <>
            {/* Dashboard */}
            {adminTopItems.map(item => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}

            {/* Separador */}
            {!isCollapsed && (
              <div style={{ margin: "0.5rem 0.25rem", borderTop: "1px solid var(--border)" }} />
            )}

            {/* Grupos desplegables */}
            {adminGroups.map(group => (
              <NavGroup
                key={group.key}
                groupKey={group.key}
                label={group.label}
                icon={group.icon}
                children={group.children}
                pathname={pathname}
                isCollapsed={isCollapsed}
                openGroups={openGroups}
                toggleGroup={toggleGroup}
              />
            ))}

            {/* Separador */}
            {!isCollapsed && (
              <div style={{ margin: "0.5rem 0.25rem", borderTop: "1px solid var(--border)" }} />
            )}

            {/* Resto de ítems del admin */}
            {adminBottomItems.map(item => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}
          </>
        ) : (
          // Otros roles — lista simple
          filteredOtherItems.map(item => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))
        )}
      </nav>

      {/* Footer / User */}
      <div style={{
        padding: isCollapsed ? "1.5rem 0.5rem" : "1.5rem",
        background: "rgba(0,0,0,0.01)",
        display: "flex", flexDirection: "column",
        alignItems: isCollapsed ? "center" : "stretch",
        transition: "padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
      }}>
        <div 
          onClick={() => setShowProfileModal(true)}
          title="Ver Mi Perfil / Cambiar Contraseña"
          style={{
            display: "flex", alignItems: "center", marginBottom: "1.25rem",
            justifyContent: isCollapsed ? "center" : "flex-start",
            cursor: "pointer",
            padding: isCollapsed ? "0" : "0.5rem",
            borderRadius: "0.5rem",
            transition: "background 0.2s",
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(var(--accent-rgb), 0.1)"}
          onMouseOut={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{
            width: "40px", height: "40px",
            background: "var(--bg-primary)",
            border: "2px solid var(--accent)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", flexShrink: 0,
            transform: isCollapsed ? "scale(0.9)" : "scale(1)",
            transition: "transform 0.3s ease",
            color: "var(--accent)"
          }} title={`${user?.nombre} - ${user?.rol}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style={{
            flex: 1, minWidth: 0,
            opacity: isCollapsed ? 0 : 1,
            visibility: isCollapsed ? "hidden" : "visible",
            transition: "opacity 0.3s ease, visibility 0.3s, width 0.3s ease",
            overflow: "hidden",
            width: isCollapsed ? "0px" : "auto",
            marginLeft: isCollapsed ? "0px" : "0.75rem",
          }}>
            <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.nombre || "Cargando..."}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: "600" }}>
              Mi Perfil
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: isCollapsed ? "40px" : "100%",
            height: isCollapsed ? "40px" : "auto",
            padding: isCollapsed ? "0" : "0.75rem",
            fontSize: "0.85rem", fontWeight: "700",
            background: "transparent", color: "#ef4444",
            border: "1.5px solid #ef444430",
            borderRadius: "0.75rem", cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}
          title={isCollapsed ? "Cerrar Sesión" : ""}
          onMouseOver={e => { e.currentTarget.style.background = "#ef444410"; e.currentTarget.style.borderColor = "#ef4444"; }}
          onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#ef444430"; }}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          ) : (
            <span style={{ opacity: isCollapsed ? 0 : 1, visibility: isCollapsed ? "hidden" : "visible", transition: "opacity 0.3s ease, visibility 0.3s" }}>
              Cerrar Sesión
            </span>
          )}
        </button>
      </div>

      {/* Modal de Mi Perfil */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "450px", padding: "0" }}>
            
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Icons.Usuarios /> Mi Perfil
              </h2>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Información del usuario */}
              <div style={{ background: "var(--bg-primary)", padding: "1.25rem", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700" }}>Nombre</div>
                  <div style={{ fontSize: "1rem", fontWeight: "600" }}>{user?.nombre}</div>
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700" }}>Correo Electrónico</div>
                  <div style={{ fontSize: "1rem", fontWeight: "600" }}>{user?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700" }}>Rol</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "600", display: "inline-block", background: "rgba(var(--accent-rgb), 0.1)", color: "var(--accent)", padding: "0.2rem 0.6rem", borderRadius: "1rem", marginTop: "0.25rem" }}>
                    {user?.rol}
                  </div>
                </div>
              </div>

              {/* Formulario cambio contraseña */}
              <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Cambiar Contraseña</h3>
                
                {profileMessage && (
                  <div style={{ 
                    padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.85rem", fontWeight: "600",
                    background: profileMessage.type === 'error' ? "#fef2f2" : "#f0fdf4",
                    color: profileMessage.type === 'error' ? "#ef4444" : "#16a34a",
                    border: `1px solid ${profileMessage.type === 'error' ? "#fca5a5" : "#86efac"}`
                  }}>
                    {profileMessage.text}
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.25rem", color: "var(--text-secondary)" }}>Contraseña Actual</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordData.actual} 
                    onChange={e => setPasswordData({...passwordData, actual: e.target.value})}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--bg-primary)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.25rem", color: "var(--text-secondary)" }}>Nueva Contraseña</label>
                  <input 
                    type="password" 
                    required 
                    minLength={6}
                    value={passwordData.nueva} 
                    onChange={e => setPasswordData({...passwordData, nueva: e.target.value})}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--bg-primary)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.25rem", color: "var(--text-secondary)" }}>Confirmar Nueva Contraseña</label>
                  <input 
                    type="password" 
                    required 
                    minLength={6}
                    value={passwordData.confirmacion} 
                    onChange={e => setPasswordData({...passwordData, confirmacion: e.target.value})}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--bg-primary)" }}
                  />
                </div>
                
                <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem" }}>
                  Actualizar Contraseña
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
