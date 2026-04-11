const pool = require('../config/db');

// Obtener todos los activos
const getActivos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activos_fijos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener activos" });
  }
};

// Crear un nuevo activo
const createActivo = async (req, res) => {
  const { rol } = req.user;
  
  // Solo Admin y Almacén pueden CREAR activos inicialmente (datos físicos)
  if (rol !== 'Administrador' && rol !== 'Almacén' && rol !== 'Almacen') {
    return res.status(403).json({ mensaje: "No tiene permisos para crear activos" });
  }

  const { 
    nombre, descripcion, codigo_inventario, estado, fecha_compra,
    ubicacion, valor_inicial, valor_actual, depreciacion_acumulada,
    valor_residual, vida_util
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO activos_fijos 
       (nombre, descripcion, codigo_inventario, estado, fecha_compra, ubicacion, valor_inicial, valor_actual, depreciacion_acumulada, valor_residual, vida_util) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        nombre, descripcion, codigo_inventario, estado, fecha_compra, 
        ubicacion, valor_inicial || 0, valor_actual || 0, depreciacion_acumulada || 0,
        valor_residual || 0, vida_util || 5
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear activo" });
  }
};

// Actualizar un activo
const updateActivo = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.user;

  // 1. Obtener el activo actual
  try {
    const currentResult = await pool.query('SELECT * FROM activos_fijos WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ mensaje: "Activo no encontrado" });
    }
    const current = currentResult.rows[0];

    // 2. Definir qué campos puede actualizar cada rol
    const { 
      nombre, descripcion, codigo_inventario, estado, fecha_compra,
      ubicacion, valor_inicial, valor_actual, depreciacion_acumulada,
      valor_residual, vida_util
    } = req.body;

    let query = 'UPDATE activos_fijos SET ';
    let params = [];
    let setClauses = [];

    // Lógica por roles
    if (rol === 'Administrador') {
      // Admin edita todo
      setClauses = [
        'nombre = $1', 'descripcion = $2', 'codigo_inventario = $3', 'estado = $4', 
        'fecha_compra = $5', 'ubicacion = $6', 'valor_inicial = $7', 'valor_actual = $8', 
        'depreciacion_acumulada = $9', 'valor_residual = $10', 'vida_util = $11'
      ];
      params = [
        nombre || current.nombre, 
        descripcion || current.descripcion, 
        codigo_inventario || current.codigo_inventario, 
        estado || current.estado, 
        fecha_compra || current.fecha_compra, 
        ubicacion || current.ubicacion, 
        valor_inicial !== undefined ? valor_inicial : current.valor_inicial, 
        valor_actual !== undefined ? valor_actual : current.valor_actual, 
        depreciacion_acumulada !== undefined ? depreciacion_acumulada : current.depreciacion_acumulada,
        valor_residual !== undefined ? valor_residual : current.valor_residual,
        vida_util !== undefined ? vida_util : current.vida_util
      ];
    } 
    else if (rol === 'Almacén' || rol === 'Almacen') {
      // Almacén edita solo datos físicos y estado/ubicación
      setClauses = ['nombre = $1', 'descripcion = $2', 'codigo_inventario = $3', 'estado = $4', 'fecha_compra = $5', 'ubicacion = $6'];
      params = [
        nombre || current.nombre, 
        descripcion || current.descripcion, 
        codigo_inventario || current.codigo_inventario, 
        estado || current.estado, 
        fecha_compra || current.fecha_compra, 
        ubicacion || current.ubicacion
      ];
    } 
    else if (rol === 'Contabilidad') {
      // Contabilidad edita solo datos financieros
      setClauses = ['valor_inicial = $1', 'valor_actual = $2', 'depreciacion_acumulada = $3', 'valor_residual = $4', 'vida_util = $5'];
      params = [
        valor_inicial !== undefined ? valor_inicial : current.valor_inicial, 
        valor_actual !== undefined ? valor_actual : current.valor_actual, 
        depreciacion_acumulada !== undefined ? depreciacion_acumulada : current.depreciacion_acumulada,
        valor_residual !== undefined ? valor_residual : current.valor_residual,
        vida_util !== undefined ? vida_util : current.vida_util
      ];
    } 
    else {
      return res.status(403).json({ mensaje: "No tiene permisos para modificar activos" });
    }

    query += setClauses.map((clause, index) => clause.replace(/\$\d+/, `$${index + 1}`)).join(', ');
    query += ` WHERE id = $${params.length + 1} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);
    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar activo" });
  }
};

// Eliminar un activo
const deleteActivo = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.user;

  if (rol !== 'Administrador' && rol !== 'Almacén' && rol !== 'Almacen') {
    return res.status(403).json({ mensaje: "No tiene permisos para eliminar activos" });
  }

  try {
    const result = await pool.query('DELETE FROM activos_fijos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Activo no encontrado" });
    }
    res.json({ mensaje: "Activo eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al eliminar activo" });
  }
};

module.exports = {
  getActivos,
  createActivo,
  updateActivo,
  deleteActivo
};
