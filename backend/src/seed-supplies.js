const pool = require('./config/db');

const categories = [
  "Materiales de Construcción",
  "Ferretería y Tornillería",
  "Herramientas Manuales",
  "Equipo de Protección Personal (EPP)",
  "Instalaciones Eléctricas",
  "Plomería y Fontanería",
  "Repuestos para Maquinaria"
];

const supplies = [
  // Materiales de Construcción
  { nombre: "Cemento Portland IP-30", descripcion: "Bolsa de 50kg, alta resistencia inicial.", unidad: "Bolsa", stock: 500, categoria: "Materiales de Construcción", precio: 55.50 },
  { nombre: "Fierro Corrugado 12mm", descripcion: "Barra de 12 metros, Grado 60.", unidad: "Barra", stock: 120, categoria: "Materiales de Construcción", precio: 88.00 },
  { nombre: "Arena Fina Tamizada", descripcion: "Para revoques y acabados finos.", unidad: "m3", stock: 15, categoria: "Materiales de Construcción", precio: 180.00 },
  { nombre: "Gravilla 3/4", descripcion: "Piedra chancada para concreto estructural.", unidad: "m3", stock: 20, categoria: "Materiales de Construcción", precio: 210.00 },
  { nombre: "Ladrillo de 6 Huecos", descripcion: "Para muros divisorios, 24x12x18cm.", unidad: "Millar", stock: 5, categoria: "Materiales de Construcción", precio: 1250.00 },

  // Ferretería
  { nombre: "Clavo para Madera 2 1/2\"", descripcion: "Caja de 20kg, acero al carbono.", unidad: "Caja", stock: 10, categoria: "Ferretería y Tornillería", precio: 145.00 },
  { nombre: "Alambre de Amarre #16", descripcion: "Rollo de 50kg, recocido.", unidad: "Rollo", stock: 8, categoria: "Ferretería y Tornillería", precio: 320.00 },

  // Herramientas
  { nombre: "Pala Cuadrada Tramontina", descripcion: "Mango de madera de alta resistencia.", unidad: "Unidad", stock: 25, categoria: "Herramientas Manuales", precio: 115.00 },
  { nombre: "Carretilla Reforzada 80L", descripcion: "Rueda neumática, balde de chapa 1.2mm.", unidad: "Unidad", stock: 12, categoria: "Herramientas Manuales", precio: 450.00 },
  { nombre: "Martillo de Uña 20oz", descripcion: "Mango de fibra de vidrio anti-vibración.", unidad: "Unidad", stock: 15, categoria: "Herramientas Manuales", precio: 95.00 },

  // EPP
  { nombre: "Casco de Seguridad MSA V-Gard", descripcion: "Color blanco, con suspensión de 4 puntos.", unidad: "Unidad", stock: 60, categoria: "Equipo de Protección Personal (EPP)", precio: 75.00 },
  { nombre: "Botas de Seguridad con Punta de Acero", descripcion: "Tallas 38-44, cuero hidrófugo.", unidad: "Par", stock: 45, categoria: "Equipo de Protección Personal (EPP)", precio: 280.00 },
  { nombre: "Guantes de Nitrilo Revestidos", descripcion: "Paquete de 12 pares, para manejo de materiales.", unidad: "Paquete", stock: 20, categoria: "Equipo de Protección Personal (EPP)", precio: 110.00 },
  { nombre: "Chaleco Reflectivo Clase 2", descripcion: "Alta visibilidad, color naranja fluor.", unidad: "Unidad", stock: 50, categoria: "Equipo de Protección Personal (EPP)", precio: 35.00 },

  // Eléctrico
  { nombre: "Cable Eléctrico #12 AWG", descripcion: "Rollo de 100m, cobre THHN sólido.", unidad: "Rollo", stock: 15, categoria: "Instalaciones Eléctricas", precio: 480.00 },
  { nombre: "Tubo Conduit 3/4\"", descripcion: "Tira de 3m, PVC pesado.", unidad: "Tira", stock: 100, categoria: "Instalaciones Eléctricas", precio: 22.00 },

  // Repuestos
  { nombre: "Filtro de Aceite para Excavadora CAT 320", descripcion: "Código original 1R-0739.", unidad: "Unidad", stock: 6, categoria: "Repuestos para Maquinaria", precio: 245.00 },
  { nombre: "Aceite Hidráulico SAE 10W", descripcion: "Balde de 20 litros, alta viscosidad.", unidad: "Balde", stock: 10, categoria: "Repuestos para Maquinaria", precio: 680.00 }
];

async function seed() {
  try {
    console.log('Limpiando tablas de suministros (con cascada)...');
    await pool.query('TRUNCATE TABLE categorias_suministros RESTART IDENTITY CASCADE');
    
    console.log('Insertando categorías...');
    const catMap = {};
    for (const name of categories) {
      const res = await pool.query('INSERT INTO categorias_suministros (nombre) VALUES ($1) RETURNING id', [name]);
      catMap[name] = res.rows[0].id;
    }

    console.log('Insertando suministros reales...');
    for (const s of supplies) {
      await pool.query(
        `INSERT INTO suministros (nombre, descripcion, unidad, stock, categoria_id, precio_unitario) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [s.nombre, s.descripcion, s.unidad, s.stock, catMap[s.categoria], s.precio]
      );
    }
    
    console.log('Seeding de suministros completado con éxito.');
  } catch (err) {
    console.error('Error durante el seeding de suministros:', err);
  } finally {
    pool.end();
  }
}

seed();
