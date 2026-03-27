const pool = require('../config/db');

// Obtener solicitudes según rol
const getSolicitudes = async (req, res) => {
  const { rol, id: usuario_id } = req.user;
  try {
    let query = `
      SELECT s.*, s.pdf_entrega, a.nombre as activo_nombre, o.nombre as obra_nombre, u.nombre as solicitante_nombre,
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
      // Ver solo las de su obra (donde él es supervisor)
      query += ` WHERE o.supervisor_id = $1`;
      params.push(usuario_id);
    } else if (rol === 'Técnico') {
      // Ver solo las suyas
      query += ` WHERE s.usuario_id = $1`;
      params.push(usuario_id);
    }
    // Admin y Almacén ven todas

    query += ' ORDER BY s.fecha_solicitud DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener solicitudes" });
  }
};

// Crear solicitud
const createSolicitud = async (req, res) => {
  const { activo_id, obra_id, fecha_inicio, fecha_fin, comentario } = req.body;
  const { id: usuario_id } = req.user;

  try {
    const result = await pool.query(
      `INSERT INTO solicitudes_activos (activo_id, obra_id, usuario_id, fecha_inicio, fecha_fin, comentario)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [activo_id, obra_id, usuario_id, fecha_inicio, fecha_fin, comentario]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear solicitud" });
  }
};

// Aprobar/Rechazar solicitud
const updateEstado = async (req, res) => {
  const { id } = req.params;
  const { estado, comentario } = req.body; // aprobado, rechazado
  const { id: supervisor_id, rol } = req.user;

  const estadosAlmacen = ['Atendiendo', 'Listo para entrega'];
  if (estadosAlmacen.includes(estado)) {
    if (rol !== 'Administrador' && rol !== 'Almacén') {
      return res.status(403).json({ mensaje: "No tiene permisos para cambiar a este estado" });
    }
  } else if (rol !== 'Administrador' && rol !== 'Supervisor de Obra') {
    return res.status(403).json({ mensaje: "No tiene permisos para aprobar/rechazar solicitudes" });
  }

  const pdf_filename = req.file ? '/uploads/entregas/' + req.file.filename : null;

  try {
    let result;
    if (estado === 'Entregado') { // Assuming 'Entregado' is the final state for activos
      result = await pool.query(
        `UPDATE solicitudes_activos 
         SET estado = $1, entregado_por = $2, pdf_entrega = COALESCE($3, pdf_entrega), comentario = COALESCE($4, comentario)
         WHERE id = $5 RETURNING *`,
        [estado, supervisor_id, pdf_filename, comentario, id]
      );
    } else {
      result = await pool.query(
        `UPDATE solicitudes_activos 
         SET estado = $1, aprobado_por = $2, fecha_aprobacion = CURRENT_TIMESTAMP, comentario = COALESCE($3, comentario)
         WHERE id = $4 RETURNING *`,
        [estado, supervisor_id, comentario, id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar estado" });
  }
};

module.exports = {
  getSolicitudes,
  createSolicitud,
  updateEstado
};
