const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function hashOldPasswords() {
  try {
    const users = await pool.query('SELECT id, password FROM usuarios');
    
    for (const user of users.rows) {
      if (!user.password.startsWith('$2a$')) { // No está hasheada
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        await pool.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hash, user.id]);
        console.log(`Usuario ${user.id} actualizado.`);
      }
    }
    
    console.log('Todas las contraseñas procesadas.');
    pool.end();
  } catch (err) {
    console.error(err);
    pool.end();
  }
}

hashOldPasswords();
