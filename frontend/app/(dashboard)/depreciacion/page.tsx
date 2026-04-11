"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface ActivoDepreciacion {
  id: number;
  nombre: string;
  codigo_inventario: string;
  valor_inicial: number;
  valor_residual: number;
  vida_util: number;
  fecha_compra: string;
  anos_transcurridos: string;
  depreciacion_anual: string;
  depreciacion_acumulada_calculada: string;
  valor_actual_calculado: string;
}

export default function DepreciacionPage() {
  const { token, user } = useAuth();
  const [activos, setActivos] = useState<ActivoDepreciacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);

  const esContable = user?.rol === 'Administrador' || user?.rol === 'Contabilidad';

  const fetchDepreciaciones = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/depreciacion`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setActivos(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching depreciaciones:", error);
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!confirm("¿Estás seguro de sincronizar los valores calculados con la base de datos contable?")) return;
    
    setSyncing(true);
    setMensaje(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/depreciacion/sync`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (res.ok) {
        setMensaje({ texto: "Contabilidad sincronizada con éxito", tipo: 'exito' });
        fetchDepreciaciones();
      } else {
        setMensaje({ texto: "Error al sincronizar contabilidad", tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: "Error de red al sincronizar", tipo: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (token) fetchDepreciaciones();
  }, [token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflow: "hidden" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>Módulo de Depreciación</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Método de Línea Recta - Cálculo automático basado en fecha de compra</p>
          </div>
          
          {esContable && (
            <button 
              className="btn-primary" 
              onClick={handleSync} 
              disabled={syncing}
              style={{ background: "var(--green)", borderColor: "var(--green)" }}
            >
              {syncing ? "Sincronizando..." : "Sincronizar Contabilidad"}
            </button>
          )}
        </div>

        {mensaje && (
          <div style={{ 
            padding: "1rem", 
            borderRadius: "0.75rem", 
            background: mensaje.tipo === 'exito' ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: mensaje.tipo === 'exito' ? "var(--green)" : "var(--red)",
            border: `1px solid ${mensaje.tipo === 'exito' ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
            fontSize: "0.875rem",
            fontWeight: "600"
          }}>
            {mensaje.texto}
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ overflow: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Activo</th>
                  <th>Costo Inicial</th>
                  <th>Val. Residual</th>
                  <th>Vida Útil</th>
                  <th>Años Trans.</th>
                  <th>Depr. Anual</th>
                  <th>Acumulada</th>
                  <th>Valor Actual</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", padding: "2rem" }}>Cargando datos...</td></tr>
                ) : activos.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", padding: "2rem" }}>No hay activos registrados</td></tr>
                ) : activos.map(activo => (
                  <tr key={activo.id}>
                    <td>
                      <div style={{ fontWeight: "600" }}>{activo.nombre}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{activo.codigo_inventario}</div>
                    </td>
                    <td style={{ fontWeight: "500" }}>${(Number(activo.valor_inicial) || 0).toLocaleString()}</td>
                    <td style={{ color: "var(--text-secondary)" }}>${(Number(activo.valor_residual) || 0).toLocaleString()}</td>
                    <td style={{ textAlign: "center" }}>{activo.vida_util || 1}a</td>
                    <td style={{ fontWeight: "600", color: "var(--accent)" }}>{activo.anos_transcurridos || "0.00"}</td>
                    <td>${(Number(activo.depreciacion_anual) || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: "600", color: "var(--red)" }}>${(Number(activo.depreciacion_acumulada_calculada) || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: "700", color: "var(--green)", fontSize: "0.95rem" }}>
                      ${(Number(activo.valor_actual_calculado) || 0).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ width: "100%", height: "6px", background: "var(--bg-secondary)", borderRadius: "3px", marginTop: "4px" }}>
                        <div style={{ 
                          width: `${Math.min(100, (Number(activo.anos_transcurridos || 0) / (Number(activo.vida_util) || 1)) * 100)}%`, 
                          height: "100%", 
                          background: Number(activo.anos_transcurridos || 0) >= (Number(activo.vida_util) || 1) ? "var(--red)" : "var(--accent)", 
                          borderRadius: "3px" 
                        }}></div>
                      </div>
                      <div style={{ fontSize: "0.6rem", textAlign: "right", marginTop: "2px", color: "var(--text-secondary)" }}>
                        {Math.min(100, (Number(activo.anos_transcurridos || 0) / (Number(activo.vida_util) || 1)) * 100).toFixed(0)}% de vida agotada
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
