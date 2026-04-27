const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const perfilesRoutes = require('./routes/perfiles.routes');
const oportunidadesRoutes = require('./routes/oportunidades.routes');
const analisisRoutes = require('./routes/analisis.routes');
const guardadasRoutes = require('./routes/guardadas.routes');
const alertasRoutes = require('./routes/alertas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'API CompraSmart funcionando correctamente'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'CompraSmart Backend',
    status: 'Activo'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/oportunidades', oportunidadesRoutes);
app.use('/api/analisis', analisisRoutes);
app.use('/api/guardadas', guardadasRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.use(errorMiddleware);
module.exports = app;