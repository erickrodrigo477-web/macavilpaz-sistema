const pool = require('../config/db');

const getStats = async (req, res) => {
  try {
    // 1. Total Activos Fijos (y por estado)
    const activosRes = await pool.query('SELECT COUNT(*) FROM activos_fijos');
    const activosMantenimientoRes = await pool.query("SELECT COUNT(*) FROM activos_fijos WHERE estado ILIKE 'mantenimiento'");
    
    // 2. Obras (El esquema actual no tiene columna 'estado')
    const obrasRes = await pool.query("SELECT COUNT(*) FROM obras");
    const obrasProxRes = { rows: [{ count: 0 }] };

    // 3. Solicitudes Pendientes (El esquema no tiene 'prioridad')
    const solicitudesRes = await pool.query("SELECT COUNT(*) FROM solicitudes_materiales WHERE estado ILIKE 'pendiente'");
    const solicitudesUrgentesRes = { rows: [{ count: 0 }] };

    // 4. Suministros (El esquema no tiene 'stock_minimo')
    const suministrosRes = await pool.query('SELECT COUNT(*) FROM suministros');
    const suministrosBajoMinRes = { rows: [{ count: 0 }] };

    // 5. Actividad Reciente (últimos 5 registros de movimientos/asignaciones - Simplificado por ahora)
    
    
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
        total: suministrosRes.rows[0].count,
        bajoMinimo: suministrosBajoMinRes.rows[0].count
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener estadísticas" });
  }
};

module.exports = {
  getStats
};
