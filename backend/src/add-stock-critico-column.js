const pool = require('./config/db');

async function addColumn() {
  try {
    await pool.query(`
      ALTER TABLE suministros
      ADD COLUMN IF NOT EXISTS stock_critico NUMERIC(10,2) DEFAULT 0;
    `);
    console.log("Columna stock_critico añadida a la tabla suministros.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

addColumn();
