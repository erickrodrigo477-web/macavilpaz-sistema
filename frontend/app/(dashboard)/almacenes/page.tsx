"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface Almacen {
  id: number;
  nombre: string;
  ubicacion: string;
  fecha_creacion: string;
}

interface ItemInventario {
  nombre: string;
  unidad: string;
  stock: number;
}

interface ActivoFijo {
  id: number;
  nombre: string;
  codigo_inventario: string;
  estado: string;
  ubicacion: string;
  valor_actual: number;
}

const estadoActivoBadge: Record<string, string> = {
  "Disponible": "badge-green",
  "En Uso": "badge-blue",
  "En Mantenimiento": "badge-yellow",
  "Dado de Baja": "badge-red",
};

export default function AlmacenesPage() {
  const { token } = useAuth();
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [selectedAlmacen, setSelectedAlmacen] = useState<Almacen | null>(null);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [activos, setActivos] = useState<ActivoFijo[]>([]);
  const [activeTab, setActiveTab] = useState<"suministros" | "activos">("suministros");
  const [loading, setLoading] = useState(true);
  const [invLoading, setInvLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Almacen | null>(null);
  const [formData, setFormData] = useState({ nombre: "", ubicacion: "" });

  const fetchAlmacenes = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/almacenes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setAlmacenes(data);
      if (data.length > 0 && !selectedAlmacen) {
        setSelectedAlmacen(data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching almacenes:", error);
      setLoading(false);
    }
  };

  const fetchInventario = async (id: number) => {
    setInvLoading(true);
    try {
      const [invRes, activosRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/almacenes/${id}/inventario`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/almacenes/${id}/activos`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
      ]);
      const [invData, activosData] = await Promise.all([invRes.json(), activosRes.json()]);
      setInventario(Array.isArray(invData) ? invData : []);
      setActivos(Array.isArray(activosData) ? activosData : []);
    } catch (error) {
      console.error("Error fetching inventario:", error);
    } finally {
      setInvLoading(false);
    }
  };

  useEffect(() => {
    fetchAlmacenes();
  }, [token]);

  useEffect(() => {
    if (selectedAlmacen) {
      fetchInventario(selectedAlmacen.id);
      setActiveTab("suministros");
    }
  }, [selectedAlmacen]);

  const handleOpenModal = (almacen: Almacen | null = null) => {
    if (almacen) {
      setEditando(almacen);
      setFormData({ nombre: almacen.nombre, ubicacion: almacen.ubicacion });
    } else {
      setEditando(null);
      setFormData({ nombre: "", ubicacion: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editando
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/almacenes/${editando.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/almacenes`;
    const method = editando ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setEditando(null);
        const data = await res.json();
        if (editando && selectedAlmacen?.id === editando.id) {
          setSelectedAlmacen(data);
        }
        setFormData({ nombre: "", ubicacion: "" });
        fetchAlmacenes();
      }
    } catch (error) {
      console.error("Error saving almacen:", error);
    }
  };

  const tabStyle = (tab: "suministros" | "activos"): React.CSSProperties => ({
    padding: "0.6rem 1.25rem",
    fontSize: "0.9rem",
    fontWeight: activeTab === tab ? "700" : "500",
    color: activeTab === tab ? "var(--accent)" : "var(--text-secondary)",
    background: "transparent",
    border: "none",
    borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s",
    borderRadius: 0,
  });

  return (
    <div style={{ padding: "1.5rem", display: "flex", flex: 1, gap: "1.5rem" }}>
      {/* Sidebar de Almacenes */}
      <div className="card" style={{ width: "300px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "750" }}>Almacenes</h2>
          <button className="btn-primary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }} onClick={() => handleOpenModal(null)}>+</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
          {loading ? (
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Cargando almacenes...</div>
          ) : almacenes.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAlmacen(a)}
              style={{
                textAlign: "left",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: selectedAlmacen?.id === a.id ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: selectedAlmacen?.id === a.id ? "rgba(var(--accent-rgb), 0.05)" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ fontWeight: "600", color: selectedAlmacen?.id === a.id ? "var(--accent)" : "inherit" }}>{a.nombre}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{a.ubicacion}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Principal */}
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0, padding: 0, overflow: "hidden" }}>
        {selectedAlmacen ? (
          <>
            {/* Encabezado del Almacén */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>{selectedAlmacen.nombre}</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.15rem" }}>Ubicación: {selectedAlmacen.ubicacion}</p>
              </div>
              <button className="btn-secondary" style={{ padding: "0.4rem", borderRadius: "0.375rem" }} title="Editar Almacén" onClick={() => handleOpenModal(selectedAlmacen)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
            </div>

            {/* Pestañas de Navegación */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 1.5rem", gap: 0 }}>
              <button style={tabStyle("suministros")} onClick={() => setActiveTab("suministros")}>
                Suministros
                {inventario.length > 0 && (
                  <span style={{ marginLeft: "0.5rem", background: activeTab === "suministros" ? "var(--accent)" : "var(--border)", color: activeTab === "suministros" ? "#fff" : "var(--text-secondary)", borderRadius: "99px", padding: "0.05rem 0.5rem", fontSize: "0.75rem" }}>
                    {inventario.length}
                  </span>
                )}
              </button>
              <button style={tabStyle("activos")} onClick={() => setActiveTab("activos")}>
                Activos Fijos
                {activos.length > 0 && (
                  <span style={{ marginLeft: "0.5rem", background: activeTab === "activos" ? "var(--accent)" : "var(--border)", color: activeTab === "activos" ? "#fff" : "var(--text-secondary)", borderRadius: "99px", padding: "0.05rem 0.5rem", fontSize: "0.75rem" }}>
                    {activos.length}
                  </span>
                )}
              </button>
            </div>

            {/* Contenido de la Pestaña */}
            <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
              {invLoading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>Cargando...</div>
              ) : activeTab === "suministros" ? (
                inventario.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>No hay suministros registrados en este almacén.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Suministro</th>
                        <th>Unidad</th>
                        <th style={{ textAlign: "right" }}>Stock Disponible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventario.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: "600" }}>{item.nombre}</td>
                          <td style={{ color: "var(--text-secondary)" }}>{item.unidad}</td>
                          <td style={{ textAlign: "right", fontWeight: "700", color: item.stock > 0 ? "var(--text-primary)" : "var(--accent)" }}>
                            {item.stock}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                activos.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>No hay activos fijos asignados a este almacén.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nombre del Activo</th>
                        <th>Estado</th>
                        <th style={{ textAlign: "right" }}>Valor Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activos.map((activo) => (
                        <tr key={activo.id}>
                          <td style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontFamily: "monospace" }}>{activo.codigo_inventario || "-"}</td>
                          <td style={{ fontWeight: "600" }}>{activo.nombre}</td>
                          <td>
                            <span className={`badge ${estadoActivoBadge[activo.estado] || "badge-blue"}`}>
                              {activo.estado}
                            </span>
                          </td>
                          <td style={{ textAlign: "right", fontWeight: "700" }}>
                            {activo.valor_actual != null
                              ? `Bs. ${Number(activo.valor_actual).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
            Selecciona un almacén para ver su contenido
          </div>
        )}
      </div>

      {/* Modal Nuevo/Editar Almacén */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <form className="modal-content" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-header">
              <h3>{editando ? "Editar Almacén" : "Nuevo Almacén"}</h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.35rem" }}>Nombre del Almacén</label>
                <input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Almacén Secundario" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.35rem" }}>Ubicación</label>
                <input required value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} placeholder="Ej: Planta Baja, Pasillo 4" />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editando ? "Guardar Cambios" : "Crear Almacén"}</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
