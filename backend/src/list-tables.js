const pool = require('./config/db');

pool.query(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name
`).then(res => {
  if (res.rows.length === 0) {
    console.log('No se encontraron tablas en la base de datos.');
  } else {
    console.log('Tablas encontradas:');
    res.rows.forEach(row => console.log(' -', row.table_name));
  }
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
