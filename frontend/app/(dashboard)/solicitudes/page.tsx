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
  "pendiente de aprobación": "badge-yellow",
  "aprobado": "badge-blue",
  "atendiendo": "badge-purple",
  "listo para entrega": "badge-orange",
  "entregado totalmente": "badge-green",
  "entregado parcialmente": "badge-orange",
  "rechazado": "badge-red",
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

      {/* Modal Detalle de Solicitud */}
      {detailModalOpen && (
        <div className="modal-overlay" onClick={() => setDetailModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "900px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "750" }}>Detalle SOL-{String(selectedSolicitud?.id || 0).padStart(3, "0")}</h2>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {selectedSolicitud?.obra_nombre} - {selectedSolicitud?.usuario_nombre}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span 
                  className={`badge ${badgeColors[(selectedSolicitud?.estado || "").trim().toLowerCase()] || "badge-gray"}`}
                >
                  {selectedSolicitud?.estado}
                </span>
                <button className="modal-close" onClick={() => setDetailModalOpen(false)}>✕</button>
              </div>
            </div>

            {detailLoading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>Cargando detalles...</div>
            ) : (
              <>
                <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {selectedSolicitud?.aprobado_por_nombre && (
                    <div>
                      <span style={{ fontWeight: 600 }}>Aprobado por:</span> {selectedSolicitud.aprobado_por_nombre}
                    </div>
                  )}
                  {selectedSolicitud?.entregado_por_nombre && (
                    <div>
                      <span style={{ fontWeight: 600 }}>Entregado por:</span> {selectedSolicitud.entregado_por_nombre}
                    </div>
                  )}
                  {selectedSolicitud?.pdf_entrega && (
                    <div>
                      <a href={`${process.env.NEXT_PUBLIC_API_URL}${selectedSolicitud.pdf_entrega}`} target="_blank" rel="noopener noreferrer" 
                         style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.75rem", borderRadius: "9999px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(239, 68, 68, 0.2)" }}
                         className="hover:bg-red-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
                        </svg>
                        Documento de Respaldo
                      </a>
                    </div>
                  )}
                </div>

                <table style={{ marginBottom: "2rem" }}>
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th style={{ textAlign: "right" }}>Solicitado</th>
                      {selectedSolicitud?.estado !== "Entregado Totalmente" && (
                        <th style={{ textAlign: "right" }}>Stock Real</th>
                      )}
                      <th style={{ textAlign: "right" }}>Entregado</th>
                      <th style={{ textAlign: "right" }}>Pendiente</th>
                      <th style={{ textAlign: "right" }}>Precio Unit.</th>
                      <th style={{ textAlign: "right" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSolicitud?.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: "500" }}>{item.suministro_nombre}</td>
                        <td style={{ textAlign: "right" }}>{item.cantidad_solicitada}</td>
                        {selectedSolicitud?.estado !== "Entregado Totalmente" && (
                          <td style={{ textAlign: "right", color: item.stock_real < item.saldo_pendiente ? "var(--accent)" : "inherit" }}>
                            {item.stock_real}
                          </td>
                        )}
                        <td style={{ textAlign: "right", fontWeight: "600", color: "#10b981" }}>{item.cantidad_entregada}</td>
                        <td style={{ textAlign: "right", fontWeight: "700", color: item.saldo_pendiente > 0 ? "var(--accent)" : "inherit" }}>
                          {item.saldo_pendiente}
                        </td>
                        <td style={{ textAlign: "right" }}>Bs. {parseFloat(item.precio_unitario || 0).toLocaleString()}</td>
                        <td style={{ textAlign: "right", fontWeight: "600" }}>Bs. {(item.cantidad_solicitada * (item.precio_unitario || 0)).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={selectedSolicitud?.estado !== "Entregado Totalmente" ? 5 : 4} style={{ textAlign: "right", fontWeight: "700", borderTop: "2px solid var(--border)" }}>TOTAL PEDIDO:</td>
                      <td colSpan={2} style={{ textAlign: "right", fontWeight: "800", fontSize: "1rem", color: "var(--accent)", borderTop: "2px solid var(--border)" }}>
                        Bs. {selectedSolicitud?.items?.reduce((acc: number, item: any) => acc + (item.cantidad_solicitada * (item.precio_unitario || 0)), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {(selectedSolicitud?.estado === "Aprobado" || selectedSolicitud?.estado === "Atendiendo" || selectedSolicitud?.estado === "Listo para entrega" || selectedSolicitud?.estado === "Entregado Parcialmente") && (user?.rol === "Administrador" || user?.rol === "Almacén") && (
                   <div style={{ background: "var(--bg-primary)", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.5rem" }}>
                     <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>Registrar Entrega de Materiales</h4>
                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                       {selectedSolicitud?.items?.filter((i:any) => i.saldo_pendiente > 0).map((item: any) => (
                         <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                           <span style={{ fontSize: "0.8rem" }}>{item.suministro_nombre}</span>
                           <input 
                             type="number" 
                             defaultValue={item.saldo_pendiente}
                             max={item.saldo_pendiente}
                             min="0"
                             id={`deliver-${item.suministro_id}`}
                             style={{ width: "80px", padding: "0.25rem" }}
                           />
                           </div>
                         ))}
                         
                         <div style={{ marginTop: "1rem" }}>
                           <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>PDF de Respaldo de Entrega (Opcional)</label>
                           <input type="file" accept=".pdf" onChange={e => {
                             if (e.target.files && e.target.files.length > 0) {
                               setPdfFile(e.target.files[0]);
                             }
                           }} />
                         </div>

                         <button 
                           className="btn-primary" 
                           style={{ marginTop: "1rem" }}
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
                         Confirmar Entrega
                       </button>
                     </div>
                   </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDetailModalOpen(false)}>Cerrar</button>
                  
                  {selectedSolicitud?.estado === "Pendiente de Aprobación" && (user?.rol === "Administrador" || user?.rol === "Supervisor de Obra") && (
                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleAprobar(selectedSolicitud.id)}>Aprobar Solicitud</button>
                  )}
                </div>
              </>
            )}
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
