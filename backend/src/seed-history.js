const pool = require('./config/db');

async function seedHistory() {
  try {
    console.log('Limpiando historial previo...');
    await pool.query('TRUNCATE TABLE asignaciones_activos, mantenimientos RESTART IDENTITY CASCADE');

    const obraId = 1;
    const usuarioId = 1;

    // Asignaciones Pasadas (Uso para el cálculo de intensidad)
    const asignaciones = [
      // Excavadora (ID 1) - Uso Intensivo
      { activo_id: 1, fecha_asig: '2023-01-01', fecha_dev: '2023-06-30' },
      { activo_id: 1, fecha_asig: '2023-08-15', fecha_dev: '2024-02-10' },
      { activo_id: 1, fecha_asig: '2024-03-01', fecha_dev: null }, // Sigue asignada

      // Volqueta (ID 2)
      { activo_id: 2, fecha_asig: '2023-05-10', fecha_dev: '2023-12-20' },
      { activo_id: 2, fecha_asig: '2024-01-15', fecha_dev: null },

      // Cargador Frontal (ID 4)
      { activo_id: 4, fecha_asig: '2022-01-01', fecha_dev: '2022-12-31' },
      { activo_id: 4, fecha_asig: '2023-02-15', fecha_dev: '2023-11-15' },

      // Camioneta (ID 7)
      { activo_id: 7, fecha_asig: '2023-07-01', fecha_dev: null }
    ];

    console.log('Insertando asignaciones históricas...');
    for (const a of asignaciones) {
      await pool.query(
        'INSERT INTO asignaciones_activos (activo_id, obra_id, usuario_id, fecha_asignacion, fecha_devolucion, estado) VALUES ($1, $2, $3, $4, $5, $6)',
        [a.activo_id, obraId, usuarioId, a.fecha_asig, a.fecha_dev, a.fecha_dev ? 'Finalizado' : 'Activo']
      );
    }

    // Mantenimientos Pasados
    const mantenimientos = [
      // Excavadora (ID 1) - Fallas recurrentes
      { activo_id: 1, fecha: '2023-03-15', tipo: 'Preventivo', desc: 'Cambio de aceite y filtros', costo: 450.00 },
      { activo_id: 1, fecha: '2023-11-20', tipo: 'Correctivo', desc: 'Reparación de manguera hidráulica rota', costo: 1200.00 },
      { activo_id: 1, fecha: '2024-01-10', tipo: 'Correctivo', desc: 'Fallo en motor de arranque', costo: 850.00 },
      { activo_id: 1, fecha: '2024-03-25', tipo: 'Correctivo', desc: 'Pérdida de presión en bomba principal', costo: 3200.00 },

      // Volqueta (ID 2)
      { activo_id: 2, fecha: '2023-06-15', tipo: 'Preventivo', desc: 'Mantenimiento periodico', costo: 300.00 },
      { activo_id: 2, fecha: '2024-01-05', tipo: 'Preventivo', desc: 'Revision de frenos y suspensión', costo: 600.00 },

      // Cargador Frontal (ID 4)
      { activo_id: 4, fecha: '2023-05-10', tipo: 'Preventivo', desc: 'Cambio de neumáticos delanteros', costo: 2500.00 },
      
      // Generador (ID 5) - Solo preventivo
      { activo_id: 5, fecha: '2023-10-15', tipo: 'Preventivo', desc: 'Limpieza de inyectores', costo: 200.00 }
    ];

    console.log('Insertando mantenimientos históricos...');
    for (const m of mantenimientos) {
      await pool.query(
        'INSERT INTO mantenimientos (activo_id, fecha_mantenimiento, tipo_mantenimiento, descripcion, costo, tecnico) VALUES ($1, $2, $3, $4, $5, $6)',
        [m.activo_id, m.fecha, m.tipo, m.desc, m.costo, 'Técnico Externo']
      );
    }

    console.log('Seeding de historial completado con éxito.');
  } catch (err) {
    console.error('Error durante el seeding de historial:', err);
  } finally {
    pool.end();
  }
}

seedHistory();
