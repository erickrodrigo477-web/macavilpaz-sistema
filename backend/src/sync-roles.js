const pool = require('./config/db');

async function updateRoles() {
  try {
    const roles = [
      'Administrador',
      'Almacén',
      'Supervisor de Obra',
      'Técnico / Operario',
      'Contabilidad / Finanzas'
    ];

    console.log('Actualizando roles...');
    
    for (const role of roles) {
      await pool.query(`
        INSERT INTO roles (nombre) 
        SELECT CAST($1 AS VARCHAR) WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = $1)
      `, [role]);
    }

    const result = await pool.query('SELECT * FROM roles ORDER BY id');
    console.log('Roles actuales en la DB:');
    console.table(result.rows);

    pool.end();
  } catch (err) {
    console.error('Error al actualizar roles:', err.message);
    pool.end();
  }
}

updateRoles();
