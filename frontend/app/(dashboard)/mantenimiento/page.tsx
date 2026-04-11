"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface PredictionResult {
  assetId: number;
  assetName: string;
  metrics: {
    ageInDays: number;
    usageDays: number;
    intensity: number;
    correctiveCount: number;
    totalMaintenances: number;
  };
  prediction: {
    prediction: number;
    probability: number;
  };
  status: string;
}

interface Activo {
  id: number;
  nombre: string;
  codigo_inventario: string;
}

export default function MantenimientoPage() {
  const { token } = useAuth();
  const [activos, setActivos] = useState<Activo[]>([]);
  const [predictions, setPredictions] = useState<Record<number, PredictionResult>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivos = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const aiUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:4001';
      
      const res = await fetch(`${apiUrl}/api/activos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error API Activos: ${res.status}`);

      const data = await res.json();
      setActivos(data);
      
      const predPromises = data.map((a: Activo) => 
        fetch(`${aiUrl}/ai/predict/${a.id}`)
          .then(async r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .catch(() => null)
      );
      
      const predResults = await Promise.all(predPromises);
      const predMap: Record<number, PredictionResult> = {};
      predResults.forEach((p, i) => {
        if (p) predMap[data[i].id] = p;
      });
      
      setPredictions(predMap);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchActivos();
  }, [token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", overflow: "auto" }}>
        <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>Monitoreo Predictivo Automático</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Análisis de salud basado en historial operativo y mantenimientos previos</p>
          </div>
          <button 
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            onClick={() => fetchActivos()}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            {loading ? "Analizando..." : "Actualizar Diagnóstico"}
          </button>
        </div>

        {error && (
          <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #f87171", borderRadius: "0.5rem", color: "#f87171" }}>
            <p><strong>Error de Conexión:</strong> {error}</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
          {loading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem" }}>
              <div className="flex-center" style={{ gap: "1rem" }}>
                <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
                <span style={{ color: "var(--text-secondary)" }}>Procesando historial de activos...</span>
              </div>
            </div>
          ) : !error && activos.length === 0 ? (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>No hay activos registrados para analizar.</p>
          ) : !error && activos.map(activo => {
            const pred = predictions[activo.id];
            const isCritical = pred?.prediction.prediction === 1;
            const healthBadge = isCritical ? "badge-red" : "badge-green";
            const healthLabel = pred?.status || "Analizando...";
            const probability = (pred?.prediction.probability || 0) * 100;
            
            return (
              <div key={activo.id} className="card card-feature" style={{ padding: "1.5rem", borderLeft: `6px solid ${isCritical ? '#f87171' : '#10b981'}` }}>
                <div className="flex-between" style={{ marginBottom: "1.25rem" }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {activo.nombre}
                    </h3>
                    <code style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: "700" }}>{activo.codigo_inventario}</code>
                  </div>
                  <span className={`badge ${healthBadge}`} style={{ padding: "0.5rem 0.75rem" }}>
                    {healthLabel}
                  </span>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <div className="flex-between" style={{ fontSize: "0.8rem", marginBottom: "0.6rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.025em" }}>Probabilidad de Falla</span>
                    <span style={{ color: isCritical ? "#f87171" : "var(--text-primary)", fontWeight: "900", fontFamily: "var(--font-mono)", fontSize: "1rem" }}>
                      {probability.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "var(--bg-primary)", borderRadius: "4px", overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }}>
                    <div 
                      style={{ 
                        width: `${probability}%`, 
                        height: "100%", 
                        background: isCritical ? "linear-gradient(90deg, #f87171, #ef4444)" : "linear-gradient(90deg, #34d399, #10b981)",
                        transition: "width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)" 
                      }} 
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ background: "var(--bg-primary)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: "900", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Uso Operativo</p>
                    <p style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>{pred?.metrics.usageDays || 0} <span style={{ fontSize: "0.7rem", fontWeight: "500", color: "var(--text-secondary)" }}>días</span></p>
                  </div>
                  <div style={{ background: "var(--bg-primary)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: "900", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Mantenimientos</p>
                    <p style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>{pred?.metrics.totalMaintenances || 0} <span style={{ fontSize: "0.7rem", fontWeight: "500", color: "var(--text-secondary)" }}>docs</span></p>
                  </div>
                  <div style={{ gridColumn: "1 / -1", background: "rgba(var(--accent-rgb), 0.05)", padding: "1rem", borderRadius: "0.75rem", border: "1px dashed var(--accent)" }}>
                    <div className="flex-between">
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>Fallas Correctivas:</span>
                      <span style={{ fontSize: "0.85rem", color: (pred?.metrics.correctiveCount || 0) > 0 ? "var(--red)" : "var(--text-primary)", fontWeight: "800" }}>{pred?.metrics.correctiveCount || 0} eventos</span>
                    </div>
                    <div className="flex-between" style={{ marginTop: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>Intensidad de Trabajo:</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: "800" }}>{((pred?.metrics.intensity || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
