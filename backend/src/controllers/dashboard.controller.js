const pool = require('../config/db');

const getStats = async (req, res) => {
  try {
    // 1. Total Activos Fijos
    const activosRes = await pool.query('SELECT COUNT(*) FROM activos_fijos');
    const activosMantenimientoRes = await pool.query("SELECT COUNT(*) FROM activos_fijos WHERE estado ILIKE 'mantenimiento'");
    
    // 2. Obras
    const obrasRes = await pool.query("SELECT COUNT(*) FROM obras");
    const obrasProxRes = await pool.query("SELECT COUNT(*) FROM obras WHERE fecha_inicio > CURRENT_DATE");

    // 3. Solicitudes Pendientes
    const solicitudesRes = await pool.query("SELECT COUNT(*) FROM solicitudes_materiales WHERE estado ILIKE 'pendiente'");
    const solicitudesUrgentesRes = await pool.query("SELECT COUNT(*) FROM solicitudes_materiales WHERE estado ILIKE 'urgente'");

    // 4. Suministros Bajo Mínimo (Consideramos bajo mínimo si stock < 10 por ahora)
    const suministrosRes = await pool.query('SELECT SUM(stock) as total FROM suministros');
    const suministrosBajoMinRes = await pool.query('SELECT COUNT(*) FROM suministros WHERE stock < 10');

    // 5. Actividad Reciente (Mezcla de movimientos y asignaciones)
    const actividadRes = await pool.query(`
      (SELECT 'Movimiento' as tipo, s.nombre || ': ' || m.tipo_movimiento || ' (' || m.cantidad || ')' as descripcion, m.fecha, m.tipo_movimiento as estado
       FROM movimientos_suministros m 
       JOIN suministros s ON m.suministro_id = s.id 
       ORDER BY m.fecha DESC LIMIT 5)
      UNION ALL
      (SELECT 'Asignación' as tipo, a.nombre || ' -> ' || o.nombre as descripcion, asig.fecha_asignacion as fecha, asig.estado
       FROM asignaciones_activos asig
       JOIN activos_fijos a ON asig.activo_id = a.id
       JOIN obras o ON asig.obra_id = o.id
       ORDER BY asig.fecha_asignacion DESC LIMIT 5)
      ORDER BY fecha DESC LIMIT 6
    `);

    // 6. Activos por Estado
    const estadosRes = await pool.query(`
      SELECT estado, COUNT(*) as count 
      FROM activos_fijos 
      GROUP BY estado
    `);

    res.json({
      activos: {
        total: activosRes.rows[0].count,
        mantenimiento: activosMantenimientoRes.rows[0].count
      },
      obras: {
        activas: obrasRes.rows[0].count,
        pendientes: obrasProxRes.rows[0].count
      },
      solicitudes: {
        pendientes: solicitudesRes.rows[0].count,
        urgentes: solicitudesUrgentesRes.rows[0].count
      },
      suministros: {
        total: suministrosRes.rows[0].total || 0,
        bajoMinimo: suministrosBajoMinRes.rows[0].count
      },
      actividadReciente: actividadRes.rows,
      estadosDistribucion: estadosRes.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener estadísticas" });
  }
};

module.exports = {
  getStats
};
