const pool = require('./config/db');

async function alterTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add columns to solicitudes_materiales
    console.log('Altering solicitudes_materiales...');
    await client.query(`
      ALTER TABLE solicitudes_materiales 
      ADD COLUMN IF NOT EXISTS entregado_por INTEGER REFERENCES usuarios(id),
      ADD COLUMN IF NOT EXISTS pdf_entrega VARCHAR(255);
    `);

    // Add columns to solicitudes_activos
    console.log('Altering solicitudes_activos...');
    await client.query(`
      ALTER TABLE solicitudes_activos 
      ADD COLUMN IF NOT EXISTS entregado_por INTEGER REFERENCES usuarios(id),
      ADD COLUMN IF NOT EXISTS pdf_entrega VARCHAR(255);
    `);

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
