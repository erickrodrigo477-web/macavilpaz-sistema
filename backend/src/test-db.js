const pool = require('./config/db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error conectando a la DB', err);
  } else {
    console.log('Conexión exitosa:', res.rows);
  }
  pool.end();
});