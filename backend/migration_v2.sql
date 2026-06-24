-- Migración para el flujo avanzado de solicitudes de suministros

-- 1. Actualizar detalle_solicitudes
ALTER TABLE detalle_solicitudes 
ADD COLUMN cantidad_solicitada INTEGER,
ADD COLUMN cantidad_disponible INTEGER,
ADD COLUMN faltante INTEGER,
ADD COLUMN cantidad_entregada INTEGER DEFAULT 0,
ADD COLUMN saldo_pendiente INTEGER;

-- Migrar datos existentes
UPDATE detalle_solicitudes 
SET cantidad_solicitada = cantidad,
    cantidad_disponible = cantidad,
    faltante = 0,
    cantidad_entregada = 0,
    saldo_pendiente = cantidad;

-- 2. Actualizar solicitudes_materiales
ALTER TABLE solicitudes_materiales
ADD COLUMN aprobado_por INTEGER REFERENCES usuarios(id),
ADD COLUMN fecha_aprobacion TIMESTAMP,
ADD COLUMN autorizado_por_contabilidad INTEGER REFERENCES usuarios(id),
ADD COLUMN fecha_autorizacion TIMESTAMP;

-- Actualizar estados existentes (opcional, pero ayuda a la consistencia)
UPDATE solicitudes_materiales SET estado = 'Pendiente de Aprobación' WHERE estado = 'Pendiente';
UPDATE solicitudes_materiales SET estado = 'Entregado Totalmente' WHERE estado = 'Entregado';
