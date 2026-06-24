const pool = require('../config/db');

// Obtener todos los suministros con su categoría
const getSuministros = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, c.nombre as categoria_nombre,
      (
        SELECT json_agg(json_build_object('almacen_id', al.id, 'almacen_nombre', al.nombre, 'stock', als.stock))
        FROM almacen_suministros als
        JOIN almacenes al ON als.almacen_id = al.id
        WHERE als.suministro_id = s.id
      ) as breakdown
      FROM suministros s
      LEFT JOIN categorias_suministros c ON s.categoria_id = c.id
      ORDER BY s.nombre ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener suministros" });
  }
};

// Obtener todas las categorías para los filtros/formularios
const getCategorias = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias_suministros ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener categorías" });
  }
};

// Crear nuevo suministro
const createSuministro = async (req, res) => {
  const { nombre, descripcion, unidad, stock, categoria_id, precio_unitario, stock_critico, almacen_id } = req.body;
  const usuario_id = req.user.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO suministros (nombre, descripcion, unidad, stock, categoria_id, precio_unitario, stock_critico) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, descripcion, unidad, stock, categoria_id, precio_unitario || 0.00, stock_critico || 0.00]
    );
    const newSuministro = result.rows[0];

    if (stock > 0 && almacen_id) {
       await client.query(
         `INSERT INTO almacen_suministros (almacen_id, suministro_id, stock)
          VALUES ($1, $2, $3)`,
         [almacen_id, newSuministro.id, stock]
       );
       await client.query(
         `INSERT INTO movimientos_suministros 
          (suministro_id, tipo_movimiento, cantidad, usuario_id, fecha) 
          VALUES ($1, 'entrada', $2, $3, CURRENT_TIMESTAMP)`,
         [newSuministro.id, stock, usuario_id]
       );
    }
    await client.query('COMMIT');
    res.status(201).json(newSuministro);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear suministro" });
  } finally {
    client.release();
  }
};

// Actualizar suministro
const updateSuministro = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, unidad, stock, categoria_id, precio_unitario, stock_critico } = req.body;
  try {
    const result = await pool.query(
      'UPDATE suministros SET nombre = $1, descripcion = $2, unidad = $3, stock = $4, categoria_id = $5, precio_unitario = $6, stock_critico = $7 WHERE id = $8 RETURNING *',
      [nombre, descripcion, unidad, stock, categoria_id, precio_unitario || 0.00, stock_critico || 0.00, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ mensaje: "No encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar suministro" });
  }
};

// Eliminar suministro
const deleteSuministro = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM suministros WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ mensaje: "No encontrado" });
    res.json({ mensaje: "Suministro eliminado correctamente" });
  } catch (err) {
    console.error(err);
    if (err.code === '23503') {
      return res.status(400).json({ mensaje: "No se puede eliminar el suministro porque tiene movimientos o solicitudes asociadas" });
    }
    res.status(500).json({ mensaje: "Error al eliminar suministro" });
  }
};

// Reabastecer suministros (Bulk)
const restockSuministros = async (req, res) => {
  const { items, usuario_id, almacen_id } = req.body; // items: [{suministro_id, cantidad}], almacen_id: target warehouse
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Si no se envía almacen_id, usar el Almacén Central por defecto
    let targetAlmacenId = almacen_id;
    if (!targetAlmacenId) {
      const central = await client.query("SELECT id FROM almacenes WHERE nombre = 'Almacén Central'");
      targetAlmacenId = central.rows[0].id;
    }

    for (const item of items) {
      // 1. Actualizar stock global
      await client.query(
        'UPDATE suministros SET stock = stock + $1 WHERE id = $2',
        [item.cantidad, item.suministro_id]
      );

      // 2. Actualizar stock en almacén específico (Upsert)
      await client.query(
        `INSERT INTO almacen_suministros (almacen_id, suministro_id, stock)
         VALUES ($1, $2, $3)
         ON CONFLICT (almacen_id, suministro_id) 
         DO UPDATE SET stock = almacen_suministros.stock + EXCLUDED.stock`,
        [targetAlmacenId, item.suministro_id, item.cantidad]
      );

      // 3. Registrar movimiento
      await client.query(
        `INSERT INTO movimientos_suministros 
         (suministro_id, tipo_movimiento, cantidad, usuario_id, fecha) 
         VALUES ($1, 'entrada', $2, $3, CURRENT_TIMESTAMP)`,
        [item.suministro_id, item.cantidad, usuario_id]
      );
    }
    await client.query('COMMIT');
    res.json({ mensaje: "Reabastecimiento registrado con éxito" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: "Error al reabastecer suministros" });
  } finally {
    client.release();
  }
};

module.exports = {
  getSuministros,
  getCategorias,
  createSuministro,
  updateSuministro,
  deleteSuministro,
  restockSuministros
};
