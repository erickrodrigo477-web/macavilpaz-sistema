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

export default function SolicitudesActivosPage() {
  const { token, user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [entregaActivo, setEntregaActivo] = useState<number | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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
      // Aceptamos tanto 'disponible' como 'operativo'
      setActivos(Array.isArray(actData) ? actData.filter(a => a.estado === 'disponible' || a.estado === 'operativo') : []);
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
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Solicitar Equipo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Activo Disponible</label>
                <select required value={formData.activo_id} onChange={e => setFormData({...formData, activo_id: e.target.value})}>
                  <option value="">Seleccione equipo...</option>
                  {activos.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.estado})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Obra</label>
                <select required value={formData.obra_id} onChange={e => setFormData({...formData, obra_id: e.target.value})}>
                  <option value="">Seleccione obra...</option>
                  {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha Inicio</label>
                  <input type="date" required value={formData.fecha_inicio} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} />
                </div>
                <div>
                  <label className="label">Fecha Fin</label>
                  <input type="date" required value={formData.fecha_fin} onChange={e => setFormData({...formData, fecha_fin: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Motivo / Comentario</label>
                <textarea value={formData.comentario} onChange={e => setFormData({...formData, comentario: e.target.value})} />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" className="btn-secondary flex-1" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Enviar Solicitud</button>
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
