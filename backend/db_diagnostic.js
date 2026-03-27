const pool = require('./src/config/db');

async function diagnostic() {
  try {
    console.log('\n--- TABLAS EN LA BASE DE DATOS ---');
    const tablas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.table(tablas.rows);

    const checkTable = async (tableName) => {
      console.log(`\n--- SCHEMA ${tableName.toUpperCase()} ---`);
      const schema = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
      `);
      console.table(schema.rows);
    };

    const targetTables = ['activos_fijos', 'asignaciones_activos', 'suministros', 'movimientos_suministros', 'solicitudes_materiales'];
    for (const table of targetTables) {
      await checkTable(table);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

diagnostic();
