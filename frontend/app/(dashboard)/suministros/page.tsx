"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface Suministro {
  id: number;
  nombre: string;
  unidad: string;
  stock: number;
  categoria_id: number;
  categoria_nombre: string;
  descripcion: string;
  precio_unitario: number | string;
  stock_critico?: number | string;
  breakdown?: { almacen_id: number; almacen_nombre: string; stock: number }[];
}

interface Categoria {
  id: number;
  nombre: string;
}

function stockBadge(stock: number, stock_critico?: number | string) {
  const critico = typeof stock_critico === 'number' ? stock_critico : parseFloat(stock_critico as string) || 10;
  if (stock <= critico)  return { cls: "badge badge-red",    label: "Bajo" };
  if (stock <= critico * 5)  return { cls: "badge badge-yellow", label: "Medio" };
  return { cls: "badge badge-green", label: "OK" };
}

export default function SuministrosPage() {
  const { user, token } = useAuth();
  const [suministros, setSuministros] = useState<Suministro[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [editando, setEditando] = useState<Suministro | null>(null);
  const [almacenes, setAlmacenes] = useState<{id: number, nombre: string}[]>([]);
  
  // Reabastecer state
  const [selectedAlmacenRestock, setSelectedAlmacenRestock] = useState("");
  const [restockItems, setRestockItems] = useState([{ suministro_id: "", cantidad: 0 }]);

  // Mover Stock state
  const [moverModalOpen, setMoverModalOpen] = useState(false);
  const [suministroParaMover, setSuministroParaMover] = useState<Suministro | null>(null);
  const [movimientoForm, setMovimientoForm] = useState({
    almacen_origen_id: "",
    almacen_destino_id: "",
    cantidad: 1
  });

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    unidad: "unidad",
    stock: 0,
    categoria_id: "",
    precio_unitario: 0,
    stock_critico: 0,
    almacen_id: ""
  });


  const fetchData = async () => {
    try {
      const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
      const [sumRes, catRes, almRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suministros`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suministros/categorias`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/almacenes`, { headers })
      ]);
      const [sumData, catData, almData] = await Promise.all([sumRes.json(), catRes.json(), almRes.json()]);
      setSuministros(Array.isArray(sumData) ? sumData : []);
      setCategorias(Array.isArray(catData) ? catData : []);
      setAlmacenes(Array.isArray(almData) ? almData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (sum: Suministro | null = null) => {
    if (sum) {
      setEditando(sum);
      setFormData({
        nombre: sum.nombre,
        descripcion: sum.descripcion || "",
        unidad: sum.unidad,
        stock: sum.stock,
        categoria_id: sum.categoria_id.toString(),
        precio_unitario: typeof sum.precio_unitario === 'number' ? sum.precio_unitario : parseFloat(sum.precio_unitario || "0"),
        stock_critico: typeof sum.stock_critico === 'number' ? sum.stock_critico : parseFloat((sum.stock_critico as string) || "0"),
        almacen_id: ""
      });
    } else {
      setEditando(null);
      setFormData({ nombre: "", descripcion: "", unidad: "unidad", stock: 0, categoria_id: "", precio_unitario: 0, stock_critico: 0, almacen_id: "" });
    }
    setModalAbierto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editando 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/suministros/${editando.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/suministros`;
    
    const method = editando ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalAbierto(false);
        fetchData();
        showNotify(editando ? "Cambios guardados." : "Suministro creado.");
      } else {
        const errorData = await res.json();
        showNotify(errorData.mensaje || "Error al procesar solicitud", 'error');
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      showNotify("Error de conexión", 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este suministro?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suministros/${id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (res.ok) {
        fetchData();
        showNotify("Suministro eliminado.");
      } else {
        const data = await res.json();
        showNotify(data.mensaje || "No se pudo eliminar", 'error');
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      showNotify("Error de conexión", 'error');
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;
    
    // Validar que haya items con cantidad > 0
    const items = restockItems.filter(i => i.suministro_id && i.cantidad > 0);
    if (items.length === 0) {
      alert("Por favor, añada al menos un material con cantidad válida.");
      return;
    }

    if (!selectedAlmacenRestock) {
      alert("Debe seleccionar un almacén de destino para el reabastecimiento.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suministros/restock`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          usuario_id: user.id,
          almacen_id: parseInt(selectedAlmacenRestock)
        }),
      });

      if (res.ok) {
        setRestockModalOpen(false);
        fetchData();
        showNotify("Reabastecimiento completado.");
      } else {
        const errorData = await res.json();
        showNotify(errorData.mensaje || "Error al reabastecer", 'error');
      }
    } catch (error) {
      console.error("Error al reabastecer:", error);
      showNotify("Error de conexión", 'error');
    }
  };

  const handleMoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token || !suministroParaMover) return;
    
    if (movimientoForm.almacen_origen_id === movimientoForm.almacen_destino_id) {
      alert("El almacén de origen y destino no pueden ser el mismo.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/almacenes/mover-stock`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          suministro_id: suministroParaMover.id,
          almacen_origen_id: parseInt(movimientoForm.almacen_origen_id),
          almacen_destino_id: parseInt(movimientoForm.almacen_destino_id),
          cantidad: movimientoForm.cantidad
        }),
      });

      if (res.ok) {
        setMoverModalOpen(false);
        fetchData();
        showNotify("Stock movido exitosamente.");
      } else {
        const errorData = await res.json();
        showNotify(errorData.mensaje || "Error al mover stock", 'error');
      }
    } catch (error) {
      console.error("Error al mover stock:", error);
      showNotify("Error de conexión", 'error');
    }
  };


  const filtrados = suministros.filter(s => {
    const coincideBusqueda = s.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = categoriaFiltro === "todas" || s.categoria_id.toString() === categoriaFiltro;
    return coincideBusqueda && coincideCat;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "auto" }}>
      <main style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
            <input 
              placeholder="Buscar suministro..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
            <svg style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <select 
            style={{ maxWidth: "220px" }} 
            value={categoriaFiltro}
            onChange={e => setCategoriaFiltro(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
            <button className="btn-secondary" onClick={() => {
              setRestockItems([{ suministro_id: "", cantidad: 0 }]);
              setRestockModalOpen(true);
            }}>
              <svg style={{ marginRight: "0.5rem" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 5 5 5-5"/><path d="M11 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v3"/></svg>
              Reabastecer
            </button>
            <button className="btn-primary" onClick={() => handleOpenModal()}>
              + Nuevo Suministro
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Precio U.</th>
                <th>Stock</th>
                <th>Nivel</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "4rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <div className="animate-spin" style={{ width: "30px", height: "30px", border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%" }}></div>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Cargando suministros...</span>
                  </div>
                </td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
                  No se encontraron suministros.
                </td></tr>
              ) : filtrados.map(s => {
                const critico = typeof s.stock_critico === 'number' ? s.stock_critico : parseFloat((s.stock_critico as string) || "10");
                const nivel = stockBadge(s.stock, s.stock_critico);
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: "600" }}>{s.nombre}</td>
                    <td><span className="badge badge-gray">{s.categoria_nombre || "Sin Categoría"}</span></td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.descripcion}>
                      {s.descripcion || "-"}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{s.unidad}</td>
                    <td style={{ fontWeight: "600", color: "var(--text-primary)" }}>Bs. {parseFloat((s.precio_unitario || 0).toString()).toFixed(2)}</td>
                    <td>
                      <div style={{ fontWeight: "800", fontSize: "1rem", color: s.stock <= critico ? "#ef4444" : "var(--text-primary)" }}>
                        {s.stock}
                      </div>
                    </td>
                    <td><span className={nivel.cls}>{nivel.label}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn-secondary" style={{ padding: "0.4rem", borderRadius: "0.375rem" }} title="Almacenes / Mover" onClick={() => {
                          setSuministroParaMover(s);
                          setMovimientoForm({ almacen_origen_id: "", almacen_destino_id: "", cantidad: 1 });
                          setMoverModalOpen(true);
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V7L12 3L21 7V21H16V14H8V21H3Z"/></svg>
                        </button>
                        <button className="btn-secondary" style={{ padding: "0.4rem", borderRadius: "0.375rem" }} title="Editar" onClick={() => handleOpenModal(s)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button className="btn-secondary" style={{ padding: "0.4rem", borderRadius: "0.375rem", color: "#ef4444" }} title="Eliminar" onClick={() => handleDelete(s.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Suministro */}
      {modalAbierto && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "#00000080", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }} onClick={() => setModalAbierto(false)}>
          <form className="card" style={{ width: "100%", maxWidth: "480px", padding: "1.75rem", boxSizing: "border-box" }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{editando ? "Editar Suministro" : "Nuevo Suministro"}</h2>
              <button type="button" onClick={() => setModalAbierto(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Nombre del Material</label>
                <input required placeholder="Ej: Cemento Portland IP-30" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Unidad de Medida</label>
                  <input required placeholder="Ej: bolsa, m³, kg" value={formData.unidad} onChange={e => setFormData({...formData, unidad: e.target.value})} />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Stock {editando ? "Actual" : "Inicial"}</label>
                    <input type="number" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} disabled={!!editando} title={editando ? "El stock debe gestionarse mediante reabastecimiento o movimientos" : ""} style={{ opacity: editando ? 0.6 : 1 }} />
                  </div>
                  {!editando && formData.stock > 0 && (
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Almacén Inicial</label>
                      <select required value={formData.almacen_id} onChange={e => setFormData({...formData, almacen_id: e.target.value})}>
                        <option value="">Seleccionar almacén...</option>
                        {almacenes.map(a => (
                          <option key={a.id} value={a.id}>{a.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Categoría</label>
                  <select required value={formData.categoria_id} onChange={e => setFormData({...formData, categoria_id: e.target.value})}>
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Precio U. (Bs.)</label>
                  <input type="number" required min="0" step="0.01" placeholder="0.00" value={formData.precio_unitario} onChange={e => setFormData({...formData, precio_unitario: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Stock Crítico</label>
                  <input type="number" min="0" placeholder="Opcional" value={formData.stock_critico} onChange={e => setFormData({...formData, stock_critico: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Descripción (Opcional)</label>
                <textarea style={{ minHeight: "80px", resize: "vertical" }} placeholder="Detalles adicionales del material..." value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              </div>
              
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editando ? "Guardar Cambios" : "Crear Suministro"}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal Reabastecer */}
      {restockModalOpen && (
        <div className="modal-overlay" onClick={() => setRestockModalOpen(false)}>
          <form className="modal-content" style={{ maxWidth: "550px" }} onClick={e => e.stopPropagation()} onSubmit={handleRestockSubmit}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "750" }}>Reabastecer Suministros</h2>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Aumentar el stock de múltiples materiales</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setRestockModalOpen(false)}>✕</button>
            </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.5rem" }}>Almacén de Destino para Reabastecimiento</label>
                <select 
                  required
                  value={selectedAlmacenRestock} 
                  onChange={e => setSelectedAlmacenRestock(e.target.value)}
                >
                  <option value="">Seleccionar almacén</option>
                  {almacenes.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              {restockItems.map((item, index) => (
                <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 100px 40px", gap: "0.75rem", alignItems: "end" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.4rem" }}>Material</label>
                    <select required value={item.suministro_id} onChange={e => {
                      const newItems = [...restockItems];
                      newItems[index].suministro_id = e.target.value;
                      setRestockItems(newItems);
                    }}>
                      <option value="">Seleccionar...</option>
                      {suministros.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} ({s.unidad})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.4rem" }}>Cantidad</label>
                    <input type="number" required min="1" value={item.cantidad} onChange={e => {
                      const newItems = [...restockItems];
                      newItems[index].cantidad = parseInt(e.target.value) || 0;
                      setRestockItems(newItems);
                    }} />
                  </div>
                  <button type="button" className="btn-secondary" style={{ padding: "0.5rem", color: "#f87171" }} onClick={() => {
                    if (restockItems.length > 1) {
                      setRestockItems(restockItems.filter((_, i) => i !== index));
                    }
                  }}>✕</button>
                </div>
              ))}
            </div>

            <button type="button" className="btn-secondary" style={{ width: "100%", marginBottom: "1.5rem", fontSize: "0.8rem" }} onClick={() => setRestockItems([...restockItems, { suministro_id: "", cantidad: 0 }])}>
              + Añadir otro material
            </button>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setRestockModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Reabastecer Almacén</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Mover Stock */}
      {moverModalOpen && suministroParaMover && (
        <div className="modal-overlay" onClick={() => setMoverModalOpen(false)}>
          <form className="modal-content" style={{ maxWidth: "500px" }} onClick={e => e.stopPropagation()} onSubmit={handleMoverSubmit}>
            <div className="modal-header" style={{ marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "750" }}>Gestionar Almacenes</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{suministroParaMover.nombre}</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setMoverModalOpen(false)}>✕</button>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>Stock Actual</h4>
              {suministroParaMover.breakdown && suministroParaMover.breakdown.length > 0 ? (
                <div style={{ background: "var(--bg-primary)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", display: "grid", gap: "0.5rem" }}>
                  {suministroParaMover.breakdown.map((b, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{b.almacen_nombre}</span>
                      <span style={{ fontWeight: "700", background: "var(--bg-secondary)", padding: "0.2rem 0.6rem", borderRadius: "1rem" }}>{b.stock} {suministroParaMover.unidad}</span>
                    </div>
                  ))}
                </div>
              ) : (
                 <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>No hay stock registrado en almacenes.</div>
              )}
            </div>

            <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 7-5-5-5 5"/><path d="m17 17-5 5-5-5"/></svg>
                Mover a otro almacén
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.4rem" }}>Almacén de Origen</label>
                  <select required value={movimientoForm.almacen_origen_id} onChange={e => setMovimientoForm({...movimientoForm, almacen_origen_id: e.target.value})}>
                    <option value="">Seleccionar de dónde mover...</option>
                    {suministroParaMover.breakdown?.filter(b => b.stock > 0).map(b => (
                      <option key={b.almacen_id} value={b.almacen_id}>{b.almacen_nombre} (Disp: {b.stock})</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.4rem" }}>Almacén de Destino</label>
                    <select required value={movimientoForm.almacen_destino_id} onChange={e => setMovimientoForm({...movimientoForm, almacen_destino_id: e.target.value})}>
                      <option value="">Seleccionar a dónde enviar...</option>
                      {almacenes.map(a => (
                        <option key={a.id} value={a.id}>{a.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.4rem" }}>Cantidad</label>
                    <input type="number" required min="1" 
                           max={suministroParaMover.breakdown?.find(b => b.almacen_id === parseInt(movimientoForm.almacen_origen_id))?.stock || 1} 
                           value={movimientoForm.cantidad} 
                           onChange={e => setMovimientoForm({...movimientoForm, cantidad: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setMoverModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirmar Movimiento</button>
            </div>
          </form>
        </div>
      )}


      {/* Notificación */}
      {notification && (
        <div style={{
          position: "fixed", top: "2rem", right: "2rem", zIndex: 1000,
          background: "var(--card-bg)", 
          border: `1px solid ${notification.type === 'error' ? '#ef4444' : 'var(--accent)'}`,
          padding: "1rem 1.5rem", borderRadius: "0.75rem", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
          display: "flex", alignItems: "center", gap: "1rem",
          animation: "slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}>
          <div style={{ 
            background: notification.type === 'error' ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)", 
            color: notification.type === 'error' ? "#ef4444" : "#22c55e", 
            padding: "0.5rem", borderRadius: "50%" 
          }}>
            {notification.type === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            )}
          </div>
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "0.1rem" }}>
              {notification.type === 'error' ? 'Error' : '¡Éxito!'}
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{notification.message}</p>
          </div>
          <style jsx>{`
            @keyframes slideIn {
              from { transform: translateY(-20px) translateX(20px); opacity: 0; }
              to { transform: translateY(0) translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
