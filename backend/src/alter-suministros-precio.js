const pool = require('./config/db');

async function alterTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Altering suministros to add precio_unitario...');
    await client.query(`
      ALTER TABLE suministros 
      ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC(10,2) DEFAULT 0.00;
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
