"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Asignacion {
  id: number;
  activo_id: number;
  activo_nombre: string;
  activo_codigo: string;
  obra_nombre: string;
  usuario_nombre: string;
  fecha_asignacion: string;
  fecha_devolucion: string;
  estado: string;
  pdf_entrega?: string;
  pdf_devolucion?: string;
}

interface Solicitud {
  id: number;
  activo_id: number;
  activo_nombre: string;
  activo_codigo: string;
  obra_id: number;
  obra_nombre: string;
  usuario_id: number;
  solicitante_nombre: string;
  aprobado_por_nombre?: string;
  entregado_por_nombre?: string;
  fecha_solicitud?: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_aprobacion?: string;
  estado: string;
  comentario?: string;
  pdf_entrega?: string;
}

interface Item { id: number; nombre: string; }

const estadoBadge: Record<string, string> = {
  "Asignado":  "badge badge-blue",
  "Devuelto":  "badge badge-gray",
  "activo":    "badge badge-blue",
  "devuelto":  "badge badge-gray",
};

export default function AsignacionesPage() {
  const { user, token } = useAuth();
  const esAdminOAlmacen = (user?.rol || "").toLowerCase().includes("administrador") || (user?.rol || "").toLowerCase().includes("almacén") || (user?.rol || "").toLowerCase().includes("almacen");
  
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [solicitudesAprobadas, setSolicitudesAprobadas] = useState<Solicitud[]>([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<Solicitud[]>([]);
  const [activos, setActivos] = useState<Item[]>([]);
  const [obras, setObras] = useState<Item[]>([]);
  const [usuarios, setUsuarios] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [idAConfirmar, setIdAConfirmar] = useState<number | null>(null);
  const [nuevoEstadoActivo, setNuevoEstadoActivo] = useState("Disponible");
  const [detalleSolicitud, setDetalleSolicitud] = useState<Solicitud | null>(null);

  // PDF states
  const [pdfEntrega, setPdfEntrega] = useState<File | null>(null);
  const [pdfDevolucion, setPdfDevolucion] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{url: string; name: string; title: string} | null>(null);

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
      
      const solicitudes = Array.isArray(solData) ? solData : [];
      setSolicitudesAprobadas(solicitudes.filter((s:any) => (s.estado || "").toLowerCase() === 'aprobado'));
      setSolicitudesPendientes(solicitudes.filter((s:any) => (s.estado || "").toLowerCase() === 'pendiente'));
      
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
      const fd = new FormData();
      fd.append("activo_id", formData.activo_id);
      fd.append("obra_id", formData.obra_id);
      fd.append("usuario_id", formData.usuario_id);
      fd.append("fecha_asignacion", formData.fecha_asignacion);
      fd.append("fecha_devolucion", formData.fecha_devolucion);
      fd.append("solicitud_id", formData.solicitud_id);
      if (pdfEntrega) fd.append("pdf_entrega", pdfEntrega);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asignaciones`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        setModalAbierto(false);
        setPdfEntrega(null);
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
      const fd = new FormData();
      fd.append("estado", "Devuelto");
      fd.append("fecha_devolucion", new Date().toISOString().split("T")[0]);
      fd.append("nuevo_estado_activo", nuevoEstadoActivo);
      if (pdfDevolucion) fd.append("pdf_devolucion", pdfDevolucion);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asignaciones/${idAConfirmar}/estado`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        fetchData();
        setReturnModalOpen(false);
        setIdAConfirmar(null);
        setPdfDevolucion(null);
      }
    } catch (error) {
      console.error("Error al registrar devolución:", error);
    }
  };

  const handleUpdateSolicitud = async (id: number, nuevoEstado: string, comentario: string = "") => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes/${id}/estado`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado, comentario }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error al actualizar solicitud:", error);
    }
  };

  const handleRechazar = (id: number) => {
    const razon = window.prompt("Ingrese el motivo del rechazo:");
    if (razon !== null && razon.trim() !== "") {
      handleUpdateSolicitud(id, 'Rechazado', razon);
    } else if (razon !== null) {
      alert("Debe ingresar un motivo para rechazar la solicitud.");
    }
  };

  const generarPlantillaEntrega = (s: Solicitud) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ACTA DE ENTREGA DE ACTIVO FIJO", 105, 20, { align: "center" });
    doc.setFontSize(11);
    doc.text(`Solicitud N°: #${s.id}`, 14, 35);
    doc.text(`Fecha de Impresión: ${new Date().toLocaleDateString("es-ES")}`, 14, 42);
    doc.text(`Activo: ${s.activo_nombre} (${s.activo_codigo})`, 14, 49);
    doc.text(`Obra / Proyecto: ${s.obra_nombre}`, 14, 56);
    doc.text(`Responsable: ${s.solicitante_nombre}`, 14, 63);
    doc.text(`Período: ${s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString("es-ES") : "-"} al ${s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString("es-ES") : "-"}`, 14, 70);
    if (s.aprobado_por_nombre) {
      doc.text(`Aprobado por: ${s.aprobado_por_nombre}`, 14, 77);
    }

    autoTable(doc, {
      head: [["Detalle", "Valor"]],
      body: [
        ["Código de Activo", s.activo_codigo || "-"],
        ["Activo Fijo", s.activo_nombre],
        ["Obra / Proyecto", s.obra_nombre],
        ["Solicitante", s.solicitante_nombre],
        ["Fecha Inicio", s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString("es-ES") : "-"],
        ["Fecha Fin", s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString("es-ES") : "-"],
      ],
      startY: 85,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 40;
    doc.line(25, finalY, 90, finalY);
    doc.text("Entregado por (Almacén)", 57, finalY + 6, { align: "center" });
    doc.text(user?.nombre || "", 57, finalY + 12, { align: "center" });

    doc.line(115, finalY, 180, finalY);
    doc.text("Recibí Conforme", 147, finalY + 6, { align: "center" });
    doc.text("Nombre: ____________________", 147, finalY + 12, { align: "center" });
    doc.text("C.I.: ____________________", 147, finalY + 18, { align: "center" });

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfPreview({ url, name: `Acta_Entrega_${s.activo_nombre.replace(/ /g,"_")}.pdf`, title: "Vista Previa - Acta de Entrega" });
  };

  const generarPlantillaDevolucion = (a: Asignacion) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ACTA DE DEVOLUCIÓN DE ACTIVO FIJO", 105, 20, { align: "center" });
    doc.setFontSize(11);
    doc.text(`Fecha de Impresión: ${new Date().toLocaleDateString("es-ES")}`, 14, 35);
    doc.text(`Activo: ${a.activo_nombre} (${a.activo_codigo || "-"})`, 14, 42);
    doc.text(`Obra: ${a.obra_nombre}`, 14, 49);
    doc.text(`Fecha Asignación: ${a.fecha_asignacion ? new Date(a.fecha_asignacion).toLocaleDateString("es-ES") : "-"}`, 14, 56);
    doc.text(`Fecha Devolución: ${new Date().toLocaleDateString("es-ES")}`, 14, 63);
    doc.text(`Estado al devolver: ${nuevoEstadoActivo}`, 14, 70);

    // @ts-ignore
    const finalY = 90;
    doc.line(25, finalY, 90, finalY);
    doc.text("Recibe (Almacén)", 57, finalY + 6, { align: "center" });
    doc.text(user?.nombre || "", 57, finalY + 12, { align: "center" });

    doc.line(115, finalY, 180, finalY);
    doc.text("Devuelve", 147, finalY + 6, { align: "center" });
    doc.text("Nombre: ____________________", 147, finalY + 12, { align: "center" });
    doc.text("C.I.: ____________________", 147, finalY + 18, { align: "center" });

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfPreview({ url, name: `Acta_Devolucion_${a.activo_nombre.replace(/ /g,"_")}.pdf`, title: "Vista Previa - Acta de Devolución" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "auto" }}>

      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Sección de Solicitudes Pendientes para Supervisor/Admin */}
        {((user?.rol || "").toLowerCase().includes("supervisor") || (user?.rol || "").toLowerCase().includes("administrador")) && (
          <div className="card" style={{ borderLeft: "4px solid #f59e0b", padding: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }}></span>
              Solicitudes de Equipo Pendientes de Aprobación
            </h3>
            {solicitudesPendientes.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>No hay solicitudes esperando aprobación para tus obras.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {solicitudesPendientes.map(s => (
                  <div key={s.id} style={{ 
                    background: "var(--bg-primary)", padding: "1rem", borderRadius: "1rem", 
                    fontSize: "0.85rem", flex: "1 1 350px", border: "1px solid var(--border)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.9rem" }}>{s.activo_nombre}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                          <strong>Solicitante:</strong> {s.solicitante_nombre} &nbsp;·&nbsp; <strong>Obra:</strong> {s.obra_nombre}
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                          <strong>Período:</strong> {s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString() : '-'} al {s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString() : '-'}
                        </div>
                      </div>
                      <button
                        className="btn-secondary btn-small"
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.55rem", whiteSpace: "nowrap" }}
                        onClick={() => setDetalleSolicitud(s)}
                      >
                        Ver Detalle
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn-primary btn-small" style={{ flex: 1 }} onClick={() => handleUpdateSolicitud(s.id, 'Aprobado')}>Aprobar</button>
                      <button className="btn-secondary btn-small" style={{ flex: 1, color: "#ef4444", borderColor: "#ef444430" }} onClick={() => handleRechazar(s.id)}>Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección de Solicitudes Aprobadas para Almacén */}
        {esAdminOAlmacen && (
          <div className="card" style={{ borderLeft: "4px solid var(--accent)", padding: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }}></span>
              Solicitudes Aprobadas (Pendientes de Entrega)
            </h3>
            {solicitudesAprobadas.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>No hay solicitudes aprobadas esperando asignación.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {solicitudesAprobadas.map(s => (
                  <div key={s.id} style={{ 
                    background: "var(--bg-primary)", padding: "1rem", borderRadius: "1rem", 
                    fontSize: "0.85rem", flex: "1 1 300px", border: "1px solid var(--border)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{s.activo_nombre}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                          Para: {s.solicitante_nombre} en {s.obra_nombre}
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                          Período: {s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString() : '-'} al {s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString() : '-'}
                        </div>
                        {s.aprobado_por_nombre && (
                          <div style={{ fontSize: "0.7rem", color: "#10b981", marginTop: "0.2rem" }}>
                            ✓ Aprobado por: {s.aprobado_por_nombre}
                          </div>
                        )}
                      </div>
                      <button
                        className="btn-secondary btn-small"
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.55rem", whiteSpace: "nowrap" }}
                        onClick={() => setDetalleSolicitud(s)}
                      >
                        Ver Detalle
                      </button>
                    </div>
                    <button id={`btn-asignar-sol-${s.id}`} className="btn-primary btn-small" style={{ width: "100%" }} onClick={() => handleProcesarSolicitud(s)}>Registrar Entrega</button>
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
                <th>Documentos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>Cargando asignaciones...</td></tr>
              ) : asignaciones.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: "500" }}>
                    {a.activo_nombre}
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                      Cód: {a.activo_codigo || "N/A"}
                    </div>
                  </td>
                  <td style={{ color: "var(--accent)", fontSize: "0.85rem" }}>{a.obra_nombre}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{a.usuario_nombre}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{a.fecha_asignacion ? new Date(a.fecha_asignacion).toLocaleDateString() : "-"}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{a.fecha_devolucion ? new Date(a.fecha_devolucion).toLocaleDateString() : "-"}</td>
                  <td><span className={estadoBadge[a.estado] || "badge badge-gray"}>{a.estado}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      {a.pdf_entrega && (
                        <button
                          className="btn-secondary"
                          style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}
                          title="Ver Acta de Entrega"
                          onClick={() => setPdfPreview({ url: `${process.env.NEXT_PUBLIC_API_URL}${a.pdf_entrega}`, name: `Acta_Entrega_${a.activo_nombre}.pdf`, title: "Acta de Entrega" })}
                        >
                          📄 Entrega
                        </button>
                      )}
                      {a.pdf_devolucion && (
                        <button
                          className="btn-secondary"
                          style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}
                          title="Ver Acta de Devolución"
                          onClick={() => setPdfPreview({ url: `${process.env.NEXT_PUBLIC_API_URL}${a.pdf_devolucion}`, name: `Acta_Devolucion_${a.activo_nombre}.pdf`, title: "Acta de Devolución" })}
                        >
                          📄 Devolución
                        </button>
                      )}
                      {!a.pdf_entrega && !a.pdf_devolucion && <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>—</span>}
                    </div>
                  </td>
                  <td>
                    {esAdminOAlmacen ? (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem" }}
                        disabled={a.estado === "Devuelto" || a.estado === "devuelto"}
                        onClick={() => (a.estado !== "Devuelto" && a.estado !== "devuelto") && handleDevolucionClick(a.id)}
                      >
                        {(a.estado === "Devuelto" || a.estado === "devuelto") ? "Devuelto" : "Registrar Devolución"}
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {(a.estado === "Devuelto" || a.estado === "devuelto") ? "Finalizado" : "En uso"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Nueva Asignación / Entrega */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => {
          setModalAbierto(false);
          setPdfEntrega(null);
          setFormData({ activo_id: "", obra_id: "", usuario_id: "", fecha_asignacion: new Date().toISOString().split("T")[0], fecha_devolucion: "", solicitud_id: "" });
        }}>
          <form className="modal-content" style={{ maxWidth: "500px" }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-header" style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                {formData.solicitud_id ? "Procesar Entrega de Activo" : "Nueva Asignación de Activo"}
              </h2>
              <button type="button" className="modal-close" onClick={() => setModalAbierto(false)}>✕</button>
            </div>
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

              {/* Sección Acta de Entrega */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.75rem" }}>Acta de Entrega (Opcional)</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", border: "2px dashed var(--border)", padding: "1rem", borderRadius: "0.5rem", alignItems: "center" }}>
                  {formData.solicitud_id && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}
                      onClick={() => {
                        const s = solicitudesAprobadas.find(s => s.id.toString() === formData.solicitud_id);
                        if (s) generarPlantillaEntrega(s);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      Generar Plantilla PDF
                    </button>
                  )}
                  <div style={{ height: "1px", background: "var(--border)", width: "100%" }}></div>
                  <div>
                    <input type="file" accept=".pdf" id="pdf-entrega-upload" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) setPdfEntrega(e.target.files[0]); }} />
                    <label htmlFor="pdf-entrega-upload" className="btn-secondary" style={{ cursor: "pointer", display: "inline-block", fontSize: "0.85rem" }}>
                      {pdfEntrega ? `✓ ${pdfEntrega.name}` : "Subir Acta Firmada"}
                    </label>
                  </div>
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
          <div className="modal-content" style={{ maxWidth: "440px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Registrar Devolución e Inspección</h2>
              <button type="button" className="modal-close" onClick={() => setReturnModalOpen(false)}>✕</button>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Inspecciona el equipo y selecciona su estado actual para finalizar la asignación.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Estado Final del Activo</label>
                <select value={nuevoEstadoActivo} onChange={e => setNuevoEstadoActivo(e.target.value)}>
                  <option value="Disponible">Disponible (Buen estado)</option>
                  <option value="Mantenimiento">En Mantenimiento (Necesita revisión)</option>
                </select>
              </div>

              {/* Sección Acta de Devolución */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.75rem" }}>Acta de Devolución (Opcional)</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", border: "2px dashed var(--border)", padding: "1rem", borderRadius: "0.5rem", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}
                    onClick={() => {
                      const a = asignaciones.find(a => a.id === idAConfirmar);
                      if (a) generarPlantillaDevolucion(a);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    Generar Plantilla PDF
                  </button>
                  <div style={{ height: "1px", background: "var(--border)", width: "100%" }}></div>
                  <div>
                    <input type="file" accept=".pdf" id="pdf-devolucion-upload" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) setPdfDevolucion(e.target.files[0]); }} />
                    <label htmlFor="pdf-devolucion-upload" className="btn-secondary" style={{ cursor: "pointer", display: "inline-block", fontSize: "0.85rem" }}>
                      {pdfDevolucion ? `✓ ${pdfDevolucion.name}` : "Subir Acta Firmada"}
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setReturnModalOpen(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={confirmDevolucion}>Finalizar y Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle de Solicitud */}
      {detalleSolicitud && (
        <div className="modal-overlay" onClick={() => setDetalleSolicitud(null)} style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: "600px", padding: 0 }} onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "800" }}>Detalle de Solicitud #{detalleSolicitud.id}</h2>
                <span className={`badge ${
                  (detalleSolicitud.estado || "").toLowerCase() === "pendiente" ? "badge-yellow" :
                  (detalleSolicitud.estado || "").toLowerCase() === "aprobado" ? "badge-green" :
                  (detalleSolicitud.estado || "").toLowerCase() === "rechazado" ? "badge-red" :
                  "badge-gray"
                }`}>
                  {detalleSolicitud.estado}
                </span>
              </div>
              <button className="modal-close" onClick={() => setDetalleSolicitud(null)}>✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Activo */}
              <div style={{ background: "var(--bg-primary)", borderRadius: "0.5rem", padding: "1rem", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Activo Fijo</div>
                <div style={{ fontWeight: "700", fontSize: "1rem" }}>{detalleSolicitud.activo_nombre}</div>
              </div>

              {/* Grid de info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ background: "var(--bg-primary)", borderRadius: "0.5rem", padding: "1rem", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Solicitante</div>
                  <div style={{ fontWeight: "600" }}>{detalleSolicitud.solicitante_nombre}</div>
                </div>
                <div style={{ background: "var(--bg-primary)", borderRadius: "0.5rem", padding: "1rem", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Obra / Proyecto</div>
                  <div style={{ fontWeight: "600" }}>{detalleSolicitud.obra_nombre}</div>
                </div>
                <div style={{ background: "var(--bg-primary)", borderRadius: "0.5rem", padding: "1rem", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Fecha de Inicio</div>
                  <div style={{ fontWeight: "600" }}>{detalleSolicitud.fecha_inicio ? new Date(detalleSolicitud.fecha_inicio).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</div>
                </div>
                <div style={{ background: "var(--bg-primary)", borderRadius: "0.5rem", padding: "1rem", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Fecha de Devolución</div>
                  <div style={{ fontWeight: "600" }}>{detalleSolicitud.fecha_fin ? new Date(detalleSolicitud.fecha_fin).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</div>
                </div>
                {detalleSolicitud.fecha_solicitud && (
                  <div style={{ background: "var(--bg-primary)", borderRadius: "0.5rem", padding: "1rem", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Fecha Solicitud</div>
                    <div style={{ fontWeight: "600" }}>{new Date(detalleSolicitud.fecha_solicitud).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</div>
                  </div>
                )}
                {detalleSolicitud.aprobado_por_nombre && (
                  <div style={{ background: "var(--bg-primary)", borderRadius: "0.5rem", padding: "1rem", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Aprobado por</div>
                    <div style={{ fontWeight: "600", color: "#10b981" }}>✓ {detalleSolicitud.aprobado_por_nombre}</div>
                    {detalleSolicitud.fecha_aprobacion && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                        {new Date(detalleSolicitud.fecha_aprobacion).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                      </div>
                    )}
                  </div>
                )}
                {detalleSolicitud.entregado_por_nombre && (
                  <div style={{ background: "var(--bg-primary)", borderRadius: "0.5rem", padding: "1rem", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Entregado por</div>
                    <div style={{ fontWeight: "600", color: "var(--accent)" }}>{detalleSolicitud.entregado_por_nombre}</div>
                  </div>
                )}
              </div>

              {/* Comentario / Notas */}
              {detalleSolicitud.comentario && (
                <div style={{
                  borderRadius: "0.5rem", padding: "1rem", border: "1px solid",
                  borderColor: (detalleSolicitud.estado || "").toLowerCase() === "rechazado" ? "#fecaca" : "var(--border)",
                  background: (detalleSolicitud.estado || "").toLowerCase() === "rechazado" ? "#fef2f2" : "var(--bg-primary)"
                }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem",
                    color: (detalleSolicitud.estado || "").toLowerCase() === "rechazado" ? "#ef4444" : "var(--text-secondary)"
                  }}>
                    {(detalleSolicitud.estado || "").toLowerCase() === "rechazado" ? "⚠ Motivo del Rechazo" : "Comentarios / Notas"}
                  </div>
                  <div style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>{detalleSolicitud.comentario}</div>
                </div>
              )}

              {/* Documento adjunto */}
              {detalleSolicitud.pdf_entrega && (
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}${detalleSolicitud.pdf_entrega}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", width: "fit-content", fontSize: "0.85rem" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Ver Documento de Entrega
                </a>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              {(detalleSolicitud.estado || "").toLowerCase() === "pendiente" && ((user?.rol || "").toLowerCase().includes("supervisor") || (user?.rol || "").toLowerCase().includes("administrador")) && (
                <>
                  <button className="btn-secondary" style={{ color: "#ef4444", borderColor: "#ef444430" }} onClick={() => { setDetalleSolicitud(null); handleRechazar(detalleSolicitud.id); }}>
                    Rechazar
                  </button>
                  <button className="btn-primary" onClick={() => { handleUpdateSolicitud(detalleSolicitud.id, "Aprobado"); setDetalleSolicitud(null); }}>
                    Aprobar Solicitud
                  </button>
                </>
              )}
              {(detalleSolicitud.estado || "").toLowerCase() === "aprobado" && esAdminOAlmacen && (
                <button className="btn-primary" onClick={() => { handleProcesarSolicitud(detalleSolicitud); setDetalleSolicitud(null); }}>
                  Registrar Entrega
                </button>
              )}
              <button className="btn-secondary" onClick={() => setDetalleSolicitud(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa PDF */}
      {pdfPreview && (
        <div className="modal-overlay" onClick={() => setPdfPreview(null)} style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: "800px", width: "90%", height: "85vh", display: "flex", flexDirection: "column", padding: 0 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{pdfPreview.title}</h2>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <a
                  href={pdfPreview.url}
                  download={pdfPreview.name}
                  className="btn-primary"
                  style={{ textDecoration: "none", padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                  onClick={() => setPdfPreview(null)}
                >
                  Descargar PDF
                </a>
                <button type="button" className="modal-close" onClick={() => setPdfPreview(null)}>✕</button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: "#525659" }}>
              <iframe src={pdfPreview.url} title={pdfPreview.title} width="100%" height="100%" style={{ border: "none" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
