"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface Movimiento {
  id: number;
  tipo_movimiento: string;
  cantidad: number;
  fecha: string;
  suministro_nombre: string;
  unidad?: string;
  solicitud_id?: number | null;
  obra_nombre: string | null;
  usuario_nombre: string;
}

interface Item { id: number; nombre: string; }

export default function MovimientosPage() {
  const { user } = useAuth();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [tipoFiltro, setTipoFiltro] = useState("Todos los tipos");
  const [busqueda, setBusqueda] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movimientos`);
      const data = await res.json();
      setMovimientos(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtrados = movimientos.filter(m => {
    const coincideTipo = tipoFiltro === "Todos los tipos" || m.tipo_movimiento === tipoFiltro.toLowerCase();
    const coincideBusqueda = m.suministro_nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             (m.obra_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ?? false);
    return coincideTipo && coincideBusqueda;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "auto" }}>

      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
            <input 
              placeholder="Buscar por material u obra..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
            <svg style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          
          <select 
            style={{ maxWidth: "180px" }} 
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option>Todos los tipos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </select>
          
          <button className="btn-secondary" onClick={fetchData} style={{ padding: "0.5rem" }} title="Actualizar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "700" }}>Historial de Movimientos</h2>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{filtrados.length} registros encontrados</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Suministro</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Destino / Origen</th>
                <th>Usuario Responsable</th>
                <th>Fecha y Hora</th>
                <th>Origen Solicitud</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "4rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <div className="animate-spin" style={{ width: "30px", height: "30px", border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%" }}></div>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Cargando historial de movimientos...</span>
                  </div>
                </td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
                  No se encontraron movimientos registrados.
                </td></tr>
              ) : filtrados.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: "600" }}>{m.suministro_nombre}</td>
                  <td>
                    <span className={m.tipo_movimiento === "entrada" ? "badge badge-green" : "badge badge-red"} style={{ textTransform: "capitalize" }}>
                      {m.tipo_movimiento === "entrada" ? "▲ Entrada" : "▼ Salida"}
                    </span>
                  </td>
                  <td style={{ fontWeight: "800", fontSize: "1rem", color: m.tipo_movimiento === "entrada" ? "#10b981" : "#ef4444" }}>
                    {m.tipo_movimiento === "entrada" ? "+" : "-"}{m.cantidad} <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>{m.unidad}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {m.obra_nombre ?? "Almacén Central"}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold" }}>
                        {m.usuario_nombre[0]}
                      </div>
                      {m.usuario_nombre}
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    {m.fecha ? new Date(m.fecha).toLocaleString('es-ES', { 
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    }) : "-"}
                  </td>
                  <td>
                    {m.solicitud_id ? (
                      <span className="badge badge-gray" style={{ fontSize: "0.75rem", fontFamily: "monospace", padding: "0.2rem 0.5rem" }}>
                        SOL-{String(m.solicitud_id).padStart(3, "0")}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
