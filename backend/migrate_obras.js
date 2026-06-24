const pool = require('./src/config/db');

async function migrate() {
  try {
    await pool.query('ALTER TABLE obras ADD COLUMN IF NOT EXISTS supervisor_id INTEGER REFERENCES usuarios(id)');
    console.log('Columna supervisor_id añadida exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error en la migración:', err);
    process.exit(1);
  }
}

migrate();
