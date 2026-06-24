-- Migración: Crear tabla mantenimiento_activos
-- Módulo de historial y control de estado de activos fijos

CREATE TABLE IF NOT EXISTS mantenimiento_activos (
  id                SERIAL PRIMARY KEY,
  activo_id         INTEGER NOT NULL REFERENCES activos_fijos(id) ON DELETE CASCADE,
  tipo              VARCHAR(50) NOT NULL CHECK (tipo IN ('Preventivo', 'Correctivo', 'Falla', 'Inspección', 'Cambio de Estado')),
  descripcion       TEXT NOT NULL,
  fecha             TIMESTAMP NOT NULL DEFAULT NOW(),
  responsable       VARCHAR(150),
  estado_resultante VARCHAR(50) CHECK (estado_resultante IN ('Disponible', 'Asignado', 'Mantenimiento')),
  created_at        TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas por activo y fecha
CREATE INDEX IF NOT EXISTS idx_mantenimiento_activo_id ON mantenimiento_activos(activo_id);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_fecha ON mantenimiento_activos(fecha DESC);
