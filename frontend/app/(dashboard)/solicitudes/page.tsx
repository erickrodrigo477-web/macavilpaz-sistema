"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [pdfPreview, setPdfPreview] = useState<{url: string, name: string, title: string} | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportLoading, setReportLoading] = useState(false);

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

  const fetchAndGeneratePDF = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitudes/reporte/entregados?startDate=${reportForm.startDate}&endDate=${reportForm.endDate}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        alert("No hay solicitudes entregadas en este rango de fechas.");
        setReportLoading(false);
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Reporte Detallado de Solicitudes Entregadas", 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Rango: ${new Date(reportForm.startDate).toLocaleDateString()} - ${new Date(reportForm.endDate).toLocaleDateString()}`, 14, 28);
      doc.text(`Total Solicitudes: ${data.length}`, 14, 34);

      let startY = 45;
      let granTotal = 0;

      data.forEach((sol: any, index: number) => {
        if (startY > 250) {
          doc.addPage();
          startY = 20;
        }

        doc.setFillColor(240, 240, 240);
        doc.rect(14, startY - 5, 182, 16, 'F');
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`SOL-${String(sol.id).padStart(3, "0")} - Obra: ${sol.obra_nombre}`, 16, startY);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Solicitante: ${sol.usuario_nombre} | Aprobación: ${new Date(sol.fecha_aprobacion).toLocaleDateString()}`, 16, startY + 6);
        
        const tableRows: any[] = [];
        sol.items.forEach((item: any) => {
          tableRows.push([
            item.suministro_nombre,
            item.unidad,
            item.cantidad_entregada,
            `Bs. ${Number(item.precio_unitario || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            `Bs. ${Number(item.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ]);
        });

        autoTable(doc, {
          head: [["Suministro", "Unidad", "Cant.", "P.Unitario", "Subtotal"]],
          body: tableRows,
          startY: startY + 12,
          theme: 'plain',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
          columnStyles: {
            2: { halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right', fontStyle: 'bold' }
          },
          margin: { left: 16, right: 16 },
        });

        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY;
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`Costo Total Solicitud: Bs. ${Number(sol.costo_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 128, finalY + 6);

        granTotal += Number(sol.costo_total || 0);
        startY = finalY + 16;
      });

      if (startY > 270) {
        doc.addPage();
        startY = 20;
      }
      doc.setFillColor(16, 185, 129);
      doc.rect(14, startY, 182, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`COSTO TOTAL DEL PERIODO: Bs. ${granTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 16, startY + 8);

      const pdfBlobUrl = doc.output('bloburl');
      setPdfPreview(pdfBlobUrl.toString());
      setReportModalOpen(false);

    } catch (error) {
      console.error("Error al generar reporte", error);
      alert("Error al obtener los datos del reporte.");
    } finally {
      setReportLoading(false);
    }
  };

  const generarPlantillaActa = () => {
    if (!selectedSolicitud) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ACTA DE CONFORMIDAD DE ENTREGA DE MATERIALES", 105, 20, { align: "center" });

    doc.setFontSize(11);
    doc.text(`N° Solicitud: SOL-${String(selectedSolicitud.id).padStart(3, "0")}`, 14, 35);
    doc.text(`Fecha de Impresión: ${new Date().toLocaleDateString()}`, 14, 42);
    doc.text(`Obra/Proyecto: ${selectedSolicitud.obra_nombre}`, 14, 49);
    doc.text(`Almacén: ${selectedSolicitud.almacen_recogida_nombre || "Central"}`, 14, 56);
    doc.text(`Entregado por: ${user?.nombre || "____________________"}`, 14, 63);

    // Obtener los ítems que se planean entregar ahora mismo
    const tableRows: any[] = [];
    const itemsToDeliver = selectedSolicitud.items
      .filter((i:any) => i.saldo_pendiente > 0)
      .map((i:any) => {
        const inputEl = document.getElementById(`deliver-${i.suministro_id}`) as HTMLInputElement;
        return {
          suministro_nombre: i.suministro_nombre,
          unidad: i.unidad,
          cantidad_entregada: inputEl ? parseInt(inputEl.value || "0") : 0
        };
      })
      .filter((i:any) => i.cantidad_entregada > 0);

    if (itemsToDeliver.length === 0) {
      alert("No hay cantidades marcadas para entregar. Coloque al menos una cantidad mayor a 0 para generar la plantilla.");
      return;
    }

    itemsToDeliver.forEach((item: any) => {
      tableRows.push([
        item.suministro_nombre,
        item.unidad,
        item.cantidad_entregada,
        "" // Observaciones vacías
      ]);
    });

    autoTable(doc, {
      head: [["Suministro", "Unidad", "Cant. Entregada", "Observaciones"]],
      body: tableRows,
      startY: 75,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 40;

    // Firmas
    doc.setFontSize(10);
    doc.line(30, finalY, 90, finalY);
    doc.text("Firma Almacén", 60, finalY + 5, { align: "center" });
    doc.text(user?.nombre || "", 60, finalY + 10, { align: "center" });

    doc.line(120, finalY, 180, finalY);
    doc.text("Firma Recibí Conforme", 150, finalY + 5, { align: "center" });
    doc.text("Nombre: ____________________", 150, finalY + 12, { align: "center" });
    doc.text("C.I.: ____________________", 150, finalY + 19, { align: "center" });

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfPreview({
      url: pdfUrl,
      name: `Plantilla_Acta_SOL_${String(selectedSolicitud.id).padStart(3, "0")}.pdf`,
      title: "Vista Previa de Plantilla de Acta"
    });
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
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginLeft: "auto" }}>
            <button 
              className="btn-secondary" 
              onClick={() => setReportModalOpen(true)} 
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Reporte Entregados
            </button>
            {(user?.rol === "Administrador" || user?.rol === "Técnico" || user?.rol === "Supervisor de Obra") && (
              <button className="btn-primary" onClick={() => setModalAbierto(true)}>
                + Nueva Solicitud
              </button>
            )}
          </div>
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
          <div className="modal-content" style={{ maxWidth: "850px", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 0 }} onClick={e => e.stopPropagation()}>
            
            <div className="modal-header" style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "800" }}>SOL-{String(selectedSolicitud?.id || 0).padStart(3, "0")}</h2>
                <span className={`badge ${badgeColors[(selectedSolicitud?.estado || "").trim().toLowerCase()] || "badge-gray"}`}>
                  {selectedSolicitud?.estado}
                </span>
                {selectedSolicitud?.pdf_entrega && (
                  <button 
                    className="btn-secondary" 
                    style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    onClick={() => {
                      setPdfPreview({
                        url: `${process.env.NEXT_PUBLIC_API_URL}${selectedSolicitud.pdf_entrega}`,
                        name: `Acta_Firmada_SOL_${String(selectedSolicitud.id).padStart(3, "0")}.pdf`,
                        title: "Acta de Conformidad Firmada"
                      });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Ver Acta Firmada
                  </button>
                )}
              </div>
              <button className="modal-close" onClick={() => setDetailModalOpen(false)}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
              {detailLoading ? (
                <p style={{ textAlign: "center", padding: "3rem" }}>Cargando información detallada...</p>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", background: "var(--bg-primary)", padding: "1rem", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Obra / Proyecto</span>
                      <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{selectedSolicitud?.obra_nombre}</span>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Responsable</span>
                      <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{selectedSolicitud?.usuario_nombre}</span>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Fecha Emisión</span>
                      <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{selectedSolicitud?.fecha_solicitud ? new Date(selectedSolicitud.fecha_solicitud).toLocaleDateString() : "-"}</span>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Autorizado por</span>
                      <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{selectedSolicitud?.aprobado_por_nombre || "Pendiente"}</span>
                    </div>
                  </div>

                  {(selectedSolicitud?.entregado_por_nombre || selectedSolicitud?.pdf_entrega) && (
                    <div style={{ display: "flex", gap: "1rem" }}>
                      {selectedSolicitud?.entregado_por_nombre && (
                        <div style={{ background: "var(--bg-card)", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ fontSize: "1.5rem" }}>📦</span>
                          <div>
                            <span style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)" }}>Despachado por</span>
                            <span style={{ fontWeight: "600" }}>{selectedSolicitud.entregado_por_nombre}</span>
                          </div>
                        </div>
                      )}
                      {selectedSolicitud?.pdf_entrega && (
                        <a href={`${process.env.NEXT_PUBLIC_API_URL}${selectedSolicitud.pdf_entrega}`} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(239, 68, 68, 0.1)", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", gap: "0.75rem", color: "#ef4444", textDecoration: "none" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>Ver Acta PDF</span>
                        </a>
                      )}
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: "750", marginBottom: "1rem" }}>Suministros Solicitados</h3>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Suministro</th>
                            <th style={{ textAlign: "center" }}>Pedida</th>
                            {selectedSolicitud?.estado !== "Entregado Totalmente" && <th style={{ textAlign: "center" }}>Stock Disp.</th>}
                            <th style={{ textAlign: "center" }}>Entregado</th>
                            <th style={{ textAlign: "center" }}>Saldo</th>
                            <th style={{ textAlign: "right" }}>P. Unit</th>
                            <th style={{ textAlign: "right" }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSolicitud?.items?.map((item: any) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: "600" }}>{item.suministro_nombre}</td>
                              <td style={{ textAlign: "center" }}>{item.cantidad_solicitada} <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{item.unidad}</span></td>
                              {selectedSolicitud?.estado !== "Entregado Totalmente" && (
                                <td style={{ textAlign: "center", fontWeight: "600", color: item.stock_real < item.saldo_pendiente ? "#ef4444" : "var(--text-primary)" }}>{item.stock_real} <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{item.unidad}</span></td>
                              )}
                              <td style={{ textAlign: "center", fontWeight: "700", color: "#10b981" }}>{item.cantidad_entregada} <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{item.unidad}</span></td>
                              <td style={{ textAlign: "center", fontWeight: "700", color: item.saldo_pendiente > 0 ? "var(--accent)" : "var(--text-primary)" }}>{item.saldo_pendiente} <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{item.unidad}</span></td>
                              <td style={{ textAlign: "right" }}>Bs. {parseFloat(item.precio_unitario || 0).toLocaleString()}</td>
                              <td style={{ textAlign: "right", fontWeight: "600" }}>Bs. {((item.cantidad_solicitada || 0) * (item.precio_unitario || 0)).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={selectedSolicitud?.estado !== "Entregado Totalmente" ? 6 : 5} style={{ textAlign: "right", fontWeight: "700" }}>Total:</td>
                            <td style={{ textAlign: "right", fontWeight: "800", fontSize: "1.1rem" }}>
                              Bs. {selectedSolicitud?.items?.reduce((acc: number, item: any) => acc + (item.cantidad_solicitada * (item.precio_unitario || 0)), 0).toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {(selectedSolicitud?.estado === "Aprobado" || selectedSolicitud?.estado === "Atendiendo" || selectedSolicitud?.estado === "Listo para entrega" || selectedSolicitud?.estado === "Entregado Parcialmente") && (user?.rol === "Administrador" || user?.rol === "Almacén") && (
                    <div style={{ background: "var(--bg-primary)", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid var(--accent)", marginTop: "1rem" }}>
                      <h4 style={{ fontSize: "1rem", fontWeight: "750", marginBottom: "1.5rem", color: "var(--accent)" }}>Gestión de Despacho</h4>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        <div>
                          <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "1rem" }}>Cantidades a Entregar</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "250px", overflowY: "auto" }}>
                            {selectedSolicitud?.items?.filter((i:any) => i.saldo_pendiente > 0).map((item: any) => (
                              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
                                <div>
                                  <span style={{ display: "block", fontWeight: "600", fontSize: "0.9rem" }}>{item.suministro_nombre}</span>
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Saldo: {item.saldo_pendiente} {item.unidad}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <input 
                                    type="number" 
                                    defaultValue={item.saldo_pendiente}
                                    max={item.saldo_pendiente}
                                    min="0"
                                    id={`deliver-${item.suministro_id}`}
                                    style={{ width: "80px", textAlign: "center", fontWeight: "700", color: "var(--accent)" }}
                                  />
                                  <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>{item.unidad}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                          <div>
                            <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "1rem" }}>Acta de Conformidad (Opcional)</span>
                            <div style={{ border: "2px dashed var(--border)", padding: "1.5rem", borderRadius: "0.5rem", textAlign: "center", background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
                              <button 
                                type="button"
                                className="btn-secondary" 
                                style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}
                                onClick={generarPlantillaActa}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                Generar Plantilla PDF
                              </button>
                              
                              <div style={{ width: "100%", height: "1px", background: "var(--border)" }}></div>

                              <div>
                                <input type="file" accept=".pdf" id="pdf-upload" style={{ display: "none" }} onChange={e => {
                                  if (e.target.files && e.target.files.length > 0) setPdfFile(e.target.files[0]);
                                }} />
                                <label htmlFor="pdf-upload" className="btn-secondary" style={{ cursor: "pointer", display: "inline-block", fontSize: "0.85rem" }}>
                                  {pdfFile ? `✓ ${pdfFile.name}` : 'Subir Archivo Firmado'}
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            className="btn-primary"
                            style={{ padding: "1rem", fontSize: "1rem", marginTop: "auto" }}
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
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ padding: "1.25rem 2rem", borderTop: "1px solid var(--border)", background: "var(--bg-primary)", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={() => setDetailModalOpen(false)}>Cerrar</button>
              {selectedSolicitud?.estado === "Pendiente de Aprobación" && (user?.rol === "Administrador" || user?.rol === "Supervisor de Obra") && (
                <button className="btn-primary" onClick={() => handleAprobar(selectedSolicitud.id)}>
                  Aprobar Solicitud
                </button>
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

      {/* PDF Preview Modal */}
      {pdfPreview && (
        <div className="modal-overlay" onClick={() => setPdfPreview(null)} style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: "800px", width: "90%", height: "85vh", display: "flex", flexDirection: "column", padding: 0 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{pdfPreview.title}</h2>
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
              <iframe 
                src={pdfPreview.url} 
                title={pdfPreview.title} 
                width="100%" 
                height="100%" 
                style={{ border: "none" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Date Range Modal */}
      {reportModalOpen && (
        <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
          <form className="modal-content" style={{ maxWidth: "450px" }} onClick={e => e.stopPropagation()} onSubmit={fetchAndGeneratePDF}>
            <div className="modal-header" style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
                Generar Reporte de Entregas
              </h2>
              <button type="button" className="modal-close" onClick={() => setReportModalOpen(false)}>✕</button>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Selecciona el rango de fechas de aprobación para generar el reporte detallado.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  Fecha de Inicio
                </label>
                <input 
                  type="date" 
                  required
                  value={reportForm.startDate}
                  onChange={e => setReportForm({...reportForm, startDate: e.target.value})}
                  style={{ width: "100%", padding: "0.75rem" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  Fecha Final
                </label>
                <input 
                  type="date" 
                  required
                  value={reportForm.endDate}
                  onChange={e => setReportForm({...reportForm, endDate: e.target.value})}
                  style={{ width: "100%", padding: "0.75rem" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
              <button type="button" className="btn-secondary" onClick={() => setReportModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={reportLoading} style={{ background: "var(--green)", borderColor: "var(--green)" }}>
                {reportLoading ? "Generando..." : "Generar Reporte"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
