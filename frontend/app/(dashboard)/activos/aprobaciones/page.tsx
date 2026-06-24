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
}

export default function AprobacionesActivosPage() {
  const { token } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleUpdateEstado = async (id: number, nuevoEstado: string) => {
    const comentario = nuevoEstado === 'rechazado' ? prompt("Motivo del rechazo:") : null;
    if (nuevoEstado === 'rechazado' && comentario === null) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activos/solicitudes/${id}/estado`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado, comentario }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'badge-yellow';
      case 'aprobado': return 'badge-green';
      case 'rechazado': return 'badge-red';
      case 'asignado': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
        Panel de Aprobación de Activos
      </h1>

      <div className="card overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Activo</th>
              <th>Solicitante</th>
              <th>Obra</th>
              <th>Periodo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-4">Cargando...</td></tr>
            ) : solicitudes.filter(s => s.estado === 'pendiente').map(s => (
              <tr key={s.id}>
                <td>{s.activo_nombre}</td>
                <td>{s.solicitante_nombre}</td>
                <td>{s.obra_nombre}</td>
                <td className="text-xs">
                  {new Date(s.fecha_inicio).toLocaleDateString()} - {new Date(s.fecha_fin).toLocaleDateString()}
                </td>
                <td><span className={`badge ${getStatusBadge(s.estado)}`}>{s.estado}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn-primary btn-small" onClick={() => handleUpdateEstado(s.id, 'aprobado')}>Aprobar</button>
                    <button className="btn-danger btn-small" onClick={() => handleUpdateEstado(s.id, 'rechazado')}>Rechazar</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && solicitudes.filter(s => s.estado === 'pendiente').length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No hay solicitudes pendientes</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold mt-10 mb-4 text-gray-400">Historial Reciente</h2>
      <div className="card overflow-hidden opacity-80">
        <table>
          <tbody>
            {solicitudes.filter(s => s.estado !== 'pendiente').slice(0, 5).map(s => (
              <tr key={s.id}>
                <td className="w-1/3">{s.activo_nombre}</td>
                <td>{s.obra_nombre}</td>
                <td><span className={`badge ${getStatusBadge(s.estado)}`}>{s.estado}</span></td>
                <td className="text-right text-gray-500 text-xs">{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
