const pool = require('../config/db');

const getMovimientos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id, m.tipo_movimiento, m.cantidad, m.fecha, m.solicitud_id,
        s.nombre as suministro_nombre,
        s.unidad as unidad,
        o.nombre as obra_nombre,
        u.nombre as usuario_nombre
      FROM movimientos_suministros m
      JOIN suministros s ON m.suministro_id = s.id
      LEFT JOIN obras o ON m.obra_id = o.id
      JOIN usuarios u ON m.usuario_id = u.id
      ORDER BY m.fecha DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener movimientos" });
  }
};

const createMovimiento = async (req, res) => {
  const { suministro_id, tipo_movimiento, cantidad, usuario_id, obra_id } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insertar movimiento
    const movementRes = await client.query(
      'INSERT INTO movimientos_suministros (suministro_id, tipo_movimiento, cantidad, usuario_id, obra_id, fecha) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
      [suministro_id, tipo_movimiento, cantidad, usuario_id, obra_id]
    );

    // Actualizar stock
    const operator = tipo_movimiento === 'entrada' ? '+' : '-';
    await client.query(
      `UPDATE suministros SET stock = stock ${operator} $1 WHERE id = $2`,
      [cantidad, suministro_id]
    );
    
    await client.query('COMMIT');
    res.status(201).json(movementRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: "Error al registrar movimiento" });
  } finally {
    client.release();
  }
};

module.exports = {
  getMovimientos,
  createMovimiento
};
