const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/macavilpaz_db' });

async function research() {
  try {
    const res = await pool.query(`
      SELECT s.*, u.email as solicitante_email, o.nombre as obra_nombre 
      FROM solicitudes_activos s
      JOIN usuarios u ON s.usuario_id = u.id
      JOIN obras o ON s.obra_id = o.id
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
research();
