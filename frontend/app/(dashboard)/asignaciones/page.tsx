"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface Asignacion {
  id: number;
  activo_id: number;
  activo_nombre: string;
  obra_nombre: string;
  usuario_nombre: string;
  fecha_asignacion: string;
  fecha_devolucion: string;
  estado: string;
}

interface Solicitud {
  id: number;
  activo_id: number;
  activo_nombre: string;
  obra_id: number;
  obra_nombre: string;
  usuario_id: number;
  solicitante_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
}

interface Item { id: number; nombre: string; }

const estadoBadge: Record<string, string> = {
  activo:   "badge badge-green",
  devuelto: "badge badge-gray",
};

export default function AsignacionesPage() {
  const { user, token } = useAuth();
  const esAdminOAlmacen = (user?.rol || "").toLowerCase().includes("administrador") || (user?.rol || "").toLowerCase().includes("almacén") || (user?.rol || "").toLowerCase().includes("almacen");
  
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [solicitudesAprobadas, setSolicitudesAprobadas] = useState<Solicitud[]>([]);
  const [activos, setActivos] = useState<Item[]>([]);
  const [obras, setObras] = useState<Item[]>([]);
  const [usuarios, setUsuarios] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [idAConfirmar, setIdAConfirmar] = useState<number | null>(null);
  const [nuevoEstadoActivo, setNuevoEstadoActivo] = useState("disponible");

  const [formData, setFormData] = useState({
    activo_id: "",
    obra_id: "",
    usuario_id: "",
    fecha_asignacion: new Date().toISOString().split("T")[0],
    fecha_devolucion: "",
    solicitud_id: ""
  });

  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [asgRes, actRes, obrRes, usrRes, solRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asignaciones`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obras`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes`, { headers })
      ]);
      const [asgData, actData, obrData, usrData, solData] = await Promise.all([
        asgRes.json(), actRes.json(), obrRes.json(), usrRes.json(), solRes.json()
      ]);
      
      setAsignaciones(Array.isArray(asgData) ? asgData : []);
      setActivos(Array.isArray(actData) ? actData : []);
      setObras(Array.isArray(obrData) ? obrData : []);
      setUsuarios(Array.isArray(usrData) ? usrData : []);
      setSolicitudesAprobadas(Array.isArray(solData) ? solData.filter((s:any) => s.estado === 'aprobado') : []);
      
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asignaciones`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalAbierto(false);
        setFormData({ 
          activo_id: "", obra_id: "", usuario_id: "", 
          fecha_asignacion: new Date().toISOString().split("T")[0], 
          fecha_devolucion: "", solicitud_id: "" 
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error al asignar:", error);
    }
  };

  const handleProcesarSolicitud = (s: Solicitud) => {
    setFormData({
      activo_id: s.activo_id.toString(),
      obra_id: s.obra_id.toString(),
      usuario_id: s.usuario_id.toString(),
      fecha_asignacion: new Date().toISOString().split("T")[0],
      fecha_devolucion: s.fecha_fin.split("T")[0],
      solicitud_id: s.id.toString()
    });
    setModalAbierto(true);
  };

  const handleDevolucionClick = (id: number) => {
    setIdAConfirmar(id);
    setReturnModalOpen(true);
  };

  const confirmDevolucion = async () => {
    if (!idAConfirmar) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asignaciones/${idAConfirmar}/estado`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          estado: "devuelto", 
          fecha_devolucion: new Date().toISOString().split("T")[0],
          nuevo_estado_activo: nuevoEstadoActivo
        }),
      });
      if (res.ok) {
        fetchData();
        setReturnModalOpen(false);
        setIdAConfirmar(null);
      }
    } catch (error) {
      console.error("Error al registrar devolución:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "auto" }}>

      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Sección de Solicitudes Aprobadas para Almacén */}
        {esAdminOAlmacen && (
          <div className="card" style={{ borderLeft: "4px solid var(--accent)", padding: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>Solicitudes Aprobadas (Pendientes de Entrega)</h3>
            {solicitudesAprobadas.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>No hay solicitudes aprobadas esperando asignación.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {solicitudesAprobadas.map(s => (
                  <div key={s.id} style={{ 
                    background: "var(--bg-primary)", padding: "0.75rem", borderRadius: "0.5rem", 
                    fontSize: "0.85rem", flex: "1 1 300px", border: "1px solid var(--border)",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600" }}>{s.activo_nombre}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                        Para: {s.solicitante_nombre} en {s.obra_nombre}
                      </div>
                    </div>
                    <button id={`btn-asignar-sol-${s.id}`} className="btn-primary btn-small" onClick={() => handleProcesarSolicitud(s)}>Asignar Activo</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Asignaciones Activas</h2>
          {esAdminOAlmacen && (
            <button className="btn-primary" onClick={() => setModalAbierto(true)}>+ Nueva Asignación</button>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Activo</th>
                <th>Obra</th>
                <th>Responsable</th>
                <th>Asignación</th>
                <th>Devolución</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>Cargando asignaciones...</td></tr>
              ) : asignaciones.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: "500" }}>{a.activo_nombre}</td>
                  <td style={{ color: "var(--accent)", fontSize: "0.85rem" }}>{a.obra_nombre}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{a.usuario_nombre}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{a.fecha_asignacion ? new Date(a.fecha_asignacion).toLocaleDateString() : "-"}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{a.fecha_devolucion ? new Date(a.fecha_devolucion).toLocaleDateString() : "-"}</td>
                  <td><span className={estadoBadge[a.estado] || "badge badge-gray"}>{a.estado}</span></td>
                  <td>
                    {esAdminOAlmacen ? (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem" }}
                        disabled={a.estado !== "activo"}
                        onClick={() => a.estado === "activo" && handleDevolucionClick(a.id)}
                      >
                        {a.estado === "activo" ? "Registrar Devolución" : "Devuelto"}
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {a.estado === "activo" ? "En uso" : "Finalizado"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Nueva Asignación */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => {
          setModalAbierto(false);
          setFormData({ activo_id: "", obra_id: "", usuario_id: "", fecha_asignacion: new Date().toISOString().split("T")[0], fecha_devolucion: "", solicitud_id: "" });
        }}>
          <form className="modal-content" style={{ maxWidth: "450px" }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.5rem" }}>
              {formData.solicitud_id ? "Procesar Entrega de Activo" : "Nueva Asignación de Activo"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Activo Fijo</label>
                <select required value={formData.activo_id} onChange={e => setFormData({...formData, activo_id: e.target.value})}>
                  <option value="">Seleccionar activo...</option>
                  {activos.map(act => <option key={act.id} value={act.id}>{act.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Obra / Destino</label>
                <select required value={formData.obra_id} onChange={e => setFormData({...formData, obra_id: e.target.value})}>
                  <option value="">Seleccionar obra...</option>
                  {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Responsable</label>
                <select required value={formData.usuario_id} onChange={e => setFormData({...formData, usuario_id: e.target.value})}>
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Fecha Asignación</label>
                  <input type="date" required value={formData.fecha_asignacion} onChange={e => setFormData({...formData, fecha_asignacion: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Fecha Devolución</label>
                  <input type="date" required value={formData.fecha_devolucion} onChange={e => setFormData({...formData, fecha_devolucion: e.target.value})} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirmar Entrega</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal Devolución con Inspección */}
      {returnModalOpen && (
        <div className="modal-overlay" onClick={() => setReturnModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "400px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Registrar Devolución e Inspección</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Por favor, inspecciona el equipo y selecciona su estado actual para finalizar la asignación.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Estado Final del Activo</label>
                <select value={nuevoEstadoActivo} onChange={e => setNuevoEstadoActivo(e.target.value)}>
                  <option value="disponible">Disponible (Buen estado)</option>
                  <option value="mantenimiento">En Mantenimiento (Necesita revisión)</option>
                  <option value="dañado">Dañado (Fuera de servicio)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setReturnModalOpen(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={confirmDevolucion}>Finalizar y Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
