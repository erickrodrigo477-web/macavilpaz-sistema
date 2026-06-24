const pool = require('../config/db');

// GET /api/mantenimiento - Todos los registros de mantenimiento con datos del activo
const getMantenimientos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, a.nombre AS activo_nombre, a.codigo_inventario, a.estado AS estado_actual
      FROM mantenimiento_activos m
      JOIN activos_fijos a ON m.activo_id = a.id
      ORDER BY m.fecha DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener mantenimientos' });
  }
};

// GET /api/mantenimiento/:activoId - Historial de un activo específico
const getMantenimientoByActivo = async (req, res) => {
  const { activoId } = req.params;
  try {
    // Verificar que el activo existe
    const activoResult = await pool.query(
      'SELECT id, nombre, codigo_inventario, estado, descripcion, ubicacion FROM activos_fijos WHERE id = $1',
      [activoId]
    );
    if (activoResult.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Activo no encontrado' });
    }

    const historial = await pool.query(`
      SELECT * FROM mantenimiento_activos
      WHERE activo_id = $1
      ORDER BY fecha DESC
    `, [activoId]);

    res.json({
      activo: activoResult.rows[0],
      historial: historial.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener historial del activo' });
  }
};

// POST /api/mantenimiento/iniciar - Iniciar mantenimiento
const iniciarMantenimiento = async (req, res) => {
  const { activo_id, tipo, descripcion } = req.body;
  const usuarioId = req.user.id;

  if (!activo_id || !tipo || !descripcion) {
    return res.status(400).json({ mensaje: 'activo_id, tipo y descripcion son requeridos' });
  }

  const tiposValidos = ['Preventivo', 'Correctivo', 'Falla', 'Inspección'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ mensaje: `Tipo inválido. Use: ${tiposValidos.join(', ')}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar activo
    const activoResult = await client.query('SELECT id, estado FROM activos_fijos WHERE id = $1', [activo_id]);
    if (activoResult.rows.length === 0) {
      throw new Error('Activo no encontrado');
    }

    if (activoResult.rows[0].estado === 'Mantenimiento') {
      throw new Error('El activo ya se encuentra en mantenimiento');
    }

    // Insertar registro en curso
    const result = await client.query(`
      INSERT INTO mantenimiento_activos
        (activo_id, tipo, descripcion, fecha, responsable, estado_resultante, estado_mantenimiento)
      VALUES ($1, $2, $3, NOW(), $4, 'Mantenimiento', 'En curso')
      RETURNING *
    `, [activo_id, tipo, descripcion, `Usuario ID ${usuarioId}`]);

    // Actualizar estado del activo
    await client.query('UPDATE activos_fijos SET estado = $1 WHERE id = $2', ['Mantenimiento', activo_id]);

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: err.message || 'Error al iniciar mantenimiento' });
  } finally {
    client.release();
  }
};

// PATCH /api/mantenimiento/finalizar/:id - Finalizar mantenimiento
const finalizarMantenimiento = async (req, res) => {
  const { id } = req.params; // ID del mantenimiento
  const { notas_finales } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener el mantenimiento
    const mantResult = await client.query('SELECT * FROM mantenimiento_activos WHERE id = $1', [id]);
    if (mantResult.rows.length === 0) {
      throw new Error('Registro de mantenimiento no encontrado');
    }

    const mantenimiento = mantResult.rows[0];
    if (mantenimiento.estado_mantenimiento === 'Completado') {
      throw new Error('El mantenimiento ya ha sido finalizado');
    }

    // Actualizar mantenimiento
    const descActualizada = notas_finales ? `${mantenimiento.descripcion}\n\nNotas finales: ${notas_finales}` : mantenimiento.descripcion;
    const result = await client.query(`
      UPDATE mantenimiento_activos 
      SET fecha_fin = NOW(), estado_mantenimiento = 'Completado', estado_resultante = 'Disponible', descripcion = $1
      WHERE id = $2 RETURNING *
    `, [descActualizada, id]);

    // Actualizar activo a Disponible
    await client.query('UPDATE activos_fijos SET estado = $1 WHERE id = $2', ['Disponible', mantenimiento.activo_id]);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: err.message || 'Error al finalizar mantenimiento' });
  } finally {
    client.release();
  }
};

module.exports = {
  getMantenimientos,
  getMantenimientoByActivo,
  iniciarMantenimiento,
  finalizarMantenimiento
};
