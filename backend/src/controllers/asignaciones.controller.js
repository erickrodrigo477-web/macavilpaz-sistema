const pool = require('../config/db');

const getAsignaciones = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id, a.fecha_asignacion, a.fecha_devolucion, a.estado, a.activo_id,
        ac.nombre as activo_nombre,
        o.nombre as obra_nombre,
        u.nombre as usuario_nombre
      FROM asignaciones_activos a
      JOIN activos_fijos ac ON a.activo_id = ac.id
      JOIN obras o ON a.obra_id = o.id
      JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.fecha_asignacion DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener asignaciones" });
  }
};

const createAsignacion = async (req, res) => {
  const { activo_id, obra_id, usuario_id, fecha_asignacion, fecha_devolucion, solicitud_id } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Crear asignación
    const valFechaDevolucion = fecha_devolucion && fecha_devolucion.trim() !== "" ? fecha_devolucion : null;
    const result = await client.query(
      'INSERT INTO asignaciones_activos (activo_id, obra_id, usuario_id, fecha_asignacion, fecha_devolucion, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [activo_id, obra_id, usuario_id, fecha_asignacion, valFechaDevolucion, 'activo']
    );

    // 2. Actualizar estado del activo a 'asignado'
    await client.query('UPDATE activos_fijos SET estado = $1 WHERE id = $2', ['asignado', activo_id]);

    // 3. Si viene de una solicitud, marcarla como 'asignado'
    if (solicitud_id) {
      await client.query('UPDATE solicitudes_activos SET estado = $1 WHERE id = $2', ['asignado', solicitud_id]);
    }

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear asignación" });
  } finally {
    client.release();
  }
};

const updateEstado = async (req, res) => {
  const { id } = req.params;
  const { estado, fecha_devolucion, nuevo_estado_activo } = req.body;
  // nuevo_estado_activo: disponible, mantenimiento, dañado

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Obtener datos de la asignación para saber que activo es
    const asgResult = await client.query('SELECT activo_id FROM asignaciones_activos WHERE id = $1', [id]);
    if (asgResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensaje: "Asignación no encontrada" });
    }
    const { activo_id } = asgResult.rows[0];

    // 2. Actualizar asignación
    const result = await client.query(
      'UPDATE asignaciones_activos SET estado = $1, fecha_devolucion = $2 WHERE id = $3 RETURNING *',
      [estado, fecha_devolucion || new Date(), id]
    );

    // 3. Actualizar estado del activo (Inspección)
    if (estado === 'devuelto' && nuevo_estado_activo) {
      await client.query('UPDATE activos_fijos SET estado = $1 WHERE id = $2', [nuevo_estado_activo, activo_id]);
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar asignación" });
  } finally {
    client.release();
  }
};

module.exports = {
  getAsignaciones,
  createAsignacion,
  updateEstado
};
