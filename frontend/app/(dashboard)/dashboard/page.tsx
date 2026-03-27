"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/app/components/StatsCard";

interface Stats {
  activos: { total: number; mantenimiento: number };
  obras: { activas: number; pendientes: number };
  solicitudes: { pendientes: number; urgentes: number };
  suministros: { total: number; bajoMinimo: number };
}

const actividadReciente = [
  { id: 1, tipo: "Asignación", descripcion: "Excavadora CAT 320 → Obra Los Andes", fecha: "15/03/2026", estado: "activo" },
  { id: 2, tipo: "Solicitud",  descripcion: "50 bolsas cemento para Obra Norte",   fecha: "14/03/2026", estado: "pendiente" },
  { id: 3, tipo: "Movimiento", descripcion: "Salida: 20 varillas de acero",         fecha: "14/03/2026", estado: "completado" },
  { id: 4, tipo: "Asignación", descripcion: "Grúa Torre → Obra Edificio Central",  fecha: "13/03/2026", estado: "activo" },
  { id: 5, tipo: "Solicitud",  descripcion: "30 planchas OSB para Obra Sur",        fecha: "12/03/2026", estado: "aprobado" },
];

const badgeMap: Record<string, string> = {
  activo:     "badge badge-green",
  pendiente:  "badge badge-yellow",
  completado: "badge badge-blue",
  aprobado:   "badge badge-green",
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
                {actividadReciente.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{item.tipo}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.descripcion}</td>
                    <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap", fontSize: "0.8rem" }}>{item.fecha}</td>
                    <td><span className={badgeMap[item.estado]}>{item.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen por categoría */}
          <div className="card">
            <h2 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "1.25rem" }}>Activos por Estado</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {[
                { label: "Operativo",      count: 18, pct: 75, color: "#4ade80" },
                { label: "En Mantenimiento", count: 3,  pct: 12, color: "#fbbf24" },
                { label: "Fuera de Servicio", count: 2, pct: 8,  color: "#f87171" },
                { label: "Asignado",        count: 1,  pct: 5,  color: "#60a5fa" },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                    <span style={{ color: "var(--text-primary)" }}>{item.label}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{item.count} activos</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: "3px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
