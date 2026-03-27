"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/app/components/ConfirmModal";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  creado_en: string;
}

interface Rol {
  id: number;
  nombre: string;
}

const rolColor: Record<string, string> = {
  "administrador":      "badge badge-blue",
  "almacen":            "badge badge-orange",
  "supervisor":         "badge badge-yellow",
  "tecnico":            "badge badge-gray",
  "contabilidad":       "badge badge-green",
};

function getRolBadgeClass(rol: string) {
  if (!rol) return "badge badge-gray";
  const normalized = rol.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .trim();
  
  if (normalized.includes("almacen")) return rolColor["almacen"];
  if (normalized.includes("admin")) return rolColor["administrador"];
  if (normalized.includes("supervisor")) return rolColor["supervisor"];
  if (normalized.includes("tecnico")) return rolColor["tecnico"];
  if (normalized.includes("conta")) return rolColor["contabilidad"];
  
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol_id: ""
  });

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalAbierto(false);
        setFormData({ nombre: "", email: "", password: "", rol_id: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setIdAEliminar(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!idAEliminar) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${idAEliminar}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
        setDeleteModalOpen(false);
        setIdAEliminar(null);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
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
          <select 
            style={{ maxWidth: "240px" }} 
            value={rolFiltro}
            onChange={e => setRolFiltro(e.target.value)}
          >
            <option value="todos">Todos los roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.nombre}>{r.nombre}</option>
            ))}
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
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>Cargando usuarios...</td></tr>
              ) : filtrados.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: "34px", height: "34px",
                        borderRadius: "50%",
                        background: "var(--accent)",
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
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{u.creado_en ? new Date(u.creado_en).toLocaleDateString() : "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn-secondary" style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem" }}>Editar</button>
                      <button onClick={() => handleDeleteClick(u.id)} style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem", background: "#7f1d1d33", color: "#f87171", border: "1px solid #7f1d1d55", borderRadius: "0.375rem", cursor: "pointer" }}>
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
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "#00000080", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }} onClick={() => setModalAbierto(false)}>
          <form className="card" style={{ width: "100%", maxWidth: "450px", padding: "1.75rem" }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.5rem" }}>Nuevo Usuario</h2>
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
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Contraseña</label>
                <input type="password" required placeholder="********" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Rol</label>
                <select required value={formData.rol_id} onChange={e => setFormData({...formData, rol_id: e.target.value})}>
                  <option value="">Seleccionar rol...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Crear Usuario</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="¿Eliminar usuario?"
        message="Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema."
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setIdAEliminar(null);
        }}
      />
    </div>
  );
}
