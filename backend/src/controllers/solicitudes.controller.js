const pool = require('../config/db');

// Obtener todas las solicitudes con información de obra, usuario y cantidad de items
const getSolicitudes = async (req, res) => {
  const { id: userId, rol } = req.user;
  
  try {
    let query = `
      SELECT 
        s.id, s.fecha_solicitud, s.fecha_aprobacion, s.estado, s.pdf_entrega, s.aprobado_por, s.entregado_por, s.almacen_recogida_id,
        o.nombre as obra_nombre,
        u.nombre as usuario_nombre,
        u2.nombre as aprobado_por_nombre,
        u3.nombre as entregado_por_nombre,
        al.nombre as almacen_recogida_nombre,
        (SELECT COUNT(*) FROM detalle_solicitudes WHERE solicitud_id = s.id) as items_count
      FROM solicitudes_materiales s
      JOIN obras o ON s.obra_id = o.id
      JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios u2 ON s.aprobado_por = u2.id
      LEFT JOIN usuarios u3 ON s.entregado_por = u3.id
      LEFT JOIN almacenes al ON s.almacen_recogida_id = al.id
      WHERE 1=1
    `;
    const params = [];

    // Aplicar filtros según el rol
    if (rol === 'Técnico') {
      query += ` AND s.usuario_id = $${params.length + 1}`;
      params.push(userId);
    } else if (rol === 'Supervisor de Obra') {
      query += ` AND o.supervisor_id = $${params.length + 1}`;
      params.push(userId);
    } else if (rol === 'Almacén') {
      query += ` AND s.estado NOT IN ('Pendiente de Aprobación', 'Rechazado')`;
    }
    // Administrador y Contabilidad ven todo por defecto (WHERE 1=1)

    query += ` ORDER BY s.fecha_solicitud DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener solicitudes" });
  }
};

// Obtener detalle de una solicitud específica
const getSolicitudById = async (req, res) => {
  const { id } = req.params;
  try {
    const solicitudRes = await pool.query(`
      SELECT s.*, o.nombre as obra_nombre, u.nombre as usuario_nombre,
             u2.nombre as aprobado_por_nombre, u3.nombre as entregado_por_nombre,
             al.nombre as almacen_recogida_nombre
      FROM solicitudes_materiales s
      JOIN obras o ON s.obra_id = o.id
      JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios u2 ON s.aprobado_por = u2.id
      LEFT JOIN usuarios u3 ON s.entregado_por = u3.id
      LEFT JOIN almacenes al ON s.almacen_recogida_id = al.id
      WHERE s.id = $1
    `, [id]);

    if (solicitudRes.rows.length === 0) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }

    const itemsRes = await pool.query(`
      SELECT d.*, sum.nombre as suministro_nombre, sum.unidad, sum.precio_unitario, sum.stock as stock_real
      FROM detalle_solicitudes d
      JOIN suministros sum ON d.suministro_id = sum.id
      WHERE d.solicitud_id = $1
    `, [id]);

    res.json({
      ...solicitudRes.rows[0],
      items: itemsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener detalle de solicitud" });
  }
};

// Crear una nueva solicitud con sus items (Transaccional)
const createSolicitud = async (req, res) => {
  const { obra_id, usuario_id, items } = req.body; // items es array de { suministro_id, cantidad }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Estado inicial: 'Pendiente de Aprobación'
    const solicitudRes = await client.query(
      'INSERT INTO solicitudes_materiales (obra_id, usuario_id, fecha_solicitud, estado) VALUES ($1, $2, CURRENT_DATE, $3) RETURNING *',
      [obra_id, usuario_id, 'Pendiente de Aprobación']
    );
    
    const solicitudId = solicitudRes.rows[0].id;
    
    for (const item of items) {
      // 1. Verificar stock actual del suministro
      const stockRes = await client.query('SELECT stock FROM suministros WHERE id = $1', [item.suministro_id]);
      const currentStock = stockRes.rows[0]?.stock || 0;
      
      // 2. Calcular valores para el flujo avanzado
      const cantidadSolicitada = item.cantidad;
      const cantidadDisponible = Math.min(cantidadSolicitada, currentStock);
      const faltante = Math.max(0, cantidadSolicitada - currentStock);
      
      // 3. Insertar detalle con la información de stock calculada
      await client.query(
        `INSERT INTO detalle_solicitudes 
         (solicitud_id, suministro_id, cantidad, cantidad_solicitada, cantidad_disponible, faltante, cantidad_entregada, saldo_pendiente) 
         VALUES ($1, $2, $3, $4, $5, $6, 0, $7)`,
        [solicitudId, item.suministro_id, cantidadSolicitada, cantidadSolicitada, cantidadDisponible, faltante, cantidadSolicitada]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(solicitudRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear solicitud" });
  } finally {
    client.release();
  }
};

// Aprobar solicitud (Nivel Supervisor)
const approveSolicitud = async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body; // El ID del supervisor
  
  try {
    const result = await pool.query(
      `UPDATE solicitudes_materiales 
       SET estado = 'Aprobado', aprobado_por = $1, fecha_aprobacion = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [usuario_id, id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al aprobar solicitud" });
  }
};

// authorizePurchase was removed as per user request to simplify the workflow

const entregarMateriales = async (req, res) => {
  const { id } = req.params;
  let { items } = req.body; 
  // Extraer el usuario entregando desde el token JWT
  const usuario_id = req.user.id; 
  
  if (typeof items === 'string') {
    items = JSON.parse(items);
  }

  const pdf_filename = req.file ? '/uploads/entregas/' + req.file.filename : null;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const solicitudRes = await client.query('SELECT * FROM solicitudes_materiales WHERE id = $1', [id]);
    if (solicitudRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }
    const solicitud = solicitudRes.rows[0];

    for (const item of items) {
      // 1. Verificar stock actual y saldo pendiente
      const checkRes = await client.query(`
        SELECT s.stock, d.saldo_pendiente, s.nombre
        FROM suministros s
        JOIN detalle_solicitudes d ON s.id = d.suministro_id
        WHERE d.solicitud_id = $1 AND s.id = $2
      `, [id, item.suministro_id]);

      if (checkRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          mensaje: `Suministro con ID ${item.suministro_id} no encontrado en esta solicitud` 
        });
      }

      const { stock, saldo_pendiente, nombre } = checkRes.rows[0];

      if (item.cantidad_entregada > stock) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          mensaje: `Stock insuficiente para ${nombre}. Disponible: ${stock}, Intentado: ${item.cantidad_entregada}` 
        });
      }

      if (item.cantidad_entregada > saldo_pendiente) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          mensaje: `La cantidad para ${nombre} excede el saldo pendiente. Pendiente: ${saldo_pendiente}` 
        });
      }

      // 2. Actualizar el detalle de la solicitud
      await client.query(
        `UPDATE detalle_solicitudes 
         SET cantidad_entregada = cantidad_entregada + $1, 
             saldo_pendiente = saldo_pendiente - $1 
         WHERE solicitud_id = $2 AND suministro_id = $3`,
        [item.cantidad_entregada, id, item.suministro_id]
      );

      // 3. Descontar del stock físico
      await client.query(
        'UPDATE suministros SET stock = stock - $1 WHERE id = $2',
        [item.cantidad_entregada, item.suministro_id]
      );

      // 4. Registrar movimiento de salida
      await client.query(
        `INSERT INTO movimientos_suministros 
         (suministro_id, tipo_movimiento, cantidad, usuario_id, obra_id, fecha) 
         VALUES ($1, 'salida', $2, $3, $4, CURRENT_TIMESTAMP)`,
        [item.suministro_id, item.cantidad_entregada, usuario_id, solicitud.obra_id]
      );
    }

    // Verificar si queda saldo pendiente global para la solicitud
    const pendientesRes = await client.query(
      'SELECT SUM(saldo_pendiente) as total_pendiente FROM detalle_solicitudes WHERE solicitud_id = $1',
      [id]
    );
    
    const totalPendiente = parseInt(pendientesRes.rows[0].total_pendiente || 0);
    const nuevoEstado = totalPendiente === 0 ? 'Entregado Totalmente' : 'Entregado Parcialmente';

    await client.query(
      'UPDATE solicitudes_materiales SET estado = $1, entregado_por = $2, pdf_entrega = COALESCE($3, pdf_entrega) WHERE id = $4',
      [nuevoEstado, usuario_id, pdf_filename, id]
    );

    await client.query('COMMIT');
    res.json({ mensaje: "Entrega registrada correctamente", estado: nuevoEstado });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ mensaje: "Error al registrar entrega" });
  } finally {
    if (client) client.release();
  }
};

// Cambiar estado genérico (Soportando nuevos estados para Almacén)
const updateEstado = async (req, res) => {
  const { id } = req.params;
  const { estado, almacen_recogida_id } = req.body;
  const { rol } = req.user;

  // Validaciones básicas de negocio para estados de Almacén
  const estadosAlmacen = ['Atendiendo', 'Listo para entrega'];
  if (estadosAlmacen.includes(estado) && rol !== 'Administrador' && rol !== 'Almacén') {
    return res.status(403).json({ mensaje: "No tiene permisos para cambiar a este estado" });
  }
  
  try {
    const result = await pool.query(
      'UPDATE solicitudes_materiales SET estado = $1, almacen_recogida_id = COALESCE($2, almacen_recogida_id) WHERE id = $3 RETURNING *',
      [estado, almacen_recogida_id || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar estado" });
  }
};

// Obtener necesidades consolidadas (agrupado por suministro) para compras
const getConsolidatedNeeds = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id as suministro_id, 
        s.nombre, 
        s.unidad, 
        s.stock as stock_actual,
        SUM(d.saldo_pendiente) as total_pendiente
      FROM detalle_solicitudes d
      JOIN solicitudes_materiales sm ON d.solicitud_id = sm.id
      JOIN suministros s ON d.suministro_id = s.id
      WHERE sm.estado IN ('Aprobado', 'Atendiendo', 'Listo para entrega') AND d.saldo_pendiente > 0
      GROUP BY s.id, s.nombre, s.unidad, s.stock
      ORDER BY total_pendiente DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener necesidades consolidadas" });
  }
};

module.exports = {
  getSolicitudes,
  getSolicitudById,
  createSolicitud,
  updateEstado,
  approveSolicitud,
  entregarMateriales,
  getConsolidatedNeeds
};
