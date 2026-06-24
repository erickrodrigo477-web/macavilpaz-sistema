const pool = require('./src/config/db');
require('dotenv').config();

const migrate = async () => {
  try {
    console.log("Creating 'solicitudes_activos' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS solicitudes_activos (
        id SERIAL PRIMARY KEY,
        activo_id INTEGER REFERENCES activos_fijos(id),
        obra_id INTEGER REFERENCES obras(id),
        usuario_id INTEGER REFERENCES usuarios(id), -- Solicitante
        fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aprobado, rechazado, asignado
        aprobado_por INTEGER REFERENCES usuarios(id),
        fecha_aprobacion TIMESTAMP,
        comentario TEXT
      );
    `);
    console.log("Migration applied successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
