"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface Solicitud {
  id: number;
  obra_nombre: string;
  usuario_nombre: string;
  fecha_solicitud: string;
  estado: string;
  items_count: number;
  fecha_aprobacion?: string;
  aprobado_por_nombre?: string;
  entregado_por_nombre?: string;
  pdf_entrega?: string;
  almacen_recogida_id?: number;
  almacen_recogida_nombre?: string;
}

interface Obra {
  id: number;
  nombre: string;
}

interface Suministro {
  id: number;
  nombre: string;
  unidad: string;
}

const badgeColors: Record<string, string> = {
  "pendiente de aprobación": "badge-yellow shadow-sm shadow-yellow-500/5",
  "aprobado": "badge-blue shadow-sm shadow-blue-500/5",
  "atendiendo": "badge-purple shadow-sm shadow-purple-500/5",
  "listo para entrega": "badge-orange shadow-sm shadow-orange-500/5",
  "entregado totalmente": "badge-green shadow-sm shadow-green-500/5",
  "entregado parcialmente": "badge-orange shadow-sm shadow-orange-500/5",
  "rechazado": "badge-red shadow-sm shadow-red-500/5",
};

export default function SolicitudesPage() {
  const { user, token } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [suministrosDisponibles, setSuministrosDisponibles] = useState<Suministro[]>([]);
  const [almacenes, setAlmacenes] = useState<{id: number, nombre: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Modals for Actions
  const [listoModalOpen, setListoModalOpen] = useState(false);
  const [listoSolicitudId, setListoSolicitudId] = useState<number | null>(null);
  const [selectedAlmacen, setSelectedAlmacen] = useState("");

  // Estado para filtrado
  const [estadoFiltro, setEstadoFiltro] = useState("Todos los estados");

  // Estado para modal de detalles
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Formulario Nueva Solicitud
  const [formData, setFormData] = useState({
    obra_id: "",
    items: [{ suministro_id: "", cantidad: 1 }]
  });

  const fetchData = async () => {
    if (!token) return;
    try {
      const [solRes, obrRes, sumRes, almRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitudes`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obras`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suministros`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/almacenes`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);
      const [solData, obrData, sumData, almData] = await Promise.all([solRes.json(), obrRes.json(), sumRes.json(), almRes.json()]);
      setSolicitudes(Array.isArray(solData) ? solData : []);
      setObras(Array.isArray(obrData) ? obrData : []);
      setSuministrosDisponibles(Array.isArray(sumData) ? sumData : []);
      setAlmacenes(Array.isArray(almData) ? almData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { suministro_id: "", cantidad: 1 }] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitudes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          usuario_id: user.id
        }),
      });
      if (res.ok) {
        setModalAbierto(false);
        setFormData({ obra_id: "", items: [{ suministro_id: "", cantidad: 1 }] });
        fetchData();
      }
    } catch (error) {
      console.error("Error al crear solicitud:", error);
    }
  };

  const handleAprobar = async (id: number) => {
    if (!user || !token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitudes/${id}/aprobar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ usuario_id: user.id }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error al aprobar solicitud:", error);
    }
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: string, almacen_id?: number) => {
    if (!token) return;
    try {
      const payload: any = { estado: nuevoEstado };
      if (almacen_id) payload.almacen_recogida_id = almacen_id;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitudes/${id}/estado`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setListoModalOpen(false);
        setListoSolicitudId(null);
        setSelectedAlmacen("");
        fetchData();
      }
    } catch (error) {
      console.error(`Error al cambiar estado a ${nuevoEstado}:`, error);
    }
  };

  const handleEntregarMateriales = async (id: number, itemsToDeliver: any[]) => {
    if (!user) return;
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("items", JSON.stringify(itemsToDeliver));
      formDataUpload.append("usuario_id", user.id.toString());
      if (pdfFile) {
        formDataUpload.append("pdf_entrega", pdfFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitudes/${id}/entregar`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`
        },
        body: formDataUpload,
      });
      if (res.ok) {
        fetchData();
        setDetailModalOpen(false);
      }
    } catch (error) {
      console.error("Error al entregar materiales:", error);
    }
  };

  const handleVerDetalle = async (id: number) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    setPdfFile(null); // reset file state on open
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitudes/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedSolicitud(data);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtrados = solicitudes.filter(s => 
    estadoFiltro === "Todos los estados" || s.estado === estadoFiltro
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "auto" }}>

      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <select 
            style={{ maxWidth: "250px" }} 
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option>Todos los estados</option>
            <option>Pendiente de Aprobación</option>
            <option>Aprobado</option>
            <option>Atendiendo</option>
            <option>Listo para entrega</option>
            <option>Entregado Parcialmente</option>
            <option>Entregado Totalmente</option>
            <option>Rechazado</option>
          </select>
          {(user?.rol === "Administrador" || user?.rol === "Técnico") && (
            <button className="btn-primary" style={{ marginLeft: "auto" }} onClick={() => setModalAbierto(true)}>
              + Nueva Solicitud
            </button>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Obra</th>
                <th>Detalle</th>
                <th>Fechas</th>
                <th>Ítems</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>Cargando solicitudes...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No hay solicitudes que coincidan con el filtro.</td></tr>
              ) : filtrados.map(s => (
                <tr key={s.id}>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>SOL-{String(s.id).padStart(3, "0")}</td>
                  <td style={{ fontWeight: "600" }}>{s.obra_nombre}</td>
                  <td style={{ fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div><span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Solicitante:</span> <span style={{ color: "var(--text-secondary)" }}>{s.usuario_nombre}</span></div>
                      {s.aprobado_por_nombre && (
                        <div><span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Aprobado por:</span> <span style={{ color: "var(--text-secondary)" }}>{s.aprobado_por_nombre}</span></div>
                      )}
                      {s.almacen_recogida_nombre && s.estado !== "Entregado Totalmente" && (
                        <div><span style={{ fontWeight: 600, color: "var(--accent)" }}>Recoger en:</span> <span style={{ color: "var(--text-secondary)" }}>{s.almacen_recogida_nombre}</span></div>
                      )}
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Solicitud:</span>{" "}
                        {(() => {
                          if (!s.fecha_solicitud) return "-";
                          try {
                            return new Date(s.fecha_solicitud).toLocaleDateString();
                          } catch (e) {
                            return "Inválida";
                          }
                        })()}
                      </div>
                      {s.fecha_aprobacion && (
                        <div>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Aprobación:</span>{" "}
                          {(() => {
                            try { return new Date(s.fecha_aprobacion).toLocaleDateString(); } catch (e) { return "Inválida"; }
                          })()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      background: "var(--bg-primary)", border: "1px solid var(--border)",
                      borderRadius: "9999px", padding: "0.15rem 0.6rem", fontSize: "0.75rem", fontWeight: "650",
                    }}>
                      {s.items_count} ítems
                    </span>
                  </td>
                  <td>
                    <span 
                      className={`badge ${badgeColors[(s.estado || "").trim().toLowerCase()] || "badge-gray"}`}
                    >
                      {s.estado}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
                        onClick={() => handleVerDetalle(s.id)}
                      >
                        Ver Detalle
                      </button>
                      
                      {/* Acciones para Supervisor */}
                      {s.estado === "Pendiente de Aprobación" && (user?.rol === "Administrador" || user?.rol === "Supervisor de Obra") && (
                        <button 
                          className="btn-primary btn-small" 
                          onClick={() => handleAprobar(s.id)}
                        >
                          Aprobar
                        </button>
                      )}

                      {/* Acciones para Contabilidad */}
                      {/* Acciones para Almacén */}
                      {s.estado === "Aprobado" && (user?.rol === "Administrador" || user?.rol === "Almacén") && (
                        <button 
                          className="btn-secondary btn-small" 
                          onClick={() => handleCambiarEstado(s.id, "Atendiendo")}
                        >
                          Atender
                        </button>
                      )}
                      {s.estado === "Atendiendo" && (user?.rol === "Administrador" || user?.rol === "Almacén") && (
                        <button 
                          className="btn-primary btn-small" 
                          onClick={() => {
                            setListoSolicitudId(s.id);
                            setListoModalOpen(true);
                          }}
                        >
                          Listo para entrega
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Nueva Solicitud */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <form className="modal-content" style={{ maxWidth: "700px" }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Nueva Solicitud de Materiales</h2>
              <button type="button" className="modal-close" onClick={() => setModalAbierto(false)}>✕</button>
            </div>
            
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Obra / Proyecto</label>
              <select required value={formData.obra_id} onChange={e => setFormData({...formData, obra_id: e.target.value})}>
                <option value="">Seleccionar obra...</option>
                {obras.map(o => (
                  <option key={o.id} value={o.id}>{o.nombre}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>Materiales Solicitados</label>
                <button type="button" className="btn-secondary" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }} onClick={handleAddItem}>+ Añadir Ítem</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {formData.items.map((item, index) => (
                  <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 100px 40px", gap: "0.5rem", alignItems: "end" }}>
                    <div>
                      <select required value={item.suministro_id} onChange={e => handleItemChange(index, "suministro_id", e.target.value)}>
                        <option value="">Material...</option>
                        {suministrosDisponibles.map(sum => (
                          <option key={sum.id} value={sum.id}>{sum.nombre} ({sum.unidad})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input 
                        type="number" 
                        required 
                        min="1" 
                        value={item.cantidad || ""} 
                        onChange={e => {
                          const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                          handleItemChange(index, "cantidad", val);
                        }} 
                      />
                    </div>
                    <button type="button" className="btn-secondary" style={{ padding: "0.5rem", color: "#f87171" }} onClick={() => handleRemoveItem(index)}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Enviar Solicitud</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Detalle de Solicitud (Sober & Professional Style) */}
      {detailModalOpen && (
        <div className="modal-overlay" onClick={() => setDetailModalOpen(false)}>
          <div className="modal-content !max-w-4xl !p-0 overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header Standard */}
            <div className="modal-header !px-8 !py-6 border-b" style={{ borderColor: "var(--border)", background: "rgba(var(--bg-secondary-rgb), 0.5)" }}>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-accent uppercase tracking-[2px]">Detalle de Requerimiento</span>
                <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>SOL-{String(selectedSolicitud?.id || 0).padStart(3, "0")}</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badgeColors[(selectedSolicitud?.estado || "").trim().toLowerCase()] || "badge-gray"} border`} style={{ borderColor: "var(--border)" }}>
                  {selectedSolicitud?.estado}
                </span>
                <button className="modal-close" onClick={() => setDetailModalOpen(false)}>✕</button>
              </div>
            </div>

            <div className="p-8 space-y-10" style={{ color: "var(--text-primary)" }}>
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Cargando información...</span>
                </div>
              ) : (
                <>
                  {/* Info Grid Matrix */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl border" style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Obra / Proyecto</span>
                      <p className="text-sm font-bold truncate overflow-hidden" style={{ color: "var(--text-primary)" }}>{selectedSolicitud?.obra_nombre}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Responsable</span>
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{selectedSolicitud?.usuario_nombre}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Fecha Emisión</span>
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        {selectedSolicitud?.fecha_solicitud ? new Date(selectedSolicitud.fecha_solicitud).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Autorizado por</span>
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{selectedSolicitud?.aprobado_por_nombre || "Pendiente"}</p>
                    </div>
                  </div>

                  {/* Delivery Info Badges */}
                  {(selectedSolicitud?.entregado_por_nombre || selectedSolicitud?.pdf_entrega) && (
                    <div className="flex flex-wrap gap-4 px-2">
                      {selectedSolicitud?.entregado_por_nombre && (
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-sm" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-tighter" style={{ color: "var(--text-secondary)" }}>Despachado por</span>
                            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{selectedSolicitud.entregado_por_nombre}</span>
                          </div>
                        </div>
                      )}
                      {selectedSolicitud?.pdf_entrega && (
                        <a href={`${process.env.NEXT_PUBLIC_API_URL}${selectedSolicitud.pdf_entrega}`} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center gap-3 bg-red-500/5 hover:bg-red-500/10 px-5 py-3 rounded-2xl border border-red-500/20 transition-all active:scale-95 group">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 group-hover:scale-110 transition-transform"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span className="text-xs font-black text-red-500 uppercase tracking-widest">Acta Digital PDF</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Items Table Section */}
                  <div className="space-y-5 px-1">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-[10px] font-black uppercase tracking-[2px]" style={{ color: "var(--text-secondary)" }}>Detalle de Suministros Solicitados</h3>
                      <div className="text-[10px] font-black text-accent">{selectedSolicitud?.items?.length} MATERIALES</div>
                    </div>
                    
                    <div className="overflow-x-auto border rounded-2xl shadow-sm" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
                      <table className="!mb-0 w-full min-w-[700px]">
                        <thead>
                          <tr className="border-b" style={{ background: "rgba(var(--accent-rgb), 0.04)", borderColor: "var(--border)" }}>
                            <th className="!py-4 px-6 text-[10px] font-black uppercase tracking-wider text-left" style={{ color: "var(--text-secondary)" }}>Suministro</th>
                            <th className="!py-4 px-4 text-[10px] font-black uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Cant. Pedida</th>
                            {selectedSolicitud?.estado !== "Entregado Totalmente" && (
                              <th className="!py-4 px-4 text-[10px] font-black uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Stock Disp.</th>
                            )}
                            <th className="!py-4 px-4 text-[10px] font-black uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Entregado</th>
                            <th className="!py-4 px-4 text-[10px] font-black uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Saldo</th>
                            <th className="!py-4 px-4 text-[10px] font-black uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>P. Unit (Bs)</th>
                            <th className="!py-4 px-6 text-[10px] font-black uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSolicitud?.items?.map((item: any) => (
                            <tr key={item.id} className="hover:bg-[var(--bg-card)] transition-colors group border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                              <td className="!py-4 px-6 font-bold" style={{ color: "var(--text-primary)" }}>{item.suministro_nombre}</td>
                              <td className="!py-4 px-4 text-right font-medium" style={{ color: "var(--text-secondary)" }}>{item.cantidad_solicitada}</td>
                              {selectedSolicitud?.estado !== "Entregado Totalmente" && (
                                <td className={`!py-4 px-4 text-right font-bold ${item.stock_real < item.saldo_pendiente ? "text-orange-500" : "text-[var(--text-secondary)]"}`}>
                                  {item.stock_real}
                                </td>
                              )}
                              <td className="!py-4 px-4 text-right font-bold text-green-600 dark:text-green-400">{item.cantidad_entregada}</td>
                              <td className={`!py-4 px-4 text-right font-black ${item.saldo_pendiente > 0 ? "text-accent" : "text-[var(--text-secondary)]"}`}>
                                {item.saldo_pendiente}
                              </td>
                              <td className="!py-4 px-4 text-right font-medium" style={{ color: "var(--text-secondary)" }}>{parseFloat(item.precio_unitario || 0).toLocaleString()}</td>
                              <td className="!py-4 px-6 text-right font-bold" style={{ color: "var(--text-primary)" }}>{((item.cantidad_solicitada || 0) * (item.precio_unitario || 0)).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t" style={{ background: "rgba(var(--accent-rgb), 0.06)", borderColor: "var(--border)" }}>
                            <td colSpan={selectedSolicitud?.estado !== "Entregado Totalmente" ? 6 : 5} className="!py-6 px-6 text-right font-black uppercase tracking-[2px] text-[10px]" style={{ color: "var(--text-secondary)" }}>Valorización Total del Pedido:</td>
                            <td className="!py-6 px-6 text-right font-black text-xl" style={{ color: "var(--text-primary)" }}>
                              Bs. {selectedSolicitud?.items?.reduce((acc: number, item: any) => acc + (item.cantidad_solicitada * (item.precio_unitario || 0)), 0).toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Logistics Dispatch Section (Warehouse Only) */}
                  {(selectedSolicitud?.estado === "Aprobado" || selectedSolicitud?.estado === "Atendiendo" || selectedSolicitud?.estado === "Listo para entrega" || selectedSolicitud?.estado === "Entregado Parcialmente") && (user?.rol === "Administrador" || user?.rol === "Almacén") && (
                     <div className="p-10 rounded-[2rem] border shadow-2xl relative overflow-hidden" style={{ background: "var(--bg-secondary)", borderColor: "var(--accent)" }}>
                       <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[80px] rounded-full -mr-24 -mt-24 pointer-events-none"></div>
                       <h4 className="text-md font-black uppercase tracking-[1px] mb-8 flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                         <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                         </div>
                         Gestión de Despacho de Inventario
                       </h4>
                       
                       <div className="grid md:grid-cols-2 gap-10 relative z-10">
                         <div className="space-y-5">
                           <span className="text-[10px] font-black uppercase tracking-[2px] block px-1" style={{ color: "var(--text-secondary)" }}>Ajuste de Salida por Ítem</span>
                           <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                             {selectedSolicitud?.items?.filter((i:any) => i.saldo_pendiente > 0).map((item: any) => (
                               <div key={item.id} className="flex justify-between items-center p-5 rounded-2xl border hover:border-accent group transition-all" style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}>
                                 <div className="flex flex-col">
                                   <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{item.suministro_nombre}</span>
                                   <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: "var(--text-secondary)" }}>Saldo: {item.saldo_pendiente} {item.unidad || 'u.'}</span>
                                 </div>
                                 <div className="relative">
                                   <input 
                                     type="number" 
                                     defaultValue={item.saldo_pendiente}
                                     max={item.saldo_pendiente}
                                     min="0"
                                     id={`deliver-${item.suministro_id}`}
                                     className="w-24 h-11 border text-center font-black text-accent rounded-xl outline-none transition-all shadow-inner"
                                     style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                                   />
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                         
                         <div className="space-y-8">
                           <div className="space-y-5">
                             <span className="text-[10px] font-black uppercase tracking-[2px] block px-1" style={{ color: "var(--text-secondary)" }}>Cierre y Respaldo Digital</span>
                             <div className="p-10 rounded-2xl border border-dashed hover:border-accent/50 transition-all group flex flex-col items-center justify-center gap-5 text-center cursor-pointer" style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}>
                               <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-accent group-hover:bg-accent/10 transition-all transform group-hover:-translate-y-1 shadow-sm" style={{ background: "var(--bg-card)" }}>
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                               </div>
                               <div>
                                 <p className="text-xs font-bold mb-1" style={{ color: "var(--text-primary)" }}>Acta de Conformidad (PDF)</p>
                                 <p className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>Arrastre o seleccione el documento escaneado</p>
                               </div>
                               <input type="file" accept=".pdf" className="hidden" id="pdf-upload" onChange={e => {
                                 if (e.target.files && e.target.files.length > 0) setPdfFile(e.target.files[0]);
                                }} />
                               <label htmlFor="pdf-upload" className="w-full px-8 py-3 rounded-xl text-[10px] font-black cursor-pointer transition-all text-center" style={{ background: "var(--accent)", color: "white" }}>
                                 {pdfFile ? `✓ ${pdfFile.name.substring(0, 15)}...` : 'SELECCIONAR PDF'}
                               </label>
                             </div>
                           </div>

                           <button 
                             className="w-full h-16 bg-accent hover:bg-accent-hover text-white font-black text-xs uppercase tracking-[4px] rounded-2xl shadow-xl shadow-accent/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                             onClick={() => {
                               const toDeliver = selectedSolicitud.items
                                 .filter((i:any) => i.saldo_pendiente > 0)
                                 .map((i:any) => ({
                                   suministro_id: i.suministro_id,
                                   cantidad_entregada: parseInt((document.getElementById(`deliver-${i.suministro_id}`) as HTMLInputElement).value || "0")
                                 }))
                                 .filter((i:any) => i.cantidad_entregada > 0);
                               
                               if (toDeliver.length > 0) handleEntregarMateriales(selectedSolicitud.id, toDeliver);
                             }}
                           >
                             PROCESAR ENTREGA FINAL
                           </button>
                         </div>
                       </div>
                     </div>
                  )}

                  {/* Modal Footer Actions */}
                  <div className="flex gap-5 pt-6 px-2">
                    <button className="h-14 flex-1 btn-secondary text-xs font-black uppercase tracking-[2px] rounded-2xl active:scale-95 transition-transform" onClick={() => setDetailModalOpen(false)}>Cerrar Reporte</button>
                    
                    {selectedSolicitud?.estado === "Pendiente de Aprobación" && (user?.rol === "Administrador" || user?.rol === "Supervisor de Obra") && (
                      <button className="h-14 flex-1 bg-accent/90 hover:bg-accent text-white font-black rounded-2xl shadow-xl shadow-accent/20 transition-all text-xs uppercase tracking-[2px] active:scale-95 flex items-center justify-center gap-2" onClick={() => handleAprobar(selectedSolicitud.id)}>
                        AUTORIZAR REQUERIMIENTO
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Seleccionar Almacén de Recogida */}
      {listoModalOpen && listoSolicitudId && (
        <div className="modal-overlay" onClick={() => setListoModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Punto de Recogida</h2>
              <button type="button" className="modal-close" onClick={() => setListoModalOpen(false)}>✕</button>
            </div>
            
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Seleccione en qué almacén el usuario debe recoger los materiales de esta solicitud.
              </p>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Almacén</label>
              <select required value={selectedAlmacen} onChange={e => setSelectedAlmacen(e.target.value)}>
                <option value="">Seleccione el almacén...</option>
                {almacenes.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setListoModalOpen(false)}>Cancelar</button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ flex: 1 }} 
                onClick={() => {
                  if (!selectedAlmacen) {
                    alert("Debe seleccionar un almacén.");
                    return;
                  }
                  handleCambiarEstado(listoSolicitudId, "Listo para entrega", parseInt(selectedAlmacen));
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
