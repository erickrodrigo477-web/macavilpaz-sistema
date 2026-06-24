const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { enviarRecuperacion } = require('../services/email.service');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar usuario con su rol
    const result = await pool.query(`
      SELECT u.*, r.nombre as rol_nombre 
      FROM usuarios u 
      JOIN roles r ON u.rol_id = r.id 
      WHERE u.email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];

    // 2. Verificar password (por ahora simple para pruebas si no están hasheadas, 
    // pero implementaremos bcrypt de una vez)
    // NOTA: Si la DB tiene passwords en plano, bcrypt.compare fallará. 
    // Haremos un fallback temporal para facilitar la transición si es necesario.
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, usuario.password);
    } catch (e) {
      isMatch = false;
    }
    
    // Fallback para contraseñas en plano (facilitar pruebas/migración)
    if (!isMatch) {
      isMatch = (password === usuario.password);
    }

    if (!isMatch) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // 3. Verificar si el usuario está habilitado
    if (usuario.activo === false) {
      return res.status(403).json({ mensaje: "Tu cuenta está deshabilitada. Contacta al administrador." });
    }
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol_nombre },
      process.env.JWT_SECRET || 'secret_macavilpaz_2026',
      { expiresIn: '8h' }
    );

    // 4. Enviar respuesta
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol_nombre
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

const cambiarPassword = async (req, res) => {
  const { id } = req.user;
  const { passwordActual, passwordNueva } = req.body;

  try {
    const result = await pool.query('SELECT password FROM usuarios WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const usuario = result.rows[0];

    // Verificar password actual
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(passwordActual, usuario.password);
    } catch (e) {
      isMatch = false;
    }

    if (!isMatch) {
      isMatch = (passwordActual === usuario.password);
    }

    if (!isMatch) return res.status(400).json({ mensaje: "La contraseña actual es incorrecta" });

    // Hashear nueva password
    const hashedPassword = await bcrypt.hash(passwordNueva, 10);

    // Actualizar DB
    await pool.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hashedPassword, id]);

    res.json({ mensaje: "Contraseña actualizada exitosamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al cambiar la contraseña" });
  }
};

const recuperarPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ mensaje: "El correo es requerido" });

  try {
    const result = await pool.query('SELECT id, nombre, activo FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "No existe un usuario con ese correo electrónico" });
    }

    const usuario = result.rows[0];
    if (!usuario.activo) {
      return res.status(403).json({ mensaje: "La cuenta está deshabilitada" });
    }

    // Generar contraseña temporal segura
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
    const passwordPlana = Array.from({ length: 10 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');

    const hashedPassword = await bcrypt.hash(passwordPlana, 10);

    // Actualizar en base de datos
    await pool.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hashedPassword, usuario.id]);

    // Enviar correo
    try {
      await enviarRecuperacion(email, usuario.nombre, passwordPlana);
    } catch (mailErr) {
      console.error('Error al enviar correo de recuperación:', mailErr.message);
      return res.status(500).json({ mensaje: "Error al enviar el correo de recuperación. Verifica la configuración del servidor de correo." });
    }

    res.json({ mensaje: "Se ha enviado una contraseña temporal a tu correo electrónico" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al recuperar la contraseña" });
  }
};

module.exports = {
  login,
  cambiarPassword,
  recuperarPassword
};
