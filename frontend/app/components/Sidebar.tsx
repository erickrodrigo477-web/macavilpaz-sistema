"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

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
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  ),
  Compras: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  ),
  Almacenes: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V7L12 3L21 7V21H16V14H8V21H3Z"/></svg>
  ),
};

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: Icons.Dashboard, roles: ["Administrador", "Almacén", "Supervisor de Obra", "Técnico", "Contabilidad"] },
  { href: "/activos",      label: "Activos Fijos", icon: Icons.Activos, roles: ["Administrador", "Contabilidad"] },
  { href: "/asignaciones", label: "Asignaciones",  icon: Icons.Asignaciones, roles: ["Administrador"] },
  { href: "/obras",        label: "Obras",         icon: Icons.Obras, roles: ["Administrador", "Supervisor de Obra", "Contabilidad"] },
  { href: "/almacenes",    label: "Almacenes",     icon: Icons.Almacenes, roles: ["Administrador", "Almacén"] },
  { href: "/suministros",  label: "Suministros",   icon: Icons.Suministros, roles: ["Administrador", "Almacén"] },
  { href: "/solicitudes",  label: "Solicitudes",   icon: Icons.Solicitudes, roles: ["Administrador", "Almacén", "Supervisor de Obra", "Técnico"] },
  { href: "/movimientos",  label: "Movimientos",   icon: Icons.Movimientos, roles: ["Administrador", "Almacén"] },
  { href: "/compras",     label: "Compras",       icon: Icons.Compras, roles: ["Administrador", "Contabilidad"] },
  { href: "/usuarios",     label: "Usuarios",      icon: Icons.Usuarios, roles: ["Administrador"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const filteredItems = navItems.filter(item => 
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
        transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Elemento Decorativo de Fondo */}
      <div style={{
        position: "absolute",
        bottom: "-50px",
        left: "-50px",
        width: "200px",
        height: "200px",
        background: "var(--accent)",
        opacity: 0.03,
        borderRadius: "50%",
        filter: "blur(60px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{
        padding: isCollapsed ? "2rem 0.5rem" : "2rem 1.5rem",
        background: "linear-gradient(to bottom, transparent, rgba(var(--accent-rgb), 0.02))",
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "flex-start",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{
          width: "42px", height: "42px",
          background: "linear-gradient(135deg, var(--accent), #ff9a8b)",
          borderRadius: "12px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.25rem", fontWeight: "900", color: "white",
          boxShadow: "0 8px 16px rgba(248, 113, 113, 0.3)",
          flexShrink: 0
        }}>M</div>
        
        <div style={{ 
          opacity: isCollapsed ? 0 : 1, 
          visibility: isCollapsed ? "hidden" : "visible",
          transition: "opacity 0.4s ease, visibility 0.4s, width 0.4s ease",
          whiteSpace: "nowrap",
          overflow: "hidden",
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


      {/* Navigation Contenedor */}
      <nav style={{ 
        flex: 1, 
        padding: isCollapsed ? "1.5rem 0.5rem" : "1.5rem 1rem", 
        display: "flex", 
        flexDirection: "column", 
        gap: "0.5rem",
        position: "relative",
        zIndex: 1,
        background: "linear-gradient(to bottom, rgba(var(--accent-rgb), 0.01), transparent 20%)",
        overflowX: "hidden",
        overflowY: "auto",
        transition: "padding 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }} className="sidebar-nav">
        {filteredItems.map(item => {
          const isActive = pathname === item.href;
          const IconComp = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: isCollapsed ? "0" : "1rem",
                padding: "0.75rem",
                borderRadius: "0.85rem",
                fontSize: "0.95rem",
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
                textDecoration: "none",
                background: isActive ? "rgba(var(--accent-rgb), 0.15)" : "transparent",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                minWidth: isCollapsed ? "50px" : "auto",
              }}
              title={isCollapsed ? item.label : ""}
            >
              <div className="nav-icon" style={{ 
                display: "flex", 
                color: isActive ? "var(--accent)" : "inherit",
                filter: isActive ? "drop-shadow(0 0 8px rgba(var(--accent-rgb), 0.4))" : "none",
                flexShrink: 0,
                transition: "transform 0.4s ease",
                transform: isCollapsed ? "scale(1.1)" : "scale(1)",
              }}>
                <IconComp />
              </div>
              
              <span style={{ 
                whiteSpace: "nowrap",
                opacity: isCollapsed ? 0 : 1,
                visibility: isCollapsed ? "hidden" : "visible",
                transition: "opacity 0.4s ease, visibility 0.4s",
                overflow: "hidden",
                width: isCollapsed ? "0" : "auto",
              }}>
                {item.label}
              </span>

              {isActive && !isCollapsed && (
                <div style={{
                  position: "absolute",
                  left: "0",
                  width: "4px",
                  height: "16px",
                  background: "var(--accent)",
                  borderRadius: "0 4px 4px 0",
                  boxShadow: "0 0 10px var(--accent)"
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div style={{ 
        padding: isCollapsed ? "1.5rem 0.5rem" : "1.5rem", 
        background: "rgba(0,0,0,0.01)",
        display: "flex",
        flexDirection: "column",
        alignItems: isCollapsed ? "center" : "stretch",
        transition: "padding 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "1.25rem",
          justifyContent: isCollapsed ? "center" : "flex-start"
        }}>
          <div style={{
            width: "40px", height: "40px",
            background: "var(--bg-primary)",
            border: "2px solid var(--border)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem",
            flexShrink: 0,
            transition: "transform 0.4s ease",
            transform: isCollapsed ? "scale(0.9)" : "scale(1)",
          }} title={`${user?.nombre} - ${user?.rol}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          
          <div style={{ 
            flex: 1, 
            minWidth: 0,
            opacity: isCollapsed ? 0 : 1,
            visibility: isCollapsed ? "hidden" : "visible",
            transition: "opacity 0.4s ease, visibility 0.4s, width 0.4s ease",
            overflow: "hidden",
            width: isCollapsed ? "0px" : "auto",
            marginLeft: isCollapsed ? "0px" : "0.75rem",
          }}>

            <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.nombre || "Cargando..."}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              {user?.rol || "Invitado"}
            </div>
          </div>
        </div>

        <button 
          onClick={logout}
          style={{ 
            width: isCollapsed ? "40px" : "100%", 
            height: isCollapsed ? "40px" : "auto",
            padding: isCollapsed ? "0" : "0.75rem", 
            fontSize: "0.85rem", 
            fontWeight: "700",
            background: "transparent", 
            color: "#ef4444", 
            border: "1.5px solid #ef444430",
            borderRadius: "0.75rem",
            cursor: "pointer",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
          title={isCollapsed ? "Cerrar Sesión" : ""}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#ef444410";
            e.currentTarget.style.borderColor = "#ef4444";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "#ef444430";
          }}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          ) : (
            <span style={{ 
              opacity: isCollapsed ? 0 : 1,
              visibility: isCollapsed ? "hidden" : "visible",
              transition: "opacity 0.4s ease, visibility 0.4s",
            }}>
              Cerrar Sesión
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
