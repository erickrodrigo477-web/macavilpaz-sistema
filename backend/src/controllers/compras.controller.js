const pool = require('../config/db');

const getCompras = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.nombre as usuario_nombre
      FROM compras c
      JOIN usuarios u ON c.usuario_id = u.id
      ORDER BY c.fecha DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener compras" });
  }
};

const getCompraById = async (req, res) => {
  const { id } = req.params;
  try {
    const compraRes = await pool.query(`
      SELECT c.*, u.nombre as usuario_nombre
      FROM compras c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = $1
    `, [id]);

    if (compraRes.rows.length === 0) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    const itemsRes = await pool.query(`
      SELECT d.*, s.nombre as suministro_nombre, s.unidad
      FROM detalle_compras d
      JOIN suministros s ON d.suministro_id = s.id
      WHERE d.compra_id = $1
    `, [id]);

    res.json({
      ...compraRes.rows[0],
      items: itemsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener detalle de compra" });
  }
};

const createCompra = async (req, res) => {
  const { proveedor, items, usuario_id, total } = req.body;
  // items: [{ suministro_id, cantidad, precio_unitario }]
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insertar cabecera de compra
    const compraRes = await client.query(
      'INSERT INTO compras (proveedor, total, usuario_id) VALUES ($1, $2, $3) RETURNING *',
      [proveedor, total, usuario_id]
    );
    const compraId = compraRes.rows[0].id;

    for (const item of items) {
      // 2. Insertar detalle
      await client.query(
        'INSERT INTO detalle_compras (compra_id, suministro_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
        [compraId, item.suministro_id, item.cantidad, item.precio_unitario]
      );

      // 3. Incrementar stock en suministros
      await client.query(
        'UPDATE suministros SET stock = stock + $1 WHERE id = $2',
        [item.cantidad, item.suministro_id]
      );

      // 4. Registrar movimiento de entrada
      await client.query(
        `INSERT INTO movimientos_suministros 
         (suministro_id, tipo_movimiento, cantidad, usuario_id, fecha) 
         VALUES ($1, 'entrada', $2, $3, CURRENT_TIMESTAMP)`,
        [item.suministro_id, item.cantidad, usuario_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(compraRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: "Error al registrar la compra" });
  } finally {
    client.release();
  }
};

module.exports = {
  getCompras,
  getCompraById,
  createCompra
};
