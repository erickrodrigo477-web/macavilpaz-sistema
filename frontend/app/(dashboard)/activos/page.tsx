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
}

const estadoBadge: Record<string, { cls: string; label: string }> = {
  operativo:      { cls: "badge badge-green",  label: "Operativo" },
  mantenimiento:  { cls: "badge badge-yellow", label: "Mantenimiento" },
  fuera_servicio: { cls: "badge badge-red",    label: "Fuera de Servicio" },
  asignado:       { cls: "badge badge-blue",   label: "Asignado" },
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
  
  // Formulario para activo
  const initialForm = {
    nombre: "",
    codigo_inventario: "",
    descripcion: "",
    fecha_compra: new Date().toISOString().split("T")[0],
    estado: "operativo",
    ubicacion: "",
    valor_inicial: 0,
    valor_actual: 0,
    depreciacion_acumulada: 0
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

  useEffect(() => {
    if (token) fetchActivos();
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
        depreciacion_acumulada: activo.depreciacion_acumulada || 0
      });
    } else {
      setEditandoId(null);
      setFormData(initialForm);
    }
    setModalAbierto(true);
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
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera_servicio">Fuera de Servicio</option>
            <option value="asignado">Asignado</option>
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
                  <th>Ubicación</th>
                  {puedeEditarFinanciero && <th>Valor Actual</th>}
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filtrados.map(activo => (
                  <tr key={activo.id}>
                    <td><code style={{ fontSize: "0.8rem", color: "var(--accent)" }}>{activo.codigo_inventario}</code></td>
                    <td style={{ fontWeight: "500" }}>{activo.nombre}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{activo.ubicacion || "-"}</td>
                    {puedeEditarFinanciero && (
                      <td style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                        {activo.valor_actual ? `$${Number(activo.valor_actual).toLocaleString()}` : "$0"}
                      </td>
                    )}
                    <td>
                      <span className={estadoBadge[activo.estado]?.cls || "badge badge-gray"}>
                        {estadoBadge[activo.estado]?.label || activo.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
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
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Solo lectura</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Crear/Editar Activo */}
      {modalAbierto && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }} onClick={() => setModalAbierto(false)}>
          <form className="card" style={{ width: "100%", maxWidth: "600px", padding: "2rem", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
                {editandoId ? "Editar Activo Fijo" : "Nuevo Activo Fijo"}
              </h2>
              <button 
                type="button" 
                onClick={() => setModalAbierto(false)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.5rem" }}
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
                <input 
                  disabled={!puedeEditarFisico}
                  placeholder="Ej: Almacén Central" 
                  value={formData.ubicacion}
                  onChange={e => setFormData({...formData, ubicacion: e.target.value})}
                  style={{ width: "100%" }}
                />
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
                  <option value="operativo">Operativo</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="fuera_servicio">Fuera de Servicio</option>
                  <option value="asignado">Asignado</option>
                </select>
              </div>

              {/* Sección Financiera (Contabilidad) */}
              <div style={{ gridColumn: "span 2", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", marginTop: "1rem" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--green)" }}>Control Financiero (Contabilidad)</h3>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Valor Inicial</label>
                <input 
                  type="number"
                  disabled={!puedeEditarFinanciero}
                  value={formData.valor_inicial}
                  onChange={e => setFormData({...formData, valor_inicial: Number(e.target.value)})}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Valor Actual</label>
                <input 
                  type="number"
                  disabled={!puedeEditarFinanciero}
                  value={formData.valor_actual}
                  onChange={e => setFormData({...formData, valor_actual: Number(e.target.value)})}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Depreciación Acumulada</label>
                <input 
                  type="number"
                  disabled={!puedeEditarFinanciero}
                  value={formData.depreciacion_acumulada}
                  onChange={e => setFormData({...formData, depreciacion_acumulada: Number(e.target.value)})}
                  style={{ width: "100%" }}
                />
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
    </div>
  );
}
