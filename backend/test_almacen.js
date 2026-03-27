const pool = require('./src/config/db');

async function testAlmacenes() {
  try {
    console.log("=== Testing Almacenes Module ===");
    
    // 1. Get/Create Almacén Norte
    const almRes = await pool.query(
      "INSERT INTO almacenes (nombre, ubicacion) VALUES ('Almacén Norte', 'Zona Norte') ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id"
    );
    const almacenId = almRes.rows[0].id;
    console.log(`[OK] Almacén Norte ID: ${almacenId}`);

    // 2. Insert a dummy suministro
    const sumRes = await pool.query(
      "INSERT INTO suministros (nombre, descripcion, unidad, stock, categoria_id) VALUES ('Cascos Test', 'Test', 'unidad', 0, null) RETURNING id"
    );
    const suministroId = sumRes.rows[0].id;
    console.log(`[OK] Suministro Test ID: ${suministroId}`);

    // 3. Simulate restockSuministros logic (controller simulation)
    const items = [{ suministro_id: suministroId, cantidad: 50 }];
    const targetAlmacenId = almacenId;
    const usuario_id = 1;

    console.log("Simulating restock to Almacén Norte...");
    for (const item of items) {
       // Global stock
       await pool.query('UPDATE suministros SET stock = stock + $1 WHERE id = $2', [item.cantidad, item.suministro_id]);
       // Warehouse specific stock
       await pool.query(
        `INSERT INTO almacen_suministros (almacen_id, suministro_id, stock)
         VALUES ($1, $2, $3)
         ON CONFLICT (almacen_id, suministro_id) 
         DO UPDATE SET stock = almacen_suministros.stock + EXCLUDED.stock`,
        [targetAlmacenId, item.suministro_id, item.cantidad]
      );
    }
    console.log("[OK] Restock applied successfully.");

    // 4. Verify breakdown query (as used in getSuministros)
    const verifyRes = await pool.query(`
      SELECT s.stock as global_stock,
      (
        SELECT json_agg(json_build_object('almacen_id', al.id, 'almacen_nombre', al.nombre, 'stock', als.stock))
        FROM almacen_suministros als
        JOIN almacenes al ON als.almacen_id = al.id
        WHERE als.suministro_id = s.id
      ) as breakdown
      FROM suministros s
      WHERE s.id = $1
    `, [suministroId]);

    console.log("=== Verification Results ===");
    console.log(JSON.stringify(verifyRes.rows[0], null, 2));

    // Cleanup
    await pool.query("DELETE FROM suministros WHERE id = $1", [suministroId]);
    console.log("Cleanup done.");

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

testAlmacenes();
