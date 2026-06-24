const pool = require('./src/config/db');

async function fixStock() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Find all supplies where global_stock != sum of almacenes_stock
    const res = await client.query(`
      SELECT s.id, s.nombre, s.stock as global_stock, COALESCE(SUM(als.stock), 0) as almacenes_stock
      FROM suministros s
      LEFT JOIN almacen_suministros als ON s.id = als.suministro_id
      GROUP BY s.id, s.nombre, s.stock
      HAVING s.stock != COALESCE(SUM(als.stock), 0)
    `);

    console.log(`Found ${res.rows.length} supplies with stock discrepancies.`);

    for (const row of res.rows) {
      const diff = row.almacenes_stock - row.global_stock;
      console.log(`Fixing ${row.nombre}: global=${row.global_stock}, almacenes=${row.almacenes_stock}, diff=${diff}`);
      
      if (diff > 0) {
        // We need to reduce almacenes_stock by diff
        let remainingToDeduct = diff;
        
        // Find almacenes that have this stock
        const als = await client.query('SELECT almacen_id, stock FROM almacen_suministros WHERE suministro_id = $1 AND stock > 0 ORDER BY stock DESC', [row.id]);
        
        for (const al of als.rows) {
          if (remainingToDeduct <= 0) break;
          
          const deduction = Math.min(al.stock, remainingToDeduct);
          await client.query('UPDATE almacen_suministros SET stock = stock - $1 WHERE almacen_id = $2 AND suministro_id = $3', [deduction, al.almacen_id, row.id]);
          remainingToDeduct -= deduction;
        }
      } else if (diff < 0) {
        // We need to add to almacenes_stock
        // Add to Almacen Central (id = 1) or the first one available
        const toAdd = Math.abs(diff);
        await client.query(`
          INSERT INTO almacen_suministros (almacen_id, suministro_id, stock)
          VALUES (1, $1, $2)
          ON CONFLICT (almacen_id, suministro_id) 
          DO UPDATE SET stock = almacen_suministros.stock + EXCLUDED.stock
        `, [row.id, toAdd]);
      }
    }
    
    await client.query('COMMIT');
    console.log('Stock fixed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error fixing stock:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

fixStock();
