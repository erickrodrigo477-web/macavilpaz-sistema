"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface Need {
  suministro_id: number;
  nombre: string;
  unidad: string;
  stock_actual: number;
  total_pendiente: string;
}

interface CartItem {
  suministro_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export default function ComprasPage() {
  const { token, user } = useAuth();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [proveedor, setProveedor] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (token) {
      fetchNeeds();
    }
  }, [token]);

  const fetchNeeds = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitudes/consolidated-needs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setNeeds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (need: Need) => {
    const existing = cart.find(item => item.suministro_id === need.suministro_id);
    if (existing) return;

    setCart([...cart, {
      suministro_id: need.suministro_id,
      nombre: need.nombre,
      cantidad: parseInt(need.total_pendiente),
      precio_unitario: 0
    }]);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.suministro_id !== id));
  };

  const updateCartItem = (id: number, field: keyof CartItem, value: any) => {
    setCart(cart.map(item => 
      item.suministro_id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalCompra = cart.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

  const handleRegisterPurchase = async () => {
    if (!proveedor) {
      setMessage({ text: "Ingrese un proveedor", type: "error" });
      return;
    }
    if (cart.length === 0) {
      setMessage({ text: "El carrito está vacío", type: "error" });
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/compras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          proveedor,
          usuario_id: user?.id,
          total: totalCompra,
          items: cart
        })
      });

      if (res.ok) {
        setMessage({ text: "Compra registrada con éxito. El stock ha sido actualizado.", type: "success" });
        setCart([]);
        setProveedor("");
        fetchNeeds();
      } else {
        const error = await res.json();
        setMessage({ text: error.mensaje || "Error al registrar compra", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Error de conexión", type: "error" });
    }
  };

  if (loading) return <div className="p-8">Cargando necesidades de compra...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-primary flex items-center gap-3">
          <span className="p-3 bg-accent/10 rounded-2xl">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </span>
          Gestión de Compras Globales
        </h1>
        <p className="text-text-secondary mt-2">
          Adquisición de materiales para reposición de inventario y atención de demandas.
        </p>
      </header>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-slide-up ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({text: "", type: ""})} className="ml-auto opacity-50 hover:opacity-100">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Necesidades Sugeridas */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Necesidades Consolidadas
            </h2>
            
            {needs.length === 0 ? (
              <div className="text-center py-12 text-text-secondary bg-bg-secondary/30 rounded-2xl border border-dashed border-border mb-4">
                No hay necesidades de materiales pendientes de compra actualmente.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-text-secondary border-b border-border">
                      <th className="pb-4 font-semibold">Material</th>
                      <th className="pb-4 font-semibold text-center">En Stock</th>
                      <th className="pb-4 font-semibold text-center">Faltante/Pendiente</th>
                      <th className="pb-4 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {needs.map((need) => (
                      <tr key={need.suministro_id} className="border-b border-border/50 hover:bg-bg-secondary/20 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-text-primary">{need.nombre}</div>
                          <div className="text-xs text-text-secondary uppercase">{need.unidad}</div>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            need.stock_actual <= 0 ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {need.stock_actual}
                          </span>
                        </td>
                        <td className="py-4 text-center font-bold text-accent">
                          {need.total_pendiente}
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => addToCart(need)}
                            className="p-2 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg transition-all"
                            title="Agregar al carrito de compra"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Carrito de Compra */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8 border-accent/20 bg-accent/[0.02]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              Nueva Adquisición
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-1 text-text-secondary">Proveedor</label>
                <input 
                  type="text" 
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  placeholder="Ej: Ferretería Global"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 focus:border-accent outline-none"
                />
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-text-secondary opacity-60 italic text-sm border border-dashed rounded-xl">
                  Seleccione materiales para comprar
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.suministro_id} className="p-4 bg-bg-secondary/50 rounded-2xl border border-border relative group">
                      <button 
                        onClick={() => removeFromCart(item.suministro_id)}
                        className="absolute -top-2 -right-2 w-6 height-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &times;
                      </button>
                      <div className="font-bold mb-3">{item.nombre}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Cantidad</label>
                          <input 
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => updateCartItem(item.suministro_id, 'cantidad', parseInt(e.target.value))}
                            className="w-full bg-bg-primary border border-border rounded-lg px-2 py-1 text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">P. Unit (Bs)</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={item.precio_unitario}
                            onChange={(e) => updateCartItem(item.suministro_id, 'precio_unitario', parseFloat(e.target.value))}
                            className="w-full bg-bg-primary border border-border rounded-lg px-2 py-1 text-sm outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border mt-auto">
              <div className="flex justify-between items-center mb-6">
                <span className="text-text-secondary font-semibold">Total Estimado:</span>
                <span className="text-2xl font-black text-accent">
                  {totalCompra.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs
                </span>
              </div>
              
              <button 
                onClick={handleRegisterPurchase}
                disabled={cart.length === 0}
                className="w-full btn-primary py-4 text-lg shadow-xl shadow-accent/20 disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-95"
              >
                Registrar Compra e Ingreso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
