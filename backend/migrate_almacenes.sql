-- Crear tabla de almacenes
CREATE TABLE IF NOT EXISTS almacenes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    ubicacion VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de stock por almacén
CREATE TABLE IF NOT EXISTS almacen_suministros (
    almacen_id INT REFERENCES almacenes(id) ON DELETE CASCADE,
    suministro_id INT REFERENCES suministros(id) ON DELETE CASCADE,
    stock INT DEFAULT 0,
    PRIMARY KEY (almacen_id, suministro_id)
);

-- Insertar Almacén Central si no existe
INSERT INTO almacenes (nombre, ubicacion) 
VALUES ('Almacén Central', 'Oficina Principal')
ON CONFLICT (nombre) DO NOTHING;

-- Migrar stock actual al Almacén Central (solo para suministros que no tengan stock registrado en Almacén Central)
INSERT INTO almacen_suministros (almacen_id, suministro_id, stock)
SELECT (SELECT id FROM almacenes WHERE nombre = 'Almacén Central'), id, stock
FROM suministros s
WHERE NOT EXISTS (
    SELECT 1 FROM almacen_suministros as2 
    WHERE as2.almacen_id = (SELECT id FROM almacenes WHERE nombre = 'Almacén Central')
    AND as2.suministro_id = s.id
);
