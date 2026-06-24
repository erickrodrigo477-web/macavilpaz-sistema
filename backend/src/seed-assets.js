const pool = require('./config/db');

const assets = [
  {
    nombre: "Excavadora Hidráulica CAT 320 GC",
    descripcion: "Excavadora de 20 toneladas con motor C4.4, ideal para movimiento de tierras pesado.",
    codigo_inventario: "EXC-001",
    estado: "operativo",
    fecha_compra: "2021-05-15",
    valor_inicial: 185000.00,
    ubicacion: "Obra Viaducto Central",
    valor_residual: 35000.00,
    vida_util: 10
  },
  {
    nombre: "Volqueta Mercedes-Benz Arocs 3345",
    descripcion: "Camión volquete 6x4, capacidad 16m3, motor de 450 HP.",
    codigo_inventario: "VOL-002",
    estado: "operativo",
    fecha_compra: "2022-03-10",
    valor_inicial: 142000.00,
    ubicacion: "Obra San José",
    valor_residual: 28000.00,
    vida_util: 8
  },
  {
    nombre: "Motoniveladora Caterpillar 140 GC",
    descripcion: "Motoniveladora para nivelación de precisión y mantenimiento de caminos.",
    codigo_inventario: "MOT-001",
    estado: "asignado",
    fecha_compra: "2020-11-20",
    valor_inicial: 210000.00,
    ubicacion: "Tramo Carretero Sur",
    valor_residual: 42000.00,
    vida_util: 12
  },
  {
    nombre: "Cargador Frontal Komatsu WA380-6",
    descripcion: "Cargador de ruedas de alto rendimiento para canteras y construcción.",
    codigo_inventario: "CRG-001",
    estado: "operativo",
    fecha_compra: "2019-06-25",
    valor_inicial: 165000.00,
    ubicacion: "Cantera Los Andes",
    valor_residual: 30000.00,
    vida_util: 10
  },
  {
    nombre: "Generador Eléctrico Perkins 150kVA",
    descripcion: "Grupo electrógeno insonorizado para suministro de energía en sitio.",
    codigo_inventario: "GEN-003",
    estado: "operativo",
    fecha_compra: "2023-01-12",
    valor_inicial: 24500.00,
    ubicacion: "Almacén Central",
    valor_residual: 4500.00,
    vida_util: 15
  },
  {
    nombre: "Mezcladora de Hormigón Autopropulsada Fiori DB X35",
    descripcion: "Mezcladora todoterreno con capacidad de 3.5m3 por ciclo.",
    codigo_inventario: "MEZ-002",
    estado: "mantenimiento",
    fecha_compra: "2022-08-05",
    valor_inicial: 85000.00,
    ubicacion: "Taller Mecánico",
    valor_residual: 15000.00,
    vida_util: 8
  },
  {
    nombre: "Camioneta Toyota Hilux 4x4",
    descripcion: "Vehículo de supervisión y transporte de personal en obra.",
    codigo_inventario: "VHL-001",
    estado: "asignado",
    fecha_compra: "2023-05-30",
    valor_inicial: 42000.00,
    ubicacion: "Obra San José",
    valor_residual: 12000.00,
    vida_util: 5
  },
  {
    nombre: "Estación Total Leica FlexLine TS07",
    descripcion: "Equipo de alta precisión para levantamientos topográficos.",
    codigo_inventario: "TOP-001",
    estado: "operativo",
    fecha_compra: "2024-02-15",
    valor_inicial: 12500.00,
    ubicacion: "Oficina Técnica",
    valor_residual: 2000.00,
    vida_util: 5
  },
  {
    nombre: "Compactadora de Rodillo Liso Dynapac CA250",
    descripcion: "Rodillo vibratorio para compactación de suelos y bases.",
    codigo_inventario: "CMP-001",
    estado: "operativo",
    fecha_compra: "2021-09-18",
    valor_inicial: 95000.00,
    ubicacion: "Obra Viaducto Central",
    valor_residual: 18000.00,
    vida_util: 10
  },
  {
    nombre: "Estructura de Andamios Multidireccionales (Lote 500m2)",
    descripcion: "Sistema de andamiaje certificado para trabajos en altura.",
    codigo_inventario: "AND-001",
    estado: "operativo",
    fecha_compra: "2023-11-02",
    valor_inicial: 18000.00,
    ubicacion: "Almacén Norte",
    valor_residual: 2000.00,
    vida_util: 15
  }
];

async function seed() {
  try {
    console.log('Limpiando tablas de activos (con cascada)...');
    await pool.query('TRUNCATE TABLE activos_fijos RESTART IDENTITY CASCADE');
    
    console.log('Insertando activos reales...');
    for (const a of assets) {
      // Cálculo inicial de depreciación para que nazcan con coherencia
      const hoy = new Date();
      const fechaCompra = new Date(a.fecha_compra);
      const diffTime = Math.abs(hoy - fechaCompra);
      let anosTranscurridos = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      if (hoy < fechaCompra) anosTranscurridos = 0;

      const depreciacionAnual = (a.valor_inicial - a.valor_residual) / a.vida_util;
      let acumulada = depreciacionAnual * anosTranscurridos;
      if (acumulada > (a.valor_inicial - a.valor_residual)) acumulada = a.valor_inicial - a.valor_residual;
      const valorActual = a.valor_inicial - acumulada;

      await pool.query(
        `INSERT INTO activos_fijos 
        (nombre, descripcion, codigo_inventario, estado, fecha_compra, ubicacion, valor_inicial, valor_actual, depreciacion_acumulada, valor_residual, vida_util) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          a.nombre, a.descripcion, a.codigo_inventario, a.estado, a.fecha_compra, 
          a.ubicacion, a.valor_inicial, valorActual, acumulada, a.valor_residual, a.vida_util
        ]
      );
    }
    
    console.log('Seeding completado con éxito.');
  } catch (err) {
    console.error('Error durante el seeding:', err);
  } finally {
    pool.end();
  }
}

seed();
