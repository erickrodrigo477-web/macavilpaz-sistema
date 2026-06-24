"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/app/components/StatsCard";
import { useAuth } from "@/app/context/AuthContext";

interface KPI {
  title: string;
  value: number | string;
  subtitle: string;
  iconType: string;
  color: string;
}

interface Stats {
  kpis: KPI[];
  actividadReciente: Array<{
    tipo: string;
    descripcion: string;
    fecha: string;
    estado: string;
  }>;
  estadosDistribucion: Array<{
    estado: string;
    count: string;
  }>;
}

const badgeMap: Record<string, string> = {
  activo:     "badge badge-green",
  entrada:    "badge badge-blue",
  salida:     "badge badge-orange",
  pendiente:  "badge badge-yellow",
  completado: "badge badge-green",
  aprobado:   "badge badge-green",
  mantenimiento: "badge badge-orange",
};

const distIconMap: Record<string, string> = {
  Operativo: "#4ade80",
  Mantenimiento: "#fbbf24",
  "Fuera de Servicio": "#f87171",
  Asignado: "#60a5fa",
};

// Iconos SVG para reemplazar los emojis
const KpiIcons: Record<string, React.ReactNode> = {
  activos: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-4-4H4a2 2 0 0 0-2 2z"/><path d="M16 4v4h4"/><path d="m9 12 2 2 4-4"/></svg>,
  obras: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  solicitudes: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/></svg>,
  suministros: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  alert: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  movimientos: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-3 3-3-3"/><path d="M12 12v9"/><path d="m9 6 3-3 3 3"/><path d="M12 3v9"/><path d="M7 8 5 5 2 8"/><path d="M5 5v14a2 2 0 0 0 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1"/><path d="M17 16 19 19 22 16"/></svg>,
  mantenimiento: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  check: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  usuarios: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
};

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar stats:", err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "auto" }}>

      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Header descriptivo basado en el rol */}
        <div style={{ marginBottom: "0.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>Dashboard: {user?.rol}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Bienvenido, {user?.nombre}. Aquí tienes el resumen de tu actividad.</p>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {loading ? (
            <p>Cargando métricas...</p>
          ) : stats?.kpis?.map((kpi, idx) => (
            <StatsCard 
              key={idx}
              title={kpi.title}   
              value={kpi.value}  
              icon={KpiIcons[kpi.iconType] || KpiIcons.activos} 
              color={kpi.color} 
              subtitle={kpi.subtitle} 
            />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: stats?.estadosDistribucion && stats.estadosDistribucion.length > 0 ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>
          {/* Actividad reciente */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Actividad Reciente</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>Cargando actividad...</td></tr>
                ) : !stats?.actividadReciente || stats.actividadReciente.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>No hay actividad reciente</td></tr>
                ) : stats.actividadReciente.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{item.tipo}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.descripcion}</td>
                    <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                      {new Date(item.fecha).toLocaleDateString()}
                    </td>
                    <td><span className={badgeMap[item.estado?.toLowerCase()] || "badge badge-gray"}>{item.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen por tipo/estado (Solo si hay datos de distribución, ej. Administrador) */}
          {stats?.estadosDistribucion && stats.estadosDistribucion.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "1.25rem" }}>Distribución de Activos</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {stats.estadosDistribucion.map(item => {
                  const total = stats.kpis.find(k => k.title === "Total Activos Fijos")?.value || 1;
                  const pct = (Number(item.count) / Number(total)) * 100;
                  return (
                    <div key={item.estado}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                        <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{item.estado}</span>
                        <span style={{ color: "var(--text-secondary)" }}>{item.count} unidades</span>
                      </div>
                      <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ 
                          height: "100%", 
                          width: `${pct}%`, 
                          background: distIconMap[item.estado] || "var(--accent)", 
                          borderRadius: "3px" 
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
