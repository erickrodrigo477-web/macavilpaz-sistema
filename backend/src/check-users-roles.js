const pool = require('./config/db');

async function checkData() {
  try {
    const roles = await pool.query('SELECT * FROM roles');
    console.log('\n=== ROLES ===');
    console.table(roles.rows);

    const users = await pool.query('SELECT id, nombre, email, rol_id FROM usuarios');
    console.log('\n=== USUARIOS ===');
    console.table(users.rows);

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
  }
}

checkData();
