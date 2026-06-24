const pool = require('./config/db');

async function addColumns() {
  try {
    console.log('Agregando columnas a la tabla activos_fijos...');
    
    // Añadir valor_residual si no existe
    await pool.query(`
      ALTER TABLE activos_fijos 
      ADD COLUMN IF NOT EXISTS valor_residual NUMERIC(15,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS vida_util INTEGER DEFAULT 5;
    `);
    
    console.log('Columnas agregadas correctamente.');
  } catch (err) {
    console.error('Error al agregar columnas:', err);
  } finally {
    pool.end();
  }
}

addColumns();
