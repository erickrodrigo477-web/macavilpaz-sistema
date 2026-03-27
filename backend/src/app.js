const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Configuración del puerto
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/activos", require("./routes/activos.routes"));
app.use("/api/suministros", require("./routes/suministros.routes"));
app.use("/api/obras", require("./routes/obras.routes"));
app.use("/api/solicitudes", require("./routes/solicitudes.routes"));
app.use("/api/usuarios", require("./routes/usuarios.routes"));
app.use("/api/asignaciones", require("./routes/asignaciones.routes"));
app.use("/api/activos/solicitudes", require("./routes/solicitudes_activos.routes"));
app.use("/api/almacenes", require("./routes/almacenes.routes"));
app.use("/api/movimientos", require("./routes/movimientos.routes"));
app.use("/api/compras", require("./routes/compras.routes"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.status(200).json({
    mensaje: "API Macavilpaz funcionando correctamente"
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});