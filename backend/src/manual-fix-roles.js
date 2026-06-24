const pool = require('./config/db');

async function manualUpdate() {
  try {
    console.log('Iniciando actualización manual...');
    
    const res1 = await pool.query("UPDATE roles SET nombre = 'Técnico' WHERE nombre LIKE 'Técnico%'");
    console.log('Resultado Técnico:', res1.rowCount, 'filas afectadas');

    const res2 = await pool.query("UPDATE roles SET nombre = 'Contabilidad' WHERE nombre LIKE 'Contabilidad%'");
    console.log('Resultado Contabilidad:', res2.rowCount, 'filas afectadas');

    const final = await pool.query('SELECT * FROM roles ORDER BY id');
    console.table(final.rows);

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
  }
}

manualUpdate();
