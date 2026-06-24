const pool = require('../config/db');

// Obtener todos los almacenes
const getAlmacenes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM almacenes ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: "Error al obtener almacenes" });
    }
};

// Crear almacén
const createAlmacen = async (req, res) => {
    const { nombre, ubicacion } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO almacenes (nombre, ubicacion) VALUES ($1, $2) RETURNING *',
            [nombre, ubicacion]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: "Error al crear almacén" });
    }
};

// Actualizar almacén
const updateAlmacen = async (req, res) => {
    const { id } = req.params;
    const { nombre, ubicacion } = req.body;
    try {
        const result = await pool.query(
            'UPDATE almacenes SET nombre = $1, ubicacion = $2 WHERE id = $3 RETURNING *',
            [nombre, ubicacion, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Almacén no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: "Error al actualizar almacén" });
    }
};

// Obtener inventario detallado de un almacén
const getInventario = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT s.nombre, s.unidad, als.stock
            FROM almacen_suministros als
            JOIN suministros s ON als.suministro_id = s.id
            WHERE als.almacen_id = $1
            ORDER BY s.nombre ASC
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: "Error al obtener inventario del almacén" });
    }
};

// Mover stock entre almacenes
const moverStock = async (req, res) => {
    const { suministro_id, almacen_origen_id, almacen_destino_id, cantidad } = req.body;

    if (!suministro_id || !almacen_origen_id || !almacen_destino_id || !cantidad || cantidad <= 0) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios y la cantidad debe ser mayor a 0' });
    }

    if (almacen_origen_id === almacen_destino_id) {
        return res.status(400).json({ mensaje: 'El almacén de origen y destino no pueden ser el mismo' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Verify source stock
        const origenResult = await client.query(
            'SELECT stock FROM almacen_suministros WHERE almacen_id = $1 AND suministro_id = $2 FOR UPDATE',
            [almacen_origen_id, suministro_id]
        );

        if (origenResult.rows.length === 0 || origenResult.rows[0].stock < cantidad) {
            await client.query('ROLLBACK');
            return res.status(400).json({ mensaje: 'Stock insuficiente en el almacén de origen' });
        }

        // 2. Deduct from source
        await client.query(
            'UPDATE almacen_suministros SET stock = stock - $1 WHERE almacen_id = $2 AND suministro_id = $3',
            [cantidad, almacen_origen_id, suministro_id]
        );

        // 3. Add to destination
        await client.query(
            `INSERT INTO almacen_suministros (almacen_id, suministro_id, stock) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (almacen_id, suministro_id) 
             DO UPDATE SET stock = almacen_suministros.stock + EXCLUDED.stock`,
            [almacen_destino_id, suministro_id, cantidad]
        );

        await client.query('COMMIT');
        res.json({ mensaje: 'Stock transferido exitosamente' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al mover stock:', error);
        res.status(500).json({ mensaje: 'Error al mover stock entre almacenes' });
    } finally {
        client.release();
    }
};

module.exports = {
    getAlmacenes,
    createAlmacen,
    updateAlmacen,
    getInventario,
    moverStock
};

