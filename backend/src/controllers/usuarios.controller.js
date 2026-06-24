const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios con su rol
const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre, u.email, u.creado_en, r.nombre as rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
};

// Obtener todos los roles
const getRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener roles" });
  }
};

// Crear usuario
const createUsuario = async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol_id, creado_en) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id, nombre, email, rol_id',
      [nombre, email, hashedPassword, rol_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear usuario" });
  }
};

// Eliminar usuario
const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al eliminar usuario" });
  }
};

module.exports = {
  getUsuarios,
  getRoles,
  createUsuario,
  deleteUsuario
};
