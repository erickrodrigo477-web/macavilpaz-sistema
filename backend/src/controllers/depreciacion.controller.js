const pool = require('../config/db');

// Calcular depreciación para todos los activos
const getDepreciaciones = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activos_fijos ORDER BY id DESC');
    const hoy = new Date();

    const depreciaciones = result.rows.map(activo => {
      const costo = Number(activo.valor_inicial) || 0;
      const residual = Number(activo.valor_residual) || 0;
      const vidaUtil = Number(activo.vida_util) > 0 ? Number(activo.vida_util) : 1;
      const fechaCompra = new Date(activo.fecha_compra);

      // Calcular años transcurridos
      let anosTranscurridos = 0;
      if (!isNaN(fechaCompra.getTime()) && hoy > fechaCompra) {
        const diffTime = hoy - fechaCompra;
        anosTranscurridos = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      }

      const depreciacionAnual = (costo - residual) / vidaUtil;
      let acumulada = depreciacionAnual * anosTranscurridos;

      // No puede depreciarse más allá del valor residual
      if (acumulada > (costo - residual)) {
        acumulada = costo - residual;
      }

      const valorActual = costo - acumulada;

      return {
        ...activo,
        anos_transcurridos: anosTranscurridos.toFixed(2),
        depreciacion_anual: depreciacionAnual.toFixed(2),
        depreciacion_acumulada_calculada: acumulada.toFixed(2),
        valor_actual_calculado: valorActual.toFixed(2)
      };
    });

    res.json(depreciaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener depreciaciones" });
  }
};

// Actualizar valores contables físicamente en la BD
const syncDepreciacion = async (req, res) => {
  const { rol } = req.user;
  if (rol !== 'Administrador' && rol !== 'Contabilidad') {
    return res.status(403).json({ mensaje: "No tiene permisos para sincronizar contabilidad" });
  }

  try {
    const result = await pool.query('SELECT * FROM activos_fijos');
    const hoy = new Date();
    const updates = [];

    for (const activo of result.rows) {
      const costo = Number(activo.valor_inicial) || 0;
      const residual = Number(activo.valor_residual) || 0;
      const vidaUtil = Number(activo.vida_util) || 1;
      const fechaCompra = new Date(activo.fecha_compra);

      const diffTime = Math.abs(hoy - fechaCompra);
      let anosTranscurridos = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      if (hoy < fechaCompra) anosTranscurridos = 0;

      const depreciacionAnual = (costo - residual) / vidaUtil;
      let acumulada = depreciacionAnual * anosTranscurridos;
      if (acumulada > (costo - residual)) acumulada = costo - residual;
      const valorActual = costo - acumulada;

      updates.push(pool.query(
        'UPDATE activos_fijos SET depreciacion_acumulada = $1, valor_actual = $2 WHERE id = $3',
        [acumulada, valorActual, activo.id]
      ));
    }

    await Promise.all(updates);
    res.json({ mensaje: "Contabilidad sincronizada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al sincronizar contabilidad" });
  }
};

module.exports = {
  getDepreciaciones,
  syncDepreciacion
};
