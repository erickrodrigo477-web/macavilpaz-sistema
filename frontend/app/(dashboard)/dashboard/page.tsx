"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/app/components/StatsCard";

interface Stats {
  activos: { total: number; mantenimiento: number };
  obras: { activas: number; pendientes: number };
  solicitudes: { pendientes: number; urgentes: number };
  suministros: { total: number; bajoMinimo: number };
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

const iconMap: Record<string, string> = {
  Operativo: "#4ade80",
  Mantenimiento: "#fbbf24",
  "Fuera de Servicio": "#f87171",
  Asignado: "#60a5fa",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar stats:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "auto" }}>

      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <StatsCard 
            title="Total Activos Fijos"   
            value={loading ? "..." : (stats?.activos?.total?.toString() || "0")}  
            icon="🏗️" 
            color="#f87171" 
            subtitle={`${stats?.activos?.mantenimiento || 0} en mantenimiento`} 
          />
          <StatsCard 
            title="Obras Activas"          
            value={loading ? "..." : (stats?.obras?.activas?.toString() || "0")}   
            icon="🏢" 
            color="#3b82f6" 
            subtitle={`${stats?.obras?.pendientes || 0} por iniciar`} 
          />
          <StatsCard 
            title="Solicitudes Pendientes" 
            value={loading ? "..." : (stats?.solicitudes?.pendientes?.toString() || "0")}   
            icon="📋" 
            color="#f59e0b" 
            subtitle={`${stats?.solicitudes?.urgentes || 0} urgentes`} 
          />
          <StatsCard 
            title="Suministros en Stock"   
            value={loading ? "..." : (stats?.suministros?.total?.toString() || "0")} 
            icon="📦" 
            color="#10b981" 
            subtitle={`${stats?.suministros?.bajoMinimo || 0} bajo mínimo`} 
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
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

          {/* Resumen por tipo/estado */}
          <div className="card">
            <h2 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "1.25rem" }}>Distribución de Activos</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {loading ? (
                <p>Cargando distribución...</p>
              ) : !stats?.estadosDistribucion || stats.estadosDistribucion.length === 0 ? (
                <p>Sin datos de distribución</p>
              ) : stats.estadosDistribucion.map(item => {
                const total = Number(stats.activos.total) || 1;
                const pct = (Number(item.count) / total) * 100;
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
                        background: iconMap[item.estado] || "var(--accent)", 
                        borderRadius: "3px" 
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
