const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/macavilpaz_db' });

async function dumpSchema() {
  try {
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `;
    const tablesRes = await pool.query(tablesQuery);
    
    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      console.log(`\nTable: ${tableName}`);
      
      const colsQuery = `
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `;
      const colsRes = await pool.query(colsQuery, [tableName]);
      colsRes.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) [Null: ${col.is_nullable}]`);
      });
      
      const fkQuery = `
        SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1;
      `;
      const fkRes = await pool.query(fkQuery, [tableName]);
      fkRes.rows.forEach(fk => {
        console.log(`  * FK: ${fk.column_name} -> ${fk.foreign_table_name}(${fk.foreign_column_name})`);
      });
    }
    
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
dumpSchema();
