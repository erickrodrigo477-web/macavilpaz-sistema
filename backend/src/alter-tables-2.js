const pool = require('./config/db');

async function alterTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Altering solicitudes_materiales to add almacen_recogida_id...');
    await client.query(`
      ALTER TABLE solicitudes_materiales 
      ADD COLUMN IF NOT EXISTS almacen_recogida_id INTEGER;
      -- No strict foreign key constraint for now just in case almacenes table lacks some references, but ideally:
      -- REFERENCES almacenes(id);
    `);
    
    // Add same to solicitudes_activos just in case they decide to use it later
    /*
    await client.query(`
      ALTER TABLE solicitudes_activos 
      ADD COLUMN IF NOT EXISTS almacen_recogida_id INTEGER;
    `);
    */

    await client.query('COMMIT');
    console.log('Tables altered successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error altering tables:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

alterTables();
