-- Tablas para el Sistema de Mantenimiento Predictivo

-- 1. Tabla de Mantenimientos Realizados
CREATE TABLE IF NOT EXISTS mantenimientos (
    id SERIAL PRIMARY KEY,
    activo_id INTEGER REFERENCES activos_fijos(id) ON DELETE CASCADE,
    fecha_mantenimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_mantenimiento VARCHAR(50), -- Preventivo, Correctivo, Predictivo
    descripcion TEXT,
    costo NUMERIC(15,2) DEFAULT 0,
    tecnico VARCHAR(150),
    proximo_mantenimiento DATE
);

-- 2. Tabla de Inspecciones Manuales (Variables para el modelo)
CREATE TABLE IF NOT EXISTS inspecciones_activos (
    id SERIAL PRIMARY KEY,
    activo_id INTEGER REFERENCES activos_fijos(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha_inspeccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Variables subjetivas mapeadas a escala numérica
    nivel_vibracion INTEGER, -- 1 (Bajo) a 10 (Crítico)
    nivel_ruido INTEGER,     -- 1 a 10
    nivel_calor INTEGER,     -- 1 a 10
    desgaste_visible INTEGER, -- 1 a 10
    
    comentarios TEXT,
    falla_detectada BOOLEAN DEFAULT FALSE
);

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_mantenimientos_activo ON mantenimientos(activo_id);
CREATE INDEX IF NOT EXISTS idx_inspecciones_activo ON inspecciones_activos(activo_id);
