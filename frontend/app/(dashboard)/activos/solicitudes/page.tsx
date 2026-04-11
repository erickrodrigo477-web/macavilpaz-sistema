"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface Solicitud {
  id: number;
  activo_nombre: string;
  obra_nombre: string;
  solicitante_nombre: string;
  fecha_solicitud: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  comentario: string;
  aprobado_por_nombre?: string;
  entregado_por_nombre?: string;
  pdf_entrega?: string;
}

interface Activo { id: number; nombre: string; estado: string; }
interface Obra { id: number; nombre: string; }
interface ScheduleEntry { id: number; fecha_inicio: string; fecha_fin: string; estado: string; }

export default function SolicitudesActivosPage() {
  const { token, user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [entregaActivo, setEntregaActivo] = useState<number | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [activoSchedule, setActivoSchedule] = useState<ScheduleEntry[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    activo_id: "",
    obra_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    comentario: ""
  });

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [solRes, actRes, obrRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obras`, { headers })
      ]);
      
      if (!solRes.ok || !actRes.ok || !obrRes.ok) {
        throw new Error("Error en una de las peticiones");
      }

      const [solData, actData, obrData] = await Promise.all([solRes.json(), actRes.json(), obrRes.json()]);
      
      setSolicitudes(Array.isArray(solData) ? solData : []);
      // Mostramos equipos operativos o asignados (reservables para el futuro)
      const reservables = ['operativo', 'disponible', 'asignado'];
      setActivos(Array.isArray(actData) ? actData.filter(a => reservables.includes((a.estado || "").toLowerCase())) : []);
      setObras(Array.isArray(obrData) ? obrData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Fetch schedule when internal asset selection changes
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!formData.activo_id || !token) {
        setActivoSchedule([]);
        return;
      }
      setScheduleLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes/${formData.activo_id}/schedule`, {
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
  }, [formData.activo_id, token]);

  // Validate overlap whenever dates change
  useEffect(() => {
    if (!formData.fecha_inicio || !formData.fecha_fin || activoSchedule.length === 0) {
      setOverlapError(null);
      return;
    }

    const start = new Date(formData.fecha_inicio);
    const end = new Date(formData.fecha_fin);

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
  }, [formData.fecha_inicio, formData.fecha_fin, activoSchedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({ activo_id: "", obra_id: "", fecha_inicio: "", fecha_fin: "", comentario: "" });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEntregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entregaActivo) return;
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("estado", "Entregado");
      if (pdfFile) formDataUpload.append("pdf_entrega", pdfFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes/${entregaActivo}/estado`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
        body: formDataUpload,
      });

      if (res.ok) {
        setEntregaActivo(null);
        setPdfFile(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (estado: string) => {
    const normalized = (estado || "").trim().toLowerCase();
    switch (normalized) {
      case 'pendiente': return 'badge-yellow';
      case 'aprobado': return 'badge-green';
      case 'atendiendo': return 'badge-purple';
      case 'listo para entrega': return 'badge-orange';
      case 'rechazado': return 'badge-red';
      case 'asignado': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Solicitudes de Activos Fijos
        </h1>
        {((user?.rol || "").toLowerCase().includes('técnico') || (user?.rol || "").toLowerCase().includes('supervisor')) && (
          <button id="btn-nueva-solicitud" className="btn-primary" onClick={() => { console.log("Opening modal..."); setModalOpen(true); }}> Nueva Solicitud </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Activo</th>
              <th>Obra</th>
              <th>Solicitante</th>
              <th>Periodo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Cargando...</td></tr>
            ) : solicitudes.map(s => (
              <tr key={s.id}>
                <td>{s.activo_nombre}</td>
                <td>{s.obra_nombre}</td>
                <td>{s.solicitante_nombre}</td>
                <td className="text-xs text-gray-400">
                  {(() => {
                    try {
                      return `${new Date(s.fecha_inicio).toLocaleDateString()} - ${new Date(s.fecha_fin).toLocaleDateString()}`;
                    } catch (e) {
                      return "Fecha inválida";
                    }
                  })()}
                  {(s.aprobado_por_nombre || s.entregado_por_nombre) && (
                    <div className="mt-2 text-[10px] text-gray-500 flex flex-col gap-0.5">
                      {s.aprobado_por_nombre && <span><strong>Aprobó:</strong> {s.aprobado_por_nombre}</span>}
                      {s.entregado_por_nombre && <span><strong>Entregó:</strong> {s.entregado_por_nombre}</span>}
                      {s.pdf_entrega && (
                        <a href={`${process.env.NEXT_PUBLIC_API_URL}${s.pdf_entrega}`} target="_blank" rel="noopener noreferrer" 
                           style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.6rem", borderRadius: "9999px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(239, 68, 68, 0.2)", width: "fit-content" }}
                           className="hover:bg-red-50 mt-1 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
                          </svg>
                          Documento de Respaldo
                        </a>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`badge ${getStatusBadge(s.estado)}`}
                    >
                      {s.estado}
                    </span>
                    {(user?.rol === 'Administrador' || user?.rol === 'Almacén') && (
                      <div className="flex gap-1">
                        {s.estado === 'aprobado' && (
                          <button 
                            className="btn-secondary px-2 py-0.5 text-[10px]" 
                            onClick={async () => {
                              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes/${s.id}/estado`, {
                                method: 'PATCH',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ estado: 'atendiendo' })
                              });
                              fetchData();
                            }}
                          >
                            Atender
                          </button>
                        )}
                        {s.estado === 'atendiendo' && (
                          <button 
                            className="btn-primary px-2 py-0.5 text-[10px]" 
                            onClick={() => {
                              setEntregaActivo(s.id);
                              setPdfFile(null);
                            }}
                          >
                            Entregar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => { setModalOpen(false); setOverlapError(null); }}>
          <div className="modal-content max-w-xl border-t-4 border-accent" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="text-xl font-black text-primary">Solicitar Equipo</h2>
                <p className="text-xs text-secondary mt-1 italic">Sigue los pasos para reservar un activo.</p>
              </div>
              <button className="modal-close" onClick={() => { setModalOpen(false); setOverlapError(null); }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PASO 1: SELECCIÓN */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest">
                  <span className="w-5 h-5 rounded-full bg-accent text-white flex-center text-[10px]">1</span>
                  Selección de Equipo
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[10px]">Activo Fijo</label>
                    <select required value={formData.activo_id} onChange={e => setFormData({...formData, activo_id: e.target.value})} className="bg-gray-800">
                      <option value="">Seleccionar...</option>
                      {activos.map(a => <option key={a.id} value={a.id}>{a.nombre} [{a.estado}]</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label text-[10px]">Obra de Destino</label>
                    <select required value={formData.obra_id} onChange={e => setFormData({...formData, obra_id: e.target.value})} className="bg-gray-800">
                      <option value="">Seleccionar...</option>
                      {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* PASO 2: CRONOGRAMA */}
              {formData.activo_id && (
                <div className="space-y-3 p-4 bg-gray-900/50 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex-center text-[10px]">2</span>
                      Disponibilidad Histórica
                    </div>
                    <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Verifica las fechas</span>
                  </div>
                  
                  {scheduleLoading ? (
                    <div className="flex-center py-4 gap-2 text-xs text-gray-500">
                      <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                      Consultando calendario...
                    </div>
                  ) : activoSchedule.length === 0 ? (
                    <div className="text-[11px] text-green-400/80 bg-green-500/5 p-3 rounded-lg border border-green-500/20 flex items-center gap-2">
                       ✅ Este equipo no tiene reservas próximas. ¡Está totalmente libre!
                    </div>
                  ) : (
                    <div className="max-h-32 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
                      {activoSchedule.map(entry => (
                         <div key={entry.id} className="text-[10px] flex justify-between items-center bg-gray-800/80 p-2 rounded-lg border border-white/5">
                            <div className="flex gap-2 items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                              <span className="text-gray-300 font-medium">
                                {new Date(entry.fecha_inicio).toLocaleDateString()} al {new Date(entry.fecha_fin).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                              entry.estado === 'Aprobado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                              entry.estado === 'Entregado' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                              {entry.estado}
                            </span>
                         </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PASO 3: FECHAS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-widest">
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex-center text-[10px]">3</span>
                  Periodo de Solicitud
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[10px]">Desde</label>
                    <input type="date" required value={formData.fecha_inicio} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} className="bg-gray-800 text-xs" />
                  </div>
                  <div>
                    <label className="label text-[10px]">Hasta</label>
                    <input type="date" required value={formData.fecha_fin} onChange={e => setFormData({...formData, fecha_fin: e.target.value})} className="bg-gray-800 text-xs" />
                  </div>
                </div>
                {overlapError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    {overlapError}
                  </div>
                )}
              </div>

              {/* PASO 4: EXTRA */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                  <span className="w-5 h-5 rounded-full bg-gray-600 text-white flex-center text-[10px]">4</span>
                  Detalles Finales
                </div>
                <textarea className="bg-gray-800 border-gray-700 text-xs min-h-[80px]" placeholder="¿Para qué se necesita el equipo?..." value={formData.comentario} onChange={e => setFormData({...formData, comentario: e.target.value})} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" className="btn-secondary flex-1 py-3" onClick={() => { setModalOpen(false); setOverlapError(null); }}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1 py-3 text-sm" disabled={!!overlapError || !formData.activo_id || scheduleLoading}>
                  {overlapError ? 'Bloqueado por Cruce' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {entregaActivo && (
        <div className="modal-overlay" onClick={() => setEntregaActivo(null)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Confirmar Entrega</h2>
            <form onSubmit={handleEntregar} className="space-y-4">
              <div>
                <label className="label">PDF Respaldo de Entrega (Opcional)</label>
                <input type="file" accept=".pdf" className="w-full text-sm mt-1" onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    setPdfFile(e.target.files[0]);
                  }
                }} />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" className="btn-secondary flex-1" onClick={() => setEntregaActivo(null)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Finalizar Entrega</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
