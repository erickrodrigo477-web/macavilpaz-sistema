const pool = require('../config/db');

// Obtener todas las obras con su supervisor asignado
const getObras = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.nombre as supervisor_nombre 
      FROM obras o 
      LEFT JOIN usuarios u ON o.supervisor_id = u.id 
      ORDER BY o.fecha_inicio DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener obras" });
  }
};

// Crear nueva obra
const createObra = async (req, res) => {
  const { nombre, ubicacion, fecha_inicio, fecha_fin, supervisor_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO obras (nombre, ubicacion, fecha_inicio, fecha_fin, supervisor_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, ubicacion, fecha_inicio, fecha_fin, supervisor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear obra" });
  }
};

// Actualizar obra
const updateObra = async (req, res) => {
  const { id } = req.params;
  const { nombre, ubicacion, fecha_inicio, fecha_fin, supervisor_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE obras SET nombre = $1, ubicacion = $2, fecha_inicio = $3, fecha_fin = $4, supervisor_id = $5 WHERE id = $6 RETURNING *',
      [nombre, ubicacion, fecha_inicio, fecha_fin, supervisor_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ mensaje: "Obra no encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar obra" });
  }
};

// Eliminar obra
const deleteObra = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si hay registros dependientes antes de borrar (opcional, pero buena práctica)
    // En este caso, solicitudes, asignaciones, etc. 
    // Por el error de FK, el sistema lo lanzará de todos modos si hay dependencias.
    await pool.query('DELETE FROM obras WHERE id = $1', [id]);
    res.json({ mensaje: "Obra eliminada exitosamente" });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ mensaje: "No se puede eliminar la obra porque tiene registros asociados (solicitudes, activos, etc.)" });
    }
    console.error(err);
    res.status(500).json({ mensaje: "Error al eliminar obra" });
  }
};

// Obtener detalles de la obra (activos y suministros asignados)
const getObraDetails = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Obtener activos fijos asignados (que no hayan sido devueltos)
    const activos = await pool.query(`
      SELECT aa.*, af.nombre as activo_nombre, af.codigo_inventario 
      FROM asignaciones_activos aa 
      JOIN activos_fijos af ON aa.activo_id = af.id 
      WHERE aa.obra_id = $1 AND aa.estado != 'Devuelto'
    `, [id]);

    // 2. Obtener suministros entregados (movimientos de salida)
    const suministros = await pool.query(`
      SELECT ms.*, s.nombre as suministro_nombre, s.unidad 
      FROM movimientos_suministros ms 
      JOIN suministros s ON ms.suministro_id = s.id 
      WHERE ms.obra_id = $1 AND ms.tipo_movimiento = 'salida'
      ORDER BY ms.fecha DESC
    `, [id]);

    res.json({
      activos: activos.rows,
      suministros: suministros.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener detalles de la obra" });
  }
};

module.exports = {
  getObras,
  createObra,
  updateObra,
  deleteObra,
  getObraDetails
};
