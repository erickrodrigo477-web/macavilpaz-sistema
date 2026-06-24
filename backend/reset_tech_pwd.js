const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    await pool.query(
      'UPDATE usuarios SET password = $1 WHERE email = $2',
      [hashedPassword, 'tecnico@test.com']
    );
    
    console.log('Contraseña de tecnico@test.com restablecida a: 123456');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPassword();
