
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const laboratoriosRoutes = require('./routes/laboratorios.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();

// Configuración del servidor
app.use(cors());
app.use(express.json());

// Ruta para comprobar que el servidor funciona
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de laboratorios
app.use('/api/laboratorios', laboratoriosRoutes);

// Rutas de usuarios
app.use('/api/usuarios', usuariosRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
