const pool = require('./config/db');

pool.query(`
  SELECT table_name, column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position
`).then(res => {
  let currentTable = '';
  res.rows.forEach(row => {
    if (row.table_name !== currentTable) {
      currentTable = row.table_name;
      console.log(`\n=== ${currentTable} ===`);
    }
    console.log(`  ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
  });
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});
