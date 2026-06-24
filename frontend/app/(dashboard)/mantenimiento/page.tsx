"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Activo {
  id: number;
  nombre: string;
  codigo_inventario: string;
  estado: string;
  descripcion?: string;
  ubicacion?: string;
}

interface Mantenimiento {
  id: number;
  activo_id: number;
  tipo: string;
  descripcion: string;
  fecha: string; // Fecha de inicio
  fecha_fin: string | null;
  responsable: string;
  estado_mantenimiento: string; // 'En curso' o 'Completado'
}

const TIPOS   = ["Preventivo", "Correctivo", "Falla", "Inspección"] as const;

const estadoBadge: Record<string, string> = {
  "Disponible":    "badge-green",
  "Asignado":      "badge-blue",
  "Mantenimiento": "badge-yellow",
};

const tipoBadge: Record<string, string> = {
  "Preventivo":      "badge-blue",
  "Correctivo":      "badge-orange",
  "Falla":           "badge-red",
  "Inspección":      "badge-purple",
};

function formatFecha(fechaStr: string) {
  if (!fechaStr) return "-";
  const d = new Date(fechaStr);
  return d.toLocaleString("es-EC", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function MantenimientoPage() {
  const { token } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [activos, setActivos]         = useState<Activo[]>([]);
  const [selected, setSelected]       = useState<Activo | null>(null);
  const [historial, setHistorial]     = useState<Mantenimiento[]>([]);
  const [loadingActivos, setLoadingActivos] = useState(true);
  const [loadingHist, setLoadingHist]      = useState(false);
  const [busqueda, setBusqueda]       = useState("");

  // Modales
  const [modalIniciar, setModalIniciar]   = useState(false);
  const [modalFinalizar, setModalFinalizar] = useState(false);

  // Formularios
  const [formIniciar, setFormIniciar] = useState({
    tipo: "Preventivo",
    descripcion: "",
  });
  const [formFinalizar, setFormFinalizar] = useState({
    notas_finales: "",
  });
  const [saving, setSaving] = useState(false);

  // ── Fetch activos ─────────────────────────────────────────────────────────
  const fetchActivos = useCallback(async () => {
    setLoadingActivos(true);
    try {
      const res = await fetch(`${apiUrl}/api/activos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActivos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivos(false);
    }
  }, [token, apiUrl]);

  useEffect(() => { if (token) fetchActivos(); }, [token, fetchActivos]);

  // ── Fetch historial ───────────────────────────────────────────────────────
  const fetchHistorial = useCallback(async (activoId: number) => {
    setLoadingHist(true);
    setHistorial([]);
    try {
      const res = await fetch(`${apiUrl}/api/mantenimiento/${activoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHistorial(data.historial || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHist(false);
    }
  }, [token, apiUrl]);

  const seleccionarActivo = (a: Activo) => {
    setSelected(a);
    fetchHistorial(a.id);
  };

  // ── Iniciar Mantenimiento ──────────────────────────────────────────────────
  const handleIniciarMantenimiento = async () => {
    if (!selected || !formIniciar.descripcion.trim()) return;
    setSaving(true);
    try {
      const body = {
        activo_id: selected.id,
        tipo: formIniciar.tipo,
        descripcion: formIniciar.descripcion,
      };
      
      const res = await fetch(`${apiUrl}/api/mantenimiento/iniciar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updated = { ...selected, estado: "Mantenimiento" };
      setSelected(updated);
      setActivos(prev => prev.map(a => a.id === selected.id ? updated : a));

      fetchHistorial(selected.id);
      setModalIniciar(false);
      setFormIniciar({ tipo: "Preventivo", descripcion: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Finalizar Mantenimiento ────────────────────────────────────────────────
  const handleFinalizarMantenimiento = async () => {
    if (!selected) return;
    const mantenimientoEnCurso = historial.find(m => m.estado_mantenimiento === 'En curso');
    if (!mantenimientoEnCurso) return;

    setSaving(true);
    try {
      const body = {
        notas_finales: formFinalizar.notas_finales,
      };
      
      const res = await fetch(`${apiUrl}/api/mantenimiento/finalizar/${mantenimientoEnCurso.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updated = { ...selected, estado: "Disponible" };
      setSelected(updated);
      setActivos(prev => prev.map(a => a.id === selected.id ? updated : a));

      fetchHistorial(selected.id);
      setModalFinalizar(false);
      setFormFinalizar({ notas_finales: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Filtrar activos ───────────────────────────────────────────────────────
  const activosFiltrados = activos.filter(a =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.codigo_inventario.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

      {/* ── Panel Izquierdo: Lista de activos ─────────────────────────────── */}
      <aside style={{
        width: "320px", minWidth: "280px", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", background: "var(--bg-secondary)",
        overflow: "hidden",
      }}>
        {/* Header panel */}
        <div style={{ padding: "1.25rem 1.25rem 0.75rem", borderBottom: "1px solid var(--border)" }}>
          <h1 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            Mantenimiento
          </h1>
          <input
            placeholder="Buscar activo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ fontSize: "0.8rem", padding: "0.45rem 0.75rem" }}
          />
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
          {loadingActivos ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Cargando activos...
            </div>
          ) : activosFiltrados.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Sin resultados
            </div>
          ) : activosFiltrados.map(a => (
            <button
              key={a.id}
              onClick={() => seleccionarActivo(a)}
              style={{
                width: "100%", textAlign: "left", padding: "0.875rem",
                borderRadius: "0.5rem", border: "none", cursor: "pointer", marginBottom: "2px",
                background: selected?.id === a.id ? "rgba(var(--accent-rgb),0.1)" : "transparent",
                outline: selected?.id === a.id ? "1px solid var(--accent)" : "none",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.nombre}
                  </p>
                  <code style={{ fontSize: "0.7rem", color: "var(--accent)" }}>{a.codigo_inventario}</code>
                </div>
                <span className={`badge ${estadoBadge[a.estado] || "badge-gray"}`}
                  style={{ fontSize: "0.65rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {a.estado}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Panel Derecho: Detalle ─────────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!selected ? (
          // Estado vacío
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "0.95rem" }}>Selecciona un activo para ver su historial de mantenimiento</p>
          </div>
        ) : (
          <>
            {/* Header del activo seleccionado */}
            <div style={{
              padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: "1rem",
              background: "var(--bg-secondary)", flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {selected.nombre}
                  </h2>
                  <span className={`badge ${estadoBadge[selected.estado] || "badge-gray"}`}>
                    {selected.estado}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.35rem", flexWrap: "wrap" }}>
                  <code style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: "700" }}>
                    {selected.codigo_inventario}
                  </code>
                  {selected.ubicacion && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Ubicación: {selected.ubicacion}
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {selected.estado !== "Mantenimiento" ? (
                  <button
                    className="btn-primary btn-small"
                    onClick={() => setModalIniciar(true)}
                  >
                    Iniciar Mantenimiento
                  </button>
                ) : (
                  <button
                    className="btn-primary btn-small"
                    style={{ background: "#10b981" }}
                    onClick={() => setModalFinalizar(true)}
                  >
                    Finalizar Mantenimiento
                  </button>
                )}
              </div>
            </div>

            {/* Historial */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  Registros de Mantenimiento
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  {historial.length} registro{historial.length !== 1 ? "s" : ""}
                </span>
              </div>

              {loadingHist ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                  Cargando registros...
                </div>
              ) : historial.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "3rem", borderRadius: "0.75rem",
                  border: "1px dashed var(--border)", color: "var(--text-secondary)",
                }}>
                  <p style={{ fontSize: "0.9rem" }}>Sin registros aún. Usa <strong>Iniciar Mantenimiento</strong> para comenzar un registro.</p>
                </div>
              ) : (
                /* Timeline */
                <div style={{ position: "relative" }}>
                  {/* Línea vertical */}
                  <div style={{
                    position: "absolute", left: "20px", top: "0", bottom: "0",
                    width: "2px", background: "var(--border)", zIndex: 0,
                  }} />

                  {historial.map((item, idx) => (
                    <div key={item.id} style={{
                      display: "flex", gap: "1.25rem", marginBottom: idx < historial.length - 1 ? "1.25rem" : 0,
                      position: "relative", zIndex: 1,
                    }}>
                      {/* Ícono del timeline */}
                      <div style={{
                        width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
                        background: "var(--bg-secondary)", border: "2px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.85rem", fontWeight: "bold", zIndex: 2, color: "var(--text-primary)"
                      }}>
                        {item.estado_mantenimiento === 'En curso' ? '...' : '✓'}
                      </div>

                      {/* Tarjeta del evento */}
                      <div className="card" style={{ flex: 1, padding: "1rem 1.25rem", borderLeft: item.estado_mantenimiento === 'En curso' ? '4px solid #f59e0b' : '4px solid #10b981' }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span className={`badge ${tipoBadge[item.tipo] || "badge-gray"}`} style={{ fontSize: "0.7rem" }}>
                              {item.tipo}
                            </span>
                            <span className={`badge ${item.estado_mantenimiento === 'En curso' ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: "0.7rem" }}>
                              {item.estado_mantenimiento}
                            </span>
                          </div>
                        </div>

                        <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                          {item.descripcion}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.75rem", color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "0.5rem" }}>
                          <div style={{ display: "flex", gap: "1rem" }}>
                            <strong>Inicio:</strong> {formatFecha(item.fecha)}
                          </div>
                          <div style={{ display: "flex", gap: "1rem" }}>
                            <strong>Fin:</strong> {item.fecha_fin ? formatFecha(item.fecha_fin) : "Pendiente"}
                          </div>
                          <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem", borderTop: "1px solid var(--border)", paddingTop: "0.25rem" }}>
                            <strong>Responsable:</strong> {item.responsable}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Modal: Iniciar Mantenimiento ───────────────────────────────────────────── */}
      {modalIniciar && selected && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalIniciar(false); }}>
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                Iniciar Registro de Mantenimiento
              </h2>
              <button className="modal-close" onClick={() => setModalIniciar(false)}>✕</button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Activo: <strong style={{ color: "var(--text-primary)" }}>{selected.nombre}</strong>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                  Tipo de Mantenimiento *
                </label>
                <select
                  value={formIniciar.tipo}
                  onChange={e => setFormIniciar(p => ({ ...p, tipo: e.target.value }))}
                >
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                  Descripción Inicial *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe el motivo del mantenimiento, falla o revisión..."
                  value={formIniciar.descripcion}
                  onChange={e => setFormIniciar(p => ({ ...p, descripcion: e.target.value }))}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button className="btn-secondary" onClick={() => setModalIniciar(false)}>Cancelar</button>
              <button
                className="btn-primary"
                onClick={handleIniciarMantenimiento}
                disabled={saving || !formIniciar.descripcion.trim()}
              >
                {saving ? "Iniciando..." : "Confirmar e Iniciar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Finalizar Mantenimiento ───────────────────────────────────────────── */}
      {modalFinalizar && selected && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalFinalizar(false); }}>
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                Finalizar Mantenimiento
              </h2>
              <button className="modal-close" onClick={() => setModalFinalizar(false)}>✕</button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Activo: <strong style={{ color: "var(--text-primary)" }}>{selected.nombre}</strong><br/>
              Al finalizar, el activo volverá a estar <strong>Disponible</strong>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                  Notas Finales de Mantenimiento (Opcional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Detalla qué se reparó, repuestos utilizados o conclusiones finales..."
                  value={formFinalizar.notas_finales}
                  onChange={e => setFormFinalizar(p => ({ ...p, notas_finales: e.target.value }))}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button className="btn-secondary" onClick={() => setModalFinalizar(false)}>Cancelar</button>
              <button
                className="btn-primary"
                style={{ background: "#10b981" }}
                onClick={handleFinalizarMantenimiento}
                disabled={saving}
              >
                {saving ? "Finalizando..." : "Completar Mantenimiento"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
