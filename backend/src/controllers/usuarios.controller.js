const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { enviarCredenciales } = require('../services/email.service');

// Obtener todos los usuarios con su rol
const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre, u.email, u.creado_en, u.activo, r.nombre as rol, r.id as rol_id
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

// Crear usuario (la contraseña se genera automáticamente y se envía por correo)
const createUsuario = async (req, res) => {
  const { nombre, email, rol_id } = req.body;
  try {
    // 1. Generar contraseña aleatoria segura (10 caracteres)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
    const passwordPlana = Array.from({ length: 10 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');

    // 2. Encriptar
    const hashedPassword = await bcrypt.hash(passwordPlana, 10);

    // 3. Guardar en la BD
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol_id, creado_en, activo) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, TRUE) RETURNING id, nombre, email, rol_id',
      [nombre, email, hashedPassword, rol_id]
    );

    // 4. Enviar correo con credenciales
    try {
      await enviarCredenciales(email, nombre, passwordPlana);
    } catch (mailErr) {
      console.error('Error al enviar correo:', mailErr.message);
      // El usuario fue creado correctamente aunque falle el correo
      return res.status(201).json({
        ...result.rows[0],
        advertencia: 'Usuario creado, pero el correo no pudo enviarse. Verifica la configuración de EMAIL_USER y EMAIL_PASS en el .env.'
      });
    }

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

// Habilitar / Deshabilitar usuario (toggle activo)
const toggleEstadoUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET activo = NOT activo WHERE id = $1 RETURNING id, activo',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al cambiar estado del usuario" });
  }
};

// Cambiar el rol de un usuario
const cambiarRolUsuario = async (req, res) => {
  const { id } = req.params;
  const { rol_id } = req.body;
  if (!rol_id) return res.status(400).json({ mensaje: "rol_id es requerido" });
  try {
    const result = await pool.query(
      `UPDATE usuarios SET rol_id = $1 WHERE id = $2
       RETURNING id, nombre`,
      [rol_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json({ mensaje: "Rol actualizado correctamente", usuario: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al cambiar el rol" });
  }
};

module.exports = {
  getUsuarios,
  getRoles,
  createUsuario,
  deleteUsuario,
  toggleEstadoUsuario,
  cambiarRolUsuario
};
