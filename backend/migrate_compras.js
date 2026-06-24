const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/macavilpaz_db' });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Tabla de Compras
    await client.query(`
      CREATE TABLE IF NOT EXISTS compras (
        id SERIAL PRIMARY KEY,
        proveedor VARCHAR(255),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total DECIMAL(12, 2) DEFAULT 0,
        usuario_id INTEGER REFERENCES usuarios(id),
        estado VARCHAR(50) DEFAULT 'Completado'
      )
    `);

    // 2. Detalle de Compras
    await client.query(`
      CREATE TABLE IF NOT EXISTS detalle_compras (
        id SERIAL PRIMARY KEY,
        compra_id INTEGER REFERENCES compras(id) ON DELETE CASCADE,
        suministro_id INTEGER REFERENCES suministros(id),
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(12, 2) NOT NULL
      )
    `);

    await client.query('COMMIT');
    console.log('Tablas compras y detalle_compras creadas exitosamente.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en la migración:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
