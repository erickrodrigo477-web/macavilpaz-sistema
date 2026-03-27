"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface Obra {
  id: number;
  nombre: string;
  ubicacion: string;
  fecha_inicio: string;
  fecha_fin: string;
  supervisor_id: number | null;
  supervisor_nombre: string | null;
}

interface Usuario {
  id: number;
  nombre: string;
  rol: string;
}

function estadoObra(fechaFin: string) {
  const fin = new Date(fechaFin);
  const hoy = new Date();
  if (fin < hoy) return { cls: "badge badge-gray",   label: "Finalizada" };
  const diff = (fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 90) return { cls: "badge badge-yellow", label: "Por Finalizar" };
  return { cls: "badge badge-green", label: "En Progreso" };
}

export default function ObrasPage() {
  const { user } = useAuth();
  const [obras, setObras] = useState<Obra[]>([]);
  const [supervisores, setSupervisores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [detallesModalAbierto, setDetallesModalAbierto] = useState(false);
  const [detalles, setDetalles] = useState<{ activos: any[], suministros: any[] }>({ activos: [], suministros: [] });
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    supervisor_id: ""
  });

  const fetchData = async () => {
    try {
      const [obrasRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obras`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`)
      ]);
      const obrasData = await obrasRes.json();
      const usersData = await usersRes.json();
      
      setObras(obrasData);
      setSupervisores(usersData.filter((u: Usuario) => u.rol === "Supervisor de Obra"));
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerDetalles = async (id: number) => {
    setLoadingDetalles(true);
    setDetallesModalAbierto(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obras/${id}/detalles`);
      const data = await res.json();
      setDetalles(data);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const handleOpenModal = (obra?: Obra) => {
    if (obra) {
      setEditando(obra.id);
      setFormData({
        nombre: obra.nombre,
        ubicacion: obra.ubicacion,
        fecha_inicio: obra.fecha_inicio ? new Date(obra.fecha_inicio).toISOString().split("T")[0] : "",
        fecha_fin: obra.fecha_fin ? new Date(obra.fecha_fin).toISOString().split("T")[0] : "",
        supervisor_id: obra.supervisor_id ? String(obra.supervisor_id) : ""
      });
    } else {
      setEditando(null);
      setFormData({
        nombre: "",
        ubicacion: "",
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: "",
        supervisor_id: ""
      });
    }
    setModalAbierto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editando 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/obras/${editando}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/obras`;
    
    const method = editando ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          supervisor_id: formData.supervisor_id ? parseInt(formData.supervisor_id) : null
        }),
      });
      if (res.ok) {
        setModalAbierto(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta obra?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obras/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.mensaje || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "auto" }}>
      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "750" }}>Gestión de Obras</h1>
          {user?.rol === "Administrador" && (
            <button className="btn-primary" onClick={() => handleOpenModal()}>+ Nueva Obra</button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {loading ? (
            <p style={{ textAlign: "center", gridColumn: "1/-1", padding: "3rem" }}>Cargando proyectos...</p>
          ) : obras.length === 0 ? (
            <p style={{ textAlign: "center", gridColumn: "1/-1", padding: "3rem", color: "var(--text-secondary)" }}>No hay obras registradas.</p>
          ) : obras.map(obra => {
            const estado = estadoObra(obra.fecha_fin);
            return (
              <div key={obra.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: estado.cls.includes("green") ? "var(--accent)" : estado.cls.includes("yellow") ? "#eab308" : "#94a3b8" }}></div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "750", lineHeight: 1.3, flex: 1, marginRight: "1rem" }}>
                    {obra.nombre}
                  </h3>
                  <span className={estado.cls} style={{ whiteSpace: "nowrap" }}>{estado.label}</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    <span style={{ fontSize: "1rem" }}>📍</span>
                    <span>{obra.ubicacion}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: "550" }}>
                    <span style={{ fontSize: "1rem" }}>👤</span>
                    <span>Supervisor: {obra.supervisor_nombre || "No asignado"}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "0.75rem", background: "var(--bg-primary)", borderRadius: "0.5rem", marginTop: "0.25rem" }}>
                  <div>
                    <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.65rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "2px" }}>Inicio</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "0.85rem" }}>{obra.fecha_inicio ? new Date(obra.fecha_inicio).toLocaleDateString() : "-"}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.65rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "2px" }}>Fin Estimado</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "0.85rem" }}>{obra.fecha_fin ? new Date(obra.fecha_fin).toLocaleDateString() : "-"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.5rem" }}>
                  <button className="btn-secondary btn-small" style={{ flex: 1 }} onClick={() => handleVerDetalles(obra.id)}>Ver Detalles</button>
                  {user?.rol === "Administrador" && (
                    <>
                      <button className="btn-secondary btn-small" style={{ flex: 1 }} onClick={() => handleOpenModal(obra)}>Editar</button>
                      <button 
                        className="btn-danger btn-small"
                        style={{ flex: 1 }}
                        onClick={() => handleDelete(obra.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal Nueva/Editar Obra */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <form className="modal-content" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2 style={{ fontSize: "1.15rem", fontWeight: "750" }}>{editando ? "Editar Obra" : "Nueva Obra"}</h2>
              <button type="button" className="modal-close" onClick={() => setModalAbierto(false)}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.45rem" }}>Nombre del Proyecto</label>
                <input required placeholder="Ej: Edificio Los Pinos" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.45rem" }}>Ubicación</label>
                <input required placeholder="Ej: Zona Sur, Calle 15" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.45rem" }}>Supervisor Responsable</label>
                <select value={formData.supervisor_id} onChange={e => setFormData({...formData, supervisor_id: e.target.value})}>
                  <option value="">Seleccionar supervisor...</option>
                  {supervisores.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.45rem" }}>Fecha Inicio</label>
                  <input type="date" required value={formData.fecha_inicio} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.45rem" }}>Fecha Fin Est.</label>
                  <input type="date" required value={formData.fecha_fin} onChange={e => setFormData({...formData, fecha_fin: e.target.value})} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editando ? "Guardar Cambios" : "Crear Proyecto"}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal Detalles de la Obra */}
      {detallesModalAbierto && (
        <div className="modal-overlay" onClick={() => setDetallesModalAbierto(false)}>
          <div className="modal-content" style={{ maxWidth: "850px", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 0 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800" }}>Detalles de la Obra</h2>
              <button className="modal-close" onClick={() => setDetallesModalAbierto(false)}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              {loadingDetalles ? (
                <p style={{ textAlign: "center", padding: "3rem" }}>Cargando información detallada...</p>
              ) : (
                <>
                  {/* Seccion Activos */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                      <span style={{ padding: "0.5rem", background: "var(--bg-primary)", borderRadius: "0.5rem", fontSize: "1.25rem" }}>🏗️</span>
                      <h3 style={{ fontSize: "1rem", fontWeight: "750" }}>Activos Fijos Asignados</h3>
                    </div>
                    {detalles.activos.length === 0 ? (
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", padding: "1rem", background: "var(--bg-primary)", borderRadius: "0.5rem", textAlign: "center" }}>No hay activos asignados a esta obra.</p>
                    ) : (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Activo</th>
                              <th>Código</th>
                              <th>Estado</th>
                              <th>Fecha Asig.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detalles.activos.map(a => (
                              <tr key={a.id}>
                                <td style={{ fontWeight: "600" }}>{a.activo_nombre}</td>
                                <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{a.codigo_inventario}</td>
                                <td><span className="badge badge-blue">{a.estado}</span></td>
                                <td style={{ fontSize: "0.85rem" }}>{new Date(a.fecha_asignacion).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Seccion Suministros */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                      <span style={{ padding: "0.5rem", background: "var(--bg-primary)", borderRadius: "0.5rem", fontSize: "1.25rem" }}>📦</span>
                      <h3 style={{ fontSize: "1rem", fontWeight: "750" }}>Suministros Consumidos</h3>
                    </div>
                    {detalles.suministros.length === 0 ? (
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", padding: "1rem", background: "var(--bg-primary)", borderRadius: "0.5rem", textAlign: "center" }}>No se han registrado entregas de suministros para esta obra.</p>
                    ) : (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Material</th>
                              <th>Cantidad</th>
                              <th>Unidad</th>
                              <th>Fecha Entrega</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detalles.suministros.map(s => (
                              <tr key={s.id}>
                                <td style={{ fontWeight: "600" }}>{s.suministro_nombre}</td>
                                <td style={{ fontWeight: "bold", color: "var(--accent)" }}>{s.cantidad}</td>
                                <td>{s.unidad}</td>
                                <td style={{ fontSize: "0.85rem" }}>{new Date(s.fecha).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: "1.25rem 2rem", borderTop: "1px solid var(--border-color)", background: "var(--bg-primary)", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={() => setDetallesModalAbierto(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
