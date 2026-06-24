const pool = require('../config/db');

// Obtener solicitudes según rol
const getSolicitudes = async (req, res) => {
  const { rol, id: usuario_id } = req.user;
  try {
    let query = `
      SELECT s.*, s.pdf_entrega, s.comentario, a.nombre as activo_nombre, a.codigo_inventario as activo_codigo, o.nombre as obra_nombre, u.nombre as solicitante_nombre,
             u2.nombre as aprobado_por_nombre, u3.nombre as entregado_por_nombre
      FROM solicitudes_activos s
      JOIN activos_fijos a ON s.activo_id = a.id
      JOIN obras o ON s.obra_id = o.id
      JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios u2 ON s.aprobado_por = u2.id
      LEFT JOIN usuarios u3 ON s.entregado_por = u3.id
    `;
    let params = [];

    if (rol === 'Supervisor de Obra') {
      query += ` WHERE o.supervisor_id = $1`;
      params.push(usuario_id);
    } else if (rol === 'Técnico') {
      query += ` WHERE s.usuario_id = $1`;
      params.push(usuario_id);
    } else if (rol !== 'Administrador') {
      // Otros roles (como Almacén) no ven solicitudes pendientes
      query += ` WHERE s.estado != 'Pendiente'`;
    }

    query += ' ORDER BY s.fecha_solicitud DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener solicitudes" });
  }
};

// Obtener el cronograma de un activo (fechas ocupadas)
const getActivoSchedule = async (req, res) => {
  const { activo_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, fecha_inicio, fecha_fin, estado, usuario_id 
       FROM solicitudes_activos 
       WHERE activo_id = $1 AND LOWER(estado) NOT IN ('rechazado', 'devuelto')
       ORDER BY fecha_inicio ASC`,
      [activo_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener cronograma del activo" });
  }
};

// Crear solicitud con validaciones de estado y solapamiento
const createSolicitud = async (req, res) => {
  const { activo_id, obra_id, fecha_inicio, fecha_fin, comentario } = req.body;
  const { id: usuario_id } = req.user;

  try {
    // 1. Verificar estado del activo
    const activoRes = await pool.query('SELECT estado FROM activos_fijos WHERE id = $1', [activo_id]);
    if (activoRes.rows.length === 0) return res.status(404).json({ mensaje: "Activo no encontrado" });
    
    const estadoActual = activoRes.rows[0].estado?.toLowerCase();
    if (estadoActual === 'en mantenimiento' || estadoActual === 'fuera de servicio') {
      return res.status(400).json({ mensaje: `El activo no está disponible para solicitudes (Estado: ${estadoActual})` });
    }

    // 2. Verificar solapamiento de fechas
    // Buscamos solicitudes aprobadas o pendientes que se crucen con el rango solicitado
    const overlapRes = await pool.query(
      `SELECT id FROM solicitudes_activos 
       WHERE activo_id = $1 
       AND LOWER(estado) NOT IN ('rechazado', 'devuelto', 'finalizado')
       AND (
         (fecha_inicio <= $2 AND fecha_fin >= $2) OR
         (fecha_inicio <= $3 AND fecha_fin >= $3) OR
         ($2 <= fecha_inicio AND $3 >= fecha_inicio)
       )`,
      [activo_id, fecha_inicio, fecha_fin]
    );

    if (overlapRes.rows.length > 0) {
      return res.status(400).json({ mensaje: "El activo ya está reservado o solicitado para las fechas seleccionadas" });
    }

    // 3. Crear la solicitud
    const result = await pool.query(
      `INSERT INTO solicitudes_activos (activo_id, obra_id, usuario_id, fecha_inicio, fecha_fin, comentario, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente') RETURNING *`,
      [activo_id, obra_id, usuario_id, fecha_inicio, fecha_fin, comentario]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear solicitud" });
  }
};

// Aprobar/Rechazar/Entregar solicitud con automatización de asignaciones
const updateEstado = async (req, res) => {
  const { id } = req.params;
  const { estado, comentario } = req.body;
  const { id: auth_user_id, rol } = req.user;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener datos actuales de la solicitud
    const solRes = await client.query('SELECT * FROM solicitudes_activos WHERE id = $1', [id]);
    if (solRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }
    const solicitud = solRes.rows[0];

    const pdf_filename = req.file ? '/uploads/entregas/' + req.file.filename : null;

    let result;
    if (estado === 'Entregado') {
      if (rol !== 'Administrador' && rol !== 'Almacén') {
        await client.query('ROLLBACK');
        return res.status(403).json({ mensaje: "No tiene permisos para realizar la entrega" });
      }

      // 1. Actualizar estado de la solicitud
      result = await client.query(
        `UPDATE solicitudes_activos 
         SET estado = $1, entregado_por = $2, pdf_entrega = COALESCE($3, pdf_entrega), comentario = COALESCE($4, comentario)
         WHERE id = $5 RETURNING *`,
        [estado, auth_user_id, pdf_filename, comentario, id]
      );

      // 2. Crear registro en asignaciones_activos
      await client.query(
        `INSERT INTO asignaciones_activos (activo_id, obra_id, usuario_id, fecha_asignacion, fecha_devolucion, estado)
         VALUES ($1, $2, $3, CURRENT_DATE, $4, 'activo')`,
        [solicitud.activo_id, solicitud.obra_id, solicitud.usuario_id, solicitud.fecha_fin]
      );

      // 3. Actualizar estado del activo a 'asignado'
      await client.query('UPDATE activos_fijos SET estado = $1 WHERE id = $2', ['asignado', solicitud.activo_id]);

    } else {
      // Otros estados (Aprobado, Rechazado, Atendiendo, etc.)
      
      // Seguridad: Solo el supervisor de la obra o administrador pueden aprobar/rechazar
      if (estado === 'Aprobado' || estado === 'Rechazado') {
        if (rol !== 'Administrador' && rol !== 'Supervisor de Obra') {
          await client.query('ROLLBACK');
          return res.status(403).json({ mensaje: "No tiene permisos para aprobar/rechazar solicitudes" });
        }
        
        if (rol === 'Supervisor de Obra') {
          const obraRes = await client.query('SELECT supervisor_id FROM obras WHERE id = $1', [solicitud.obra_id]);
          if (obraRes.rows[0].supervisor_id !== auth_user_id) {
            await client.query('ROLLBACK');
            return res.status(403).json({ mensaje: "No es el supervisor asignado a esta obra" });
          }
        }
      }

      result = await client.query(
        `UPDATE solicitudes_activos 
         SET estado = $1, aprobado_por = $2, fecha_aprobacion = CURRENT_TIMESTAMP, comentario = COALESCE($3, comentario)
         WHERE id = $4 RETURNING *`,
        [estado, auth_user_id, comentario, id]
      );
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar estado" });
  } finally {
    client.release();
  }
};

module.exports = {
  getSolicitudes,
  getActivoSchedule,
  createSolicitud,
  updateEstado
};
