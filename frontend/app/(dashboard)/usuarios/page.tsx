"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/app/components/ConfirmModal";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  rol_id: number;
  creado_en: string;
  activo: boolean;
}

interface Rol {
  id: number;
  nombre: string;
}

const rolColor: Record<string, string> = {
  "administrador": "badge badge-blue",
  "almacen":       "badge badge-orange",
  "supervisor":    "badge badge-yellow",
  "tecnico":       "badge badge-gray",
  "contabilidad":  "badge badge-green",
};

function getRolBadgeClass(rol: string) {
  if (!rol) return "badge badge-gray";
  const normalized = rol.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  if (normalized.includes("almacen")) return rolColor["almacen"];
  if (normalized.includes("admin"))   return rolColor["administrador"];
  if (normalized.includes("supervisor")) return rolColor["supervisor"];
  if (normalized.includes("tecnico")) return rolColor["tecnico"];
  if (normalized.includes("conta"))   return rolColor["contabilidad"];
  return "badge badge-gray";
}

function initials(nombre: string) {
  return nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState("todos");

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  // Disable/enable modal
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [usuarioAToggle, setUsuarioAToggle] = useState<Usuario | null>(null);

  // Change rol modal
  const [rolModalOpen, setRolModalOpen] = useState(false);
  const [usuarioARol, setUsuarioARol] = useState<Usuario | null>(null);
  const [nuevoRolId, setNuevoRolId] = useState("");

  const [formData, setFormData] = useState({
    nombre: "", email: "", rol_id: ""
  });
  const [submitMsg, setSubmitMsg] = useState<{ texto: string; tipo: "ok" | "warn" } | null>(null);

  const fetchData = async () => {
    try {
      const [usrRes, rolRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/roles`)
      ]);
      const [usrData, rolData] = await Promise.all([usrRes.json(), rolRes.json()]);
      setUsuarios(usrData);
      setRoles(rolData);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.advertencia) {
          setSubmitMsg({ texto: data.advertencia, tipo: "warn" });
        } else {
          setModalAbierto(false);
          setSubmitMsg(null);
        }
        setFormData({ nombre: "", email: "", rol_id: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
    }
  };

  const confirmDelete = async () => {
    if (!idAEliminar) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${idAEliminar}`, { method: "DELETE" });
      fetchData();
      setDeleteModalOpen(false);
      setIdAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const confirmToggle = async () => {
    if (!usuarioAToggle) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${usuarioAToggle.id}/estado`, { method: "PATCH" });
      fetchData();
      setToggleModalOpen(false);
      setUsuarioAToggle(null);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const confirmCambiarRol = async () => {
    if (!usuarioARol || !nuevoRolId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${usuarioARol.id}/rol`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol_id: nuevoRolId }),
      });
      fetchData();
      setRolModalOpen(false);
      setUsuarioARol(null);
      setNuevoRolId("");
    } catch (error) {
      console.error("Error al cambiar rol:", error);
    }
  };

  const filtrados = usuarios.filter(u => {
    const coincideBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.email.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = rolFiltro === "todos" || u.rol === rolFiltro;
    return coincideBusqueda && coincideRol;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "auto" }}>
      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <input
            placeholder="Buscar usuario..."
            style={{ maxWidth: "280px" }}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <select style={{ maxWidth: "240px" }} value={rolFiltro} onChange={e => setRolFiltro(e.target.value)}>
            <option value="todos">Todos los roles</option>
            {roles.map(r => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
          </select>
          <button className="btn-primary" style={{ marginLeft: "auto" }} onClick={() => setModalAbierto(true)}>
            + Nuevo Usuario
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>Cargando usuarios...</td></tr>
              ) : filtrados.map(u => (
                <tr key={u.id} style={{ opacity: u.activo === false ? 0.5 : 1 }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        background: u.activo === false ? "var(--border)" : "var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: "700", color: "white", flexShrink: 0,
                      }}>
                        {initials(u.nombre)}
                      </div>
                      <span style={{ fontWeight: "500" }}>{u.nombre}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{u.email}</td>
                  <td><span className={getRolBadgeClass(u.rol)}>{u.rol}</span></td>
                  <td>
                    <span className={u.activo !== false ? "badge badge-green" : "badge badge-red"}>
                      {u.activo !== false ? "Activo" : "Deshabilitado"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    {u.creado_en ? new Date(u.creado_en).toLocaleDateString() : "-"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {/* Cambiar Rol */}
                      <button
                        className="btn-secondary"
                        style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem" }}
                        onClick={() => { setUsuarioARol(u); setNuevoRolId(String(u.rol_id)); setRolModalOpen(true); }}
                      >
                        Cambiar Rol
                      </button>
                      {/* Habilitar / Deshabilitar */}
                      <button
                        style={{
                          padding: "0.25rem 0.625rem", fontSize: "0.75rem", cursor: "pointer", borderRadius: "0.375rem",
                          border: u.activo !== false ? "1px solid #78350f55" : "1px solid #14532d55",
                          background: u.activo !== false ? "#78350f22" : "#14532d22",
                          color: u.activo !== false ? "#fbbf24" : "#4ade80",
                        }}
                        onClick={() => { setUsuarioAToggle(u); setToggleModalOpen(true); }}
                      >
                        {u.activo !== false ? "Deshabilitar" : "Habilitar"}
                      </button>
                      {/* Eliminar */}
                      <button
                        onClick={() => { setIdAEliminar(u.id); setDeleteModalOpen(true); }}
                        style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem", background: "#7f1d1d33", color: "#f87171", border: "1px solid #7f1d1d55", borderRadius: "0.375rem", cursor: "pointer" }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Nuevo Usuario */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <form className="modal-content" style={{ maxWidth: "450px" }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-header" style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Nuevo Usuario</h2>
              <button type="button" className="modal-close" onClick={() => { setModalAbierto(false); setSubmitMsg(null); }}>✕</button>
            </div>
            {submitMsg && (
              <div style={{
                padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "0.5rem", fontSize: "0.85rem",
                background: submitMsg.tipo === "warn" ? "#78350f22" : "#14532d22",
                color: submitMsg.tipo === "warn" ? "#fbbf24" : "#4ade80",
                border: `1px solid ${submitMsg.tipo === "warn" ? "#78350f55" : "#14532d55"}`,
              }}>
                {submitMsg.texto}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Nombre Completo</label>
                <input required placeholder="Ej: Juan Pérez" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Correo Electrónico</label>
                <input type="email" required placeholder="juan@macavilpaz.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Rol</label>
                <select required value={formData.rol_id} onChange={e => setFormData({...formData, rol_id: e.target.value})}>
                  <option value="">Seleccionar rol...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => { setModalAbierto(false); setSubmitMsg(null); }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Crear y Enviar Correo</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal Cambiar Rol */}
      {rolModalOpen && usuarioARol && (
        <div className="modal-overlay" onClick={() => setRolModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "400px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Cambiar Rol</h2>
              <button type="button" className="modal-close" onClick={() => setRolModalOpen(false)}>✕</button>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Asigna un nuevo rol a <strong style={{ color: "var(--text-primary)" }}>{usuarioARol.nombre}</strong>.
            </p>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Nuevo Rol</label>
              <select value={nuevoRolId} onChange={e => setNuevoRolId(e.target.value)}>
                <option value="">Seleccionar...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setRolModalOpen(false)}>Cancelar</button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={!nuevoRolId || nuevoRolId === String(usuarioARol.rol_id)}
                onClick={confirmCambiarRol}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm: Habilitar/Deshabilitar */}
      <ConfirmModal
        isOpen={toggleModalOpen}
        title={usuarioAToggle?.activo !== false ? "Deshabilitar usuario" : "Habilitar usuario"}
        message={
          usuarioAToggle?.activo !== false
            ? `El usuario "${usuarioAToggle?.nombre}" no podrá ingresar al sistema hasta que lo habilites nuevamente.`
            : `El usuario "${usuarioAToggle?.nombre}" recuperará el acceso al sistema.`
        }
        onConfirm={confirmToggle}
        onCancel={() => { setToggleModalOpen(false); setUsuarioAToggle(null); }}
        confirmText={usuarioAToggle?.activo !== false ? "Deshabilitar" : "Habilitar"}
        confirmColor={usuarioAToggle?.activo !== false ? "#f59e0b" : "var(--green)"}
      />

      {/* Confirm: Eliminar */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Eliminar usuario"
        message="Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema."
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setIdAEliminar(null); }}
      />
    </div>
  );
}
