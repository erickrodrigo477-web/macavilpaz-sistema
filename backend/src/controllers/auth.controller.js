const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // 3. Generar JWT
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

module.exports = {
  login
};
