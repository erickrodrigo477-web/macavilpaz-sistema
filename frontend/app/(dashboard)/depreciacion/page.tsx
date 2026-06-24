"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmModal from "@/app/components/ConfirmModal";

interface ActivoDepreciacion {
  id: number;
  nombre: string;
  codigo_inventario: string;
  valor_inicial: number;
  valor_residual: number;
  vida_util: number;
  fecha_compra: string;
  anos_transcurridos: string;
  depreciacion_anual: string;
  depreciacion_acumulada_calculada: string;
  valor_actual_calculado: string;
}

export default function DepreciacionPage() {
  const { token, user } = useAuth();
  const [activos, setActivos] = useState<ActivoDepreciacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedActivo, setSelectedActivo] = useState<ActivoDepreciacion | null>(null);
  const [editForm, setEditForm] = useState({
    valor_inicial: 0,
    valor_residual: 0,
    vida_util: 1
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const esContable = (user?.rol || "").toLowerCase().includes("administrador") || (user?.rol || "").toLowerCase().includes("contabilidad");

  const fetchDepreciaciones = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/depreciacion`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setActivos(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching depreciaciones:", error);
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncConfirmOpen(false);
    setSyncing(true);
    setMensaje(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/depreciacion/sync`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (res.ok) {
        setMensaje({ texto: "Contabilidad sincronizada con éxito", tipo: 'exito' });
        fetchDepreciaciones();
      } else {
        setMensaje({ texto: "Error al sincronizar contabilidad", tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: "Error de red al sincronizar", tipo: 'error' });
    } finally {
      setSyncing(false);
      setTimeout(() => setMensaje(null), 4000);
    }
  };

  const openEditModal = (activo: ActivoDepreciacion) => {
    setSelectedActivo(activo);
    setEditForm({
      valor_inicial: Number(activo.valor_inicial) || 0,
      valor_residual: Number(activo.valor_residual) || 0,
      vida_util: Number(activo.vida_util) || 1
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivo) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/depreciacion/${selectedActivo.id}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });
      
      if (res.ok) {
        setMensaje({ texto: "Datos financieros actualizados", tipo: 'exito' });
        fetchDepreciaciones();
        setEditModalOpen(false);
      } else {
        setMensaje({ texto: "Error al actualizar valores", tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: "Error de conexión", tipo: 'error' });
    } finally {
      setSavingEdit(false);
      setTimeout(() => setMensaje(null), 4000);
    }
  };

  useEffect(() => {
    if (token) fetchDepreciaciones();
  }, [token]);

  // Calculations for global metrics
  const totalCostoInicial = activos.reduce((sum, a) => sum + (Number(a.valor_inicial) || 0), 0);
  const totalDepreciacion = activos.reduce((sum, a) => sum + (Number(a.depreciacion_acumulada_calculada) || 0), 0);
  const totalValorNeto = activos.reduce((sum, a) => sum + (Number(a.valor_actual_calculado) || 0), 0);

  const generarYPrevisualizarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Depreciacion de Activos Fijos", 14, 22);
    
    // Métricas Globales
    doc.setFontSize(11);
    doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Costo Inicial Total: $${totalCostoInicial.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 40);
    doc.text(`Depreciacion Acumulada: -$${totalDepreciacion.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 46);
    doc.text(`Valor Neto Actual: $${totalValorNeto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 52);

    // Tabla de Activos
    const tableColumn = ["Activo", "Codigo", "Vida Util", "Costo Inicial", "Depr. Acumulada", "Valor Neto"];
    const tableRows: any[] = [];

    activos.forEach(activo => {
      const activoData = [
        activo.nombre,
        activo.codigo_inventario,
        `${activo.vida_util} anos`,
        `$${(Number(activo.valor_inicial) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `-$${(Number(activo.depreciacion_acumulada_calculada) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `$${(Number(activo.valor_actual_calculado) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ];
      tableRows.push(activoData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const pdfBlobUrl = doc.output('bloburl');
    setPdfPreview(pdfBlobUrl.toString());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "auto" }}>
      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-primary)" }}>Módulo de Depreciación</h1>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Método de Línea Recta - Cálculo automático de activos fijos
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button 
              className="btn-secondary" 
              onClick={generarYPrevisualizarPDF} 
              disabled={activos.length === 0}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "0.5rem" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Reporte PDF
            </button>
            {esContable && (
              <button 
                className="btn-secondary" 
                onClick={() => setSyncConfirmOpen(true)} 
                disabled={syncing}
                style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem", 
                  padding: "0.75rem 1.25rem", borderRadius: "0.5rem",
                  color: syncing ? "var(--text-secondary)" : "var(--green)",
                  borderColor: syncing ? "var(--border)" : "rgba(16, 185, 129, 0.3)",
                  background: syncing ? "var(--bg-secondary)" : "rgba(16, 185, 129, 0.05)"
                }}
                title="Actualizar valores físicamente en la base de datos"
              >
                <svg 
                  className={syncing ? "animate-spin" : ""}
                  xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/>
                </svg>
                {syncing ? "Sincronizando..." : "Sincronizar BD"}
              </button>
            )}
          </div>
        </div>

        {/* Global Alert */}
        {mensaje && (
          <div style={{ 
            padding: "1rem 1.5rem", borderRadius: "0.75rem", 
            background: mensaje.tipo === 'exito' ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: mensaje.tipo === 'exito' ? "var(--green)" : "var(--red)",
            border: `1px solid ${mensaje.tipo === 'exito' ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
            fontSize: "0.95rem", fontWeight: "600",
            display: "flex", alignItems: "center", gap: "0.5rem"
          }}>
            {mensaje.texto}
          </div>
        )}

        {/* Summary Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem", borderLeft: "4px solid var(--accent)", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              Costo Inicial Total
            </h3>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-primary)" }}>
              ${totalCostoInicial.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="card" style={{ padding: "1.5rem", borderLeft: "4px solid var(--red)", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              Depreciación Acumulada
            </h3>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--red)" }}>
              -${totalDepreciacion.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="card" style={{ padding: "1.5rem", borderLeft: "4px solid var(--green)", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              Valor Neto Actual
            </h3>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--green)" }}>
              ${totalValorNeto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Asset Cards Grid */}
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginTop: "1rem" }}>Desglose por Activo</h2>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
            Cargando cálculos de depreciación...
          </div>
        ) : activos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "var(--bg-secondary)", borderRadius: "1rem" }}>
            No hay activos registrados.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
            {activos.map(activo => {
              const costo = Number(activo.valor_inicial) || 0;
              const acumulada = Number(activo.depreciacion_acumulada_calculada) || 0;
              const actual = Number(activo.valor_actual_calculado) || 0;
              const lifePercent = Math.min(100, (Number(activo.anos_transcurridos || 0) / (Number(activo.vida_util) || 1)) * 100);
              const isDead = lifePercent >= 100;

              return (
                <div key={activo.id} className="card" style={{ 
                  padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)", position: "relative",
                  border: isDead ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid var(--border)"
                }}>
                  
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>{activo.nombre}</h3>
                      <code style={{ fontSize: "0.75rem", color: "var(--accent)" }}>{activo.codigo_inventario}</code>
                    </div>
                    {esContable && (
                      <button 
                        className="btn-secondary btn-small" 
                        onClick={() => openEditModal(activo)}
                        style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", borderRadius: "0.5rem" }}
                      >
                        Editar Valores
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {costo > 0 && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.4rem", fontWeight: "600" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Vida Útil: {activo.vida_util} años</span>
                        <span style={{ color: isDead ? "var(--red)" : "var(--accent)" }}>{lifePercent.toFixed(1)}% Consumida</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "var(--bg-secondary)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ 
                          width: `${lifePercent}%`, height: "100%", 
                          background: isDead ? "var(--red)" : "var(--accent)", 
                          transition: "width 0.5s ease-in-out"
                        }}></div>
                      </div>
                    </div>
                  )}

                  {/* Financial Data Grid */}
                  {costo === 0 ? (
                    <div style={{ padding: "1.25rem 1rem", background: "rgba(239, 68, 68, 0.05)", border: "1px dashed rgba(239, 68, 68, 0.3)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ef4444" }}>
                        No se pusieron o no se tienen valores para calcular la depreciación
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: "var(--bg-secondary)", padding: "1rem", borderRadius: "0.75rem" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Costo Inicial</div>
                        <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                          ${costo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Depr. Acumulada</div>
                        <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--red)" }}>
                          -${acumulada.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Depr. Anual</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                          ${(Number(activo.depreciacion_anual) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Valor Actual Neto</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--green)" }}>
                          ${actual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Edit Modal */}
      {editModalOpen && selectedActivo && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <form 
            className="modal-content" 
            style={{ maxWidth: "450px" }} 
            onClick={e => e.stopPropagation()} 
            onSubmit={handleEditSubmit}
          >
            <div className="modal-header" style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
                Editar Valores Financieros
              </h2>
              <button type="button" className="modal-close" onClick={() => setEditModalOpen(false)}>✕</button>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Activo: <strong style={{ color: "var(--text-primary)" }}>{selectedActivo.nombre}</strong>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  Costo Inicial ($)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={editForm.valor_inicial}
                  onChange={e => setEditForm({...editForm, valor_inicial: Number(e.target.value)})}
                  style={{ width: "100%", padding: "0.75rem" }}
                />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Vida Útil (Años)
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={editForm.vida_util}
                    onChange={e => setEditForm({...editForm, vida_util: Number(e.target.value)})}
                    style={{ width: "100%", padding: "0.75rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Valor Residual ($)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={editForm.valor_residual}
                    onChange={e => setEditForm({...editForm, valor_residual: Number(e.target.value)})}
                    style={{ width: "100%", padding: "0.75rem" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
              <button type="button" className="btn-secondary" onClick={() => setEditModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={savingEdit}>
                {savingEdit ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PDF Preview Modal */}
      {pdfPreview && (
        <div className="modal-overlay" onClick={() => setPdfPreview(null)} style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: "800px", width: "90%", height: "85vh", display: "flex", flexDirection: "column", padding: 0 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Vista Previa del Reporte</h2>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <a 
                  href={pdfPreview} 
                  download="reporte_depreciacion.pdf" 
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
                src={pdfPreview} 
                title="PDF Preview" 
                width="100%" 
                height="100%" 
                style={{ border: "none" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sync Confirm Modal */}
      <ConfirmModal
        isOpen={syncConfirmOpen}
        title="Sincronizar BD Contable"
        message="¿Estás seguro de sincronizar los valores calculados con la base de datos contable? Esta acción actualizará los valores físicos."
        onConfirm={handleSync}
        onCancel={() => setSyncConfirmOpen(false)}
        confirmText="Sincronizar"
        confirmColor="var(--green)"
      />
    </div>
  );
}
