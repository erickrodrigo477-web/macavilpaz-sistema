const pool = require('../config/db');

const getStats = async (req, res) => {
  try {
    const { rol, id: usuario_id } = req.user;
    
    let kpis = [];
    let actividadReciente = [];
    let estadosDistribucion = [];

    if (rol === 'Administrador') {
      // 1. KPIs Administrador
      const activosRes = await pool.query('SELECT COUNT(*) FROM activos_fijos');
      const activosMantenimientoRes = await pool.query("SELECT COUNT(*) FROM activos_fijos WHERE estado ILIKE 'mantenimiento'");
      const obrasRes = await pool.query("SELECT COUNT(*) FROM obras");
      const obrasProxRes = await pool.query("SELECT COUNT(*) FROM obras WHERE fecha_inicio > CURRENT_DATE");
      const solicitudesRes = await pool.query("SELECT COUNT(*) FROM solicitudes_materiales WHERE estado ILIKE 'pendiente'");
      const solicitudesUrgentesRes = await pool.query("SELECT COUNT(*) FROM solicitudes_materiales WHERE estado ILIKE 'urgente'");
      const suministrosRes = await pool.query('SELECT SUM(stock) as total FROM suministros');
      const suministrosBajoMinRes = await pool.query('SELECT COUNT(*) FROM suministros WHERE stock < 10');

      kpis = [
        { title: "Total Activos Fijos", value: activosRes.rows[0].count, subtitle: `${activosMantenimientoRes.rows[0].count} en mantenimiento`, iconType: "activos", color: "#f87171" },
        { title: "Obras Activas", value: obrasRes.rows[0].count, subtitle: `${obrasProxRes.rows[0].count} por iniciar`, iconType: "obras", color: "#3b82f6" },
        { title: "Solicitudes Pendientes", value: solicitudesRes.rows[0].count, subtitle: `${solicitudesUrgentesRes.rows[0].count} urgentes`, iconType: "solicitudes", color: "#f59e0b" },
        { title: "Suministros en Stock", value: suministrosRes.rows[0].total || 0, subtitle: `${suministrosBajoMinRes.rows[0].count} bajo mínimo`, iconType: "suministros", color: "#10b981" },
      ];

      // Actividad Global
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
      actividadReciente = actividadRes.rows;

      // Distribución
      const estadosRes = await pool.query(`SELECT estado, COUNT(*) as count FROM activos_fijos GROUP BY estado`);
      estadosDistribucion = estadosRes.rows;

    } else if (rol === 'Supervisor de Obra') {
      // KPIs Supervisor
      const misObrasRes = await pool.query('SELECT COUNT(*) FROM obras WHERE supervisor_id = $1', [usuario_id]);
      const misSolMatRes = await pool.query("SELECT COUNT(*) FROM solicitudes_materiales WHERE usuario_id = $1 AND estado ILIKE 'pendiente'", [usuario_id]);
      const misSolActRes = await pool.query("SELECT COUNT(*) FROM solicitudes_activos WHERE usuario_id = $1 AND estado ILIKE 'pendiente'", [usuario_id]);
      const activosAsignadosRes = await pool.query(`
        SELECT COUNT(*) FROM asignaciones_activos a 
        JOIN obras o ON a.obra_id = o.id 
        WHERE o.supervisor_id = $1 AND a.estado ILIKE 'Asignado'
      `, [usuario_id]);

      kpis = [
        { title: "Mis Obras", value: misObrasRes.rows[0].count, subtitle: "Obras a cargo", iconType: "obras", color: "#3b82f6" },
        { title: "Activos Asignados", value: activosAsignadosRes.rows[0].count, subtitle: "En mis obras", iconType: "activos", color: "#f87171" },
        { title: "Sol. de Suministros", value: misSolMatRes.rows[0].count, subtitle: "Pendientes", iconType: "suministros", color: "#10b981" },
        { title: "Sol. de Activos", value: misSolActRes.rows[0].count, subtitle: "Pendientes", iconType: "solicitudes", color: "#f59e0b" },
      ];

      // Actividad: Sus solicitudes
      const actividadRes = await pool.query(`
        (SELECT 'Solicitud Suministro' as tipo, s.nombre || ' (Cant: ' || sm.cantidad || ')' as descripcion, sm.fecha_solicitud as fecha, sm.estado
         FROM solicitudes_materiales sm
         JOIN suministros s ON sm.suministro_id = s.id
         WHERE sm.usuario_id = $1 ORDER BY sm.fecha_solicitud DESC LIMIT 5)
        UNION ALL
        (SELECT 'Solicitud Activo' as tipo, a.nombre as descripcion, sa.fecha_solicitud as fecha, sa.estado
         FROM solicitudes_activos sa
         JOIN activos_fijos a ON sa.activo_id = a.id
         WHERE sa.usuario_id = $1 ORDER BY sa.fecha_solicitud DESC LIMIT 5)
        ORDER BY fecha DESC LIMIT 6
      `, [usuario_id]);
      actividadReciente = actividadRes.rows;

    } else if (rol === 'Almacén' || rol === 'Personal de Almacén') {
      // KPIs Almacén
      const solMatPendientes = await pool.query("SELECT COUNT(*) FROM solicitudes_materiales WHERE estado ILIKE 'pendiente'");
      const solActPendientes = await pool.query("SELECT COUNT(*) FROM solicitudes_activos WHERE estado ILIKE 'aprobado'");
      const sumBajoMin = await pool.query('SELECT COUNT(*) FROM suministros WHERE stock < 10');
      const movHoy = await pool.query('SELECT COUNT(*) FROM movimientos_suministros WHERE DATE(fecha) = CURRENT_DATE');

      kpis = [
        { title: "Sol. Suministros", value: solMatPendientes.rows[0].count, subtitle: "Pendientes", iconType: "suministros", color: "#10b981" },
        { title: "Entregas Activos", value: solActPendientes.rows[0].count, subtitle: "Aprobadas, por entregar", iconType: "activos", color: "#3b82f6" },
        { title: "Suministros Bajo Mínimo", value: sumBajoMin.rows[0].count, subtitle: "Requieren reposición", iconType: "alert", color: "#ef4444" },
        { title: "Movimientos Hoy", value: movHoy.rows[0].count, subtitle: "Entradas y Salidas", iconType: "movimientos", color: "#f59e0b" },
      ];

      const actividadRes = await pool.query(`
        SELECT 'Movimiento' as tipo, s.nombre || ': ' || m.tipo_movimiento || ' (' || m.cantidad || ')' as descripcion, m.fecha, m.tipo_movimiento as estado
        FROM movimientos_suministros m 
        JOIN suministros s ON m.suministro_id = s.id 
        ORDER BY m.fecha DESC LIMIT 6
      `);
      actividadReciente = actividadRes.rows;

    } else if (rol === 'Técnico') {
      // KPIs Técnico
      const mantenimientosPendientes = await pool.query("SELECT COUNT(*) FROM mantenimiento_activos WHERE estado_mantenimiento ILIKE 'En progreso' OR estado_mantenimiento ILIKE 'Pendiente'");
      const activosMantenimiento = await pool.query("SELECT COUNT(*) FROM activos_fijos WHERE estado ILIKE 'Mantenimiento'");
      const mantCompletados = await pool.query("SELECT COUNT(*) FROM mantenimiento_activos WHERE estado_mantenimiento ILIKE 'Completado'");
      const misSolMatRes = await pool.query("SELECT COUNT(*) FROM solicitudes_materiales WHERE usuario_id = $1 AND estado ILIKE 'pendiente'", [usuario_id]);

      kpis = [
        { title: "Mantenimientos Pendientes", value: mantenimientosPendientes.rows[0].count, subtitle: "En progreso / Pendientes", iconType: "mantenimiento", color: "#f59e0b" },
        { title: "Activos en Mantenimiento", value: activosMantenimiento.rows[0].count, subtitle: "Total actual", iconType: "activos", color: "#ef4444" },
        { title: "Mant. Completados", value: mantCompletados.rows[0].count, subtitle: "Histórico", iconType: "check", color: "#10b981" },
        { title: "Mis Sol. Materiales", value: misSolMatRes.rows[0].count, subtitle: "Pendientes", iconType: "suministros", color: "#3b82f6" },
      ];

      const actividadRes = await pool.query(`
        SELECT 'Mantenimiento' as tipo, a.nombre || ' (' || ma.tipo || ')' as descripcion, ma.fecha, ma.estado_mantenimiento as estado
        FROM mantenimiento_activos ma
        JOIN activos_fijos a ON ma.activo_id = a.id
        ORDER BY ma.fecha DESC LIMIT 6
      `);
      actividadReciente = actividadRes.rows;
    } else {
      // Rol por defecto o invitado
      kpis = [
        { title: "Bienvenido", value: "-", subtitle: "Rol sin métricas definidas", iconType: "usuarios", color: "#888" }
      ];
    }

    res.json({
      kpis,
      actividadReciente,
      estadosDistribucion
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener estadísticas" });
  }
};

module.exports = {
  getStats
};
