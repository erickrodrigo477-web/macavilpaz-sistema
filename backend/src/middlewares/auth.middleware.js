const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: "Token de autenticación no proporcionado" });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret_macavilpaz_2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(403).json({ mensaje: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
