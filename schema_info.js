const pool = require('./backend/src/config/db');

async function run() {
  const tables = [
    'roles', 'usuarios', 'obras', 'activos_fijos', 'asignaciones_activos',
    'solicitudes_activos', 'mantenimientos', 'categorias_suministros',
    'suministros', 'almacenes', 'almacen_suministros', 'movimientos_suministros',
    'solicitudes_materiales', 'detalle_solicitudes'
  ];

  for (const t of tables) {
    try {
      const r = await pool.query(
        `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
         FROM information_schema.columns WHERE table_name = '${t}' ORDER BY ordinal_position`
      );
      console.log(`\n=== ${t.toUpperCase()} ===`);
      r.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default}`));
    } catch(e) {
      console.log(`\n=== ${t.toUpperCase()} === NOT FOUND`);
    }
  }

  // Foreign keys
  const fk = await pool.query(`
    SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    ORDER BY tc.table_name
  `);
  console.log('\n=== FOREIGN KEYS ===');
  fk.rows.forEach(r => console.log(`  ${r.table_name}.${r.column_name} -> ${r.foreign_table}.${r.foreign_column}`));

  pool.end();
}
run().catch(console.error);
