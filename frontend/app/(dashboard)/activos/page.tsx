"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import ConfirmModal from "@/app/components/ConfirmModal";

interface Activo {
  id: number;
  nombre: string;
  codigo_inventario: string;
  estado: string;
  fecha_compra: string;
  descripcion: string;
  ubicacion?: string;
  valor_inicial?: number;
  valor_actual?: number;
  depreciacion_acumulada?: number;
  valor_residual?: number;
  vida_util?: number;
}

const estadoBadge: Record<string, string> = {
  "Disponible":    "badge badge-green shadow-sm shadow-green-500/10",
  "Mantenimiento": "badge badge-yellow",
  "Asignado":      "badge badge-blue",
};

export default function ActivosPage() {
  const { user, token } = useAuth();
  const esAdmin = user?.rol === "Administrador";
  const esAlmacen = user?.rol === "Almacén" || user?.rol === "Almacen";
  const esContabilidad = user?.rol === "Contabilidad";
  const puedeEditarFisico = esAdmin || esAlmacen;
  const puedeEditarFinanciero = esAdmin || esContabilidad;

  const [activos, setActivos] = useState<Activo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  // Modal para ver descripción larga
  const [descModalOpen, setDescModalOpen] = useState(false);
  const [descModalContent, setDescModalContent] = useState("");
  const [descModalTitle, setDescModalTitle] = useState("");

  const abrirDescModal = (activo: Activo) => {
    setDescModalTitle(activo.nombre);
    setDescModalContent(activo.descripcion || "Sin descripción");
    setDescModalOpen(true);
  };

  // Historial de ocupación
  const [historialModalOpen, setHistorialModalOpen] = useState(false);
  const [activoSeleccionadoHist, setActivoSeleccionadoHist] = useState<Activo | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [historialLoading, setHistorialLoading] = useState(false);

  // Nueva Solicitud
  const [obras, setObras] = useState<any[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [solicitudModalOpen, setSolicitudModalOpen] = useState(false);
  const [solicitudForm, setSolicitudForm] = useState({
    activo_id: "",
    obra_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    comentario: ""
  });
  const [activoSchedule, setActivoSchedule] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({
    visible: false, message: "", type: "success"
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
  };
  
  // Formulario para activo
  const initialForm = {
    nombre: "",
    codigo_inventario: "",
    descripcion: "",
    fecha_compra: new Date().toISOString().split("T")[0],
    estado: "Disponible",
    ubicacion: "",
    valor_inicial: 0,
    valor_actual: 0,
    depreciacion_acumulada: 0,
    valor_residual: 0,
    vida_util: 5
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchActivos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setActivos(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar activos:", error);
      setLoading(false);
    }
  };

  const fetchObras = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obras`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setObras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching obras:", error);
    }
  };

  const fetchAlmacenes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/almacenes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setAlmacenes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching almacenes:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchActivos();
      fetchObras();
      fetchAlmacenes();
    }
  }, [token]);

  const abrirModal = (activo?: Activo) => {
    if (activo) {
      setEditandoId(activo.id);
      setFormData({
        nombre: activo.nombre,
        codigo_inventario: activo.codigo_inventario,
        descripcion: activo.descripcion || "",
        fecha_compra: activo.fecha_compra ? activo.fecha_compra.split("T")[0] : new Date().toISOString().split("T")[0],
        estado: activo.estado,
        ubicacion: activo.ubicacion || "",
        valor_inicial: activo.valor_inicial || 0,
        valor_actual: activo.valor_actual || 0,
        depreciacion_acumulada: activo.depreciacion_acumulada || 0,
        valor_residual: activo.valor_residual || 0,
        vida_util: activo.vida_util || 5
      });
    } else {
      setEditandoId(null);
      setFormData(initialForm);
    }
    setModalAbierto(true);
  };

  const abrirHistorial = async (activo: Activo) => {
    setActivoSeleccionadoHist(activo);
    setHistorialModalOpen(true);
    setHistorialLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes/${activo.id}/schedule`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistorial(data);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setHistorialLoading(false);
    }
  };

  const abrirSolicitud = (activo: Activo) => {
    setSolicitudForm({
      activo_id: activo.id.toString(),
      obra_id: "",
      fecha_inicio: "",
      fecha_fin: "",
      comentario: ""
    });
    setOverlapError(null);
    setSolicitudModalOpen(true);
  };

  // Cronograma cuando cambia activo_id en el form
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!solicitudForm.activo_id || !token) {
        setActivoSchedule([]);
        return;
      }
      setScheduleLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes/${solicitudForm.activo_id}/schedule`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setActivoSchedule(data);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setScheduleLoading(false);
      }
    };
    fetchSchedule();
  }, [solicitudForm.activo_id, token]);

  // Validar solapamiento
  useEffect(() => {
    if (!solicitudForm.fecha_inicio || !solicitudForm.fecha_fin || activoSchedule.length === 0) {
      setOverlapError(null);
      return;
    }

    const start = new Date(solicitudForm.fecha_inicio);
    const end = new Date(solicitudForm.fecha_fin);

    const hasOverlap = activoSchedule.some(entry => {
      const entryStart = new Date(entry.fecha_inicio);
      const entryEnd = new Date(entry.fecha_fin);
      return (
        (start <= entryStart && end >= entryStart) ||
        (start <= entryEnd && end >= entryEnd) ||
        (entryStart <= start && entryEnd >= start)
      );
    });

    setOverlapError(hasOverlap ? "Las fechas seleccionadas se cruzan con una reserva existente." : null);
  }, [solicitudForm.fecha_inicio, solicitudForm.fecha_fin, activoSchedule]);

  const handleSolicitudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(solicitudForm),
      });
      if (res.ok) {
        setSolicitudModalOpen(false);
        setSolicitudForm({ activo_id: "", obra_id: "", fecha_inicio: "", fecha_fin: "", comentario: "" });
        showToast("Solicitud enviada con éxito.", "success");
      } else {
        const errorData = await res.json();
        showToast(errorData.mensaje || "Error al crear solicitud.", "error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editandoId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/activos/${editandoId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/activos`;
      
      const res = await fetch(url, {
        method: editandoId ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalAbierto(false);
        setEditandoId(null);
        setFormData(initialForm);
        fetchActivos();
      }
    } catch (error) {
      console.error("Error al procesar activo:", error);
    }
  };

  const filtrados = activos.filter(a => {
    const coincideBusqueda = (a.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
                              (a.codigo_inventario || "").toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = filtro === "todos" || a.estado === filtro;
    return coincideBusqueda && coincideFiltro;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflow: "hidden" }}>
        {/* Controles */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ maxWidth: "280px" }}
          />
          <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ maxWidth: "180px" }}>
            <option value="todos">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Asignado">Asignado</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
          {puedeEditarFisico && (
            <button className="btn-primary" style={{ marginLeft: "auto" }} onClick={() => abrirModal()}>
              + Nuevo Activo
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              {loading ? "Cargando..." : `${filtrados.length} activos encontrados`}
            </span>
          </div>
          <div style={{ overflow: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Ubicación</th>
                  {puedeEditarFinanciero && <th>Vida Útil Consumida</th>}
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filtrados.map(activo => (
                  <tr key={activo.id}>
                    <td><code style={{ fontSize: "0.8rem", color: "var(--accent)" }}>{activo.codigo_inventario}</code></td>
                    <td style={{ fontWeight: "500" }}>{activo.nombre}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem", maxWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{activo.descripcion || "-"}</span>
                        {activo.descripcion && (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: "0.15rem 0.4rem", fontSize: "0.65rem", minWidth: "max-content" }}
                            onClick={() => abrirDescModal(activo)}
                            title="Ver descripción completa"
                          >
                            Ver
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{activo.ubicacion || "-"}</td>
                    {puedeEditarFinanciero && (
                      <td style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                        {activo.valor_inicial ? (() => {
                          const fechaCompra = new Date(activo.fecha_compra || new Date());
                          const hoy = new Date();
                          const meses = (hoy.getFullYear() - fechaCompra.getFullYear()) * 12 + (hoy.getMonth() - fechaCompra.getMonth());
                          const anos = meses / 12;
                          const vidaUtil = Number(activo.vida_util) || 1;
                          const percent = Math.max(0, Math.min(100, (anos / vidaUtil) * 100));
                          return (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div style={{ width: "60px", height: "6px", background: "var(--bg-secondary)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ width: `${percent}%`, height: "100%", background: percent >= 100 ? "var(--red)" : "var(--accent)" }}></div>
                              </div>
                              <span style={{ fontSize: "0.75rem", color: percent >= 100 ? "var(--red)" : "var(--accent)" }}>{percent.toFixed(1)}%</span>
                            </div>
                          );
                        })() : (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>Sin valores</span>
                        )}
                      </td>
                    )}
                    <td>
                      <span className={estadoBadge[activo.estado] || "badge badge-gray"}>
                        {activo.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem", border: "1px solid var(--accent)", color: "var(--accent)" }}
                          onClick={() => abrirHistorial(activo)}
                          title="Ver Cronograma de Ocupación"
                        >
                          Historial
                        </button>

                        {/* Botón Solicitar para Técnicos y Supervisores */}
                        {((user?.rol || "").toLowerCase().includes('técnico') || (user?.rol || "").toLowerCase().includes('supervisor')) && activo.estado !== 'Mantenimiento' && (
                          <button 
                            className="btn-primary" 
                            style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem" }}
                            onClick={() => abrirSolicitud(activo)}
                          >
                            Solicitar
                          </button>
                        )}

                        {(puedeEditarFisico || puedeEditarFinanciero) ? (
                          <>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem" }}
                              onClick={() => abrirModal(activo)}
                            >
                              Editar
                            </button>
                            {puedeEditarFisico && (
                              <button 
                                onClick={() => {
                                  setIdAEliminar(activo.id);
                                  setDeleteModalOpen(true);
                                }}
                                style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem", background: "#7f1d1d33", color: "#f87171", border: "1px solid #7f1d1d55", borderRadius: "0.375rem", cursor: "pointer" }}
                              >
                                Eliminar
                              </button>
                            )}
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <form className="modal-content max-w-2xl" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2 className="text-xl font-extrabold text-primary">
                {editandoId ? "Editar Activo Fijo" : "Nuevo Activo Fijo"}
              </h2>
              <button 
                type="button" 
                onClick={() => setModalAbierto(false)}
                className="modal-close"
              >
                &times;
              </button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {/* Sección Física (Almacén) */}
              <div style={{ gridColumn: "span 2", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--accent)" }}>Información de Inventario (Almacén)</h3>
              </div>
              
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Nombre</label>
                <input 
                  required
                  disabled={!puedeEditarFisico}
                  placeholder="Ej: Excavadora CAT 320" 
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Código de Inventario</label>
                <input 
                  required
                  disabled={!puedeEditarFisico}
                  placeholder="Ej: ACT-009" 
                  value={formData.codigo_inventario}
                  onChange={e => setFormData({...formData, codigo_inventario: e.target.value})}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Ubicación</label>
                <select 
                  required
                  disabled={!puedeEditarFisico}
                  value={formData.ubicacion}
                  onChange={e => setFormData({...formData, ubicacion: e.target.value})}
                  style={{ width: "100%" }}
                >
                  <option value="">Seleccionar almacén...</option>
                  {almacenes.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Descripción</label>
                <textarea 
                  disabled={!puedeEditarFisico}
                  placeholder="Descripción detallada del activo..." 
                  style={{ resize: "vertical", minHeight: "60px", width: "100%" }} 
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Fecha de Compra</label>
                <input 
                  type="date" 
                  disabled={!puedeEditarFisico}
                  value={formData.fecha_compra}
                  onChange={e => setFormData({...formData, fecha_compra: e.target.value})}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Estado</label>
                <select 
                  disabled={!puedeEditarFisico}
                  value={formData.estado}
                  onChange={e => setFormData({...formData, estado: e.target.value})}
                  style={{ width: "100%" }}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Asignado">Asignado</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>


              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", gridColumn: "span 2" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: "0.85rem" }} onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: "0.85rem" }}>
                  {editandoId ? "Actualizar Activo" : "Guardar Activo"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal Nueva Solicitud from Activos */}
      {solicitudModalOpen && (
        <div className="modal-overlay" onClick={() => { setSolicitudModalOpen(false); setOverlapError(null); }}>
          <div className="modal-content max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="text-xl font-bold text-primary">Solicitud de Equipo</h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  Equipo: <span style={{ color: "var(--accent)", fontWeight: "600" }}>{activos.find(a => a.id.toString() === solicitudForm.activo_id)?.nombre}</span>
                </p>
              </div>
              <button className="modal-close" onClick={() => { setSolicitudModalOpen(false); setOverlapError(null); }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSolicitudSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}>
              {/* UBICACIÓN DE DESTINO */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}>REGISTRAR EN OBRA / PROYECTO</label>
                <select required value={solicitudForm.obra_id} onChange={e => setSolicitudForm({...solicitudForm, obra_id: e.target.value})}>
                  <option value="">Seleccionar destino...</option>
                  {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                </select>
              </div>

              {/* DISPONIBILIDAD */}
              <div className="card" style={{ padding: "1.25rem", background: "var(--bg-primary)", borderColor: "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.7rem", fontWeight: "700" }}>R</div>
                  <h3 style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "1px" }}>Disponibilidad del Equipo</h3>
                </div>
                
                {scheduleLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    Consultando cronograma...
                  </div>
                ) : activoSchedule.length === 0 ? (
                  <div className="status-available" style={{ padding: "0.5rem 0" }}>
                    Disponible inmediato
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "120px", overflowY: "auto", paddingRight: "0.25rem" }} className="custom-scrollbar">
                    {activoSchedule.map(entry => (
                      <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)", padding: "0.65rem 0.85rem", borderRadius: "0.65rem", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" }}></div>
                          <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                            {new Date(entry.fecha_inicio).toLocaleDateString()} — {new Date(entry.fecha_fin).toLocaleDateString()}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.6rem", fontWeight: "900", color: "#3b82f6", background: "rgba(59,130,246,0.1)", padding: "0.15rem 0.45rem", borderRadius: "0.25rem" }}>OCUPADO</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PERIODO DE USO */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>Fecha Inicio</label>
                  <input type="date" required value={solicitudForm.fecha_inicio} onChange={e => setSolicitudForm({...solicitudForm, fecha_inicio: e.target.value})} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>Fecha Fin</label>
                  <input type="date" required value={solicitudForm.fecha_fin} onChange={e => setSolicitudForm({...solicitudForm, fecha_fin: e.target.value})} />
                </div>
              </div>

              {overlapError && (
                <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <svg style={{ color: "#ef4444" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#f87171" }}>{overlapError}</span>
                </div>
              )}

              {/* COMENTARIO */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}>COMENTARIOS ADICIONALES</label>
                <textarea 
                  style={{ minHeight: "100px", padding: "1rem" }} 
                  placeholder="Detalles técnicos o requisitos especiales..." 
                  value={solicitudForm.comentario} 
                  onChange={e => setSolicitudForm({...solicitudForm, comentario: e.target.value})} 
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, height: "3.25rem" }} onClick={() => { setSolicitudModalOpen(false); setOverlapError(null); }}>Cancelar</button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 1.5, height: "3.25rem" }} 
                  disabled={!!overlapError || !solicitudForm.obra_id || scheduleLoading}
                >
                  {overlapError ? 'Conflicto de Fechas' : 'Confirmar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal Historial de Ocupación */}
      {historialModalOpen && (
        <div className="modal-overlay" onClick={() => setHistorialModalOpen(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="text-xl font-bold text-primary">Cronograma de Uso</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: "500" }}>{activoSeleccionadoHist?.nombre}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setHistorialModalOpen(false)}>
                &times;
              </button>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              {historialLoading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 0", gap: "1rem" }}>
                  <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Sincronizando reservas...</span>
                </div>
              ) : historial.length === 0 ? (
                <div style={{ padding: "3rem 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "4rem", height: "4rem", background: "var(--bg-primary)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                    <svg style={{ color: "var(--text-secondary)" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
                  </div>
                  <h4 style={{ fontWeight: "700", marginBottom: "0.25rem" }}>Sin reservas activas</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1.5rem", maxWidth: "200px" }}>Este equipo está disponible para ser asignado inmediatamente.</p>
                  <div className="status-available">DISPONIBLE AHORA</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div className="flex-between" style={{ padding: "0 0.25rem" }}>
                    <h3 style={{ fontSize: "0.65rem", fontWeight: "900", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1.5px" }}>Próximas Ocupaciones</h3>
                    <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--accent)" }}>{historial.length} RESERVAS</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "400px", overflowY: "auto", paddingRight: "0.5rem" }} className="custom-scrollbar">
                    {historial.map((entry: any) => (
                      <div key={entry.id} className="card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div className="flex-between">
                          <div style={{ background: "var(--bg-primary)", padding: "0.5rem", borderRadius: "0.5rem", color: "var(--text-secondary)" }}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                          </div>
                          <span className={
                            entry.estado === 'Aprobado' ? 'badge badge-green' : 
                            entry.estado === 'Entregado' ? 'badge badge-blue' :
                            'badge badge-yellow'
                          } style={{ fontSize: "0.65rem" }}>
                            {entry.estado}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: "700" }}>
                            {new Date(entry.fecha_inicio).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} — {new Date(entry.fecha_fin).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </p>
                          <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                             <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border)" }}></span>
                             Ticket de Solicitud #{entry.id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button 
                type="button"
                className="btn-primary w-full" 
                style={{ height: "3rem", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}
                onClick={() => setHistorialModalOpen(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="¿Eliminar activo?"
        message="Esta acción no se puede deshacer. El activo será eliminado permanentemente del sistema."
        onConfirm={async () => {
          if (idAEliminar) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/${idAEliminar}`, { 
              method: "DELETE",
              headers: { "Authorization": `Bearer ${token}` }
            });
            fetchActivos();
            setDeleteModalOpen(false);
            setIdAEliminar(null);
          }
        }}
        onCancel={() => {
          setDeleteModalOpen(false);
          setIdAEliminar(null);
        }}
      />

      {/* Modal Ver Descripción */}
      {descModalOpen && (
        <div className="modal-overlay" onClick={() => setDescModalOpen(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold text-primary">Descripción del Activo</h2>
              <button className="modal-close" onClick={() => setDescModalOpen(false)}>
                &times;
              </button>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--accent)", fontWeight: "600", marginBottom: "0.5rem" }}>{descModalTitle}</p>
              <div style={{ padding: "1rem", background: "var(--bg-secondary)", borderRadius: "0.5rem", fontSize: "0.9rem", color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                {descModalContent}
              </div>
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-primary" onClick={() => setDescModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        background: toast.type === "success" ? "#10b981" : "#ef4444",
        color: "white",
        padding: "1rem 1.5rem",
        borderRadius: "0.75rem",
        fontWeight: "600",
        fontSize: "0.9rem",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        transform: toast.visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        opacity: toast.visible ? 1 : 0,
        pointerEvents: toast.visible ? "auto" : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem"
      }}>
        {toast.type === "success" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        )}
        {toast.message}
      </div>
    </div>
  );
}
