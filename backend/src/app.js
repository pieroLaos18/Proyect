const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth'); // Importar las rutas de autenticación
const pool = require('./db'); // Conexión a la base de datos

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes); // Conectar las rutas de autenticación

// Verificar conexión a la base de datos
pool.getConnection()
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch((err) => console.error('Error al conectar a la base de datos:', err));

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));