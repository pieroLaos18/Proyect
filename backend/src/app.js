// Archivo principal de configuración y arranque del servidor Express

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Importa las rutas de la aplicación
const authRoutes = require('./routes/auth');         // Rutas de autenticación
const productRoutes = require('./routes/products');  // Rutas de productos
const salesRoutes = require('./routes/sales');       // Rutas de ventas
const reportsRoutes = require('./routes/reports');   // Rutas de reportes
const usersRoutes = require('./routes/users');
const activityRoutes = require('./routes/activity'); // Rutas de actividades
const pool = require('./db');                        // Conexión a la base de datos

const app = express();

// Crear la carpeta 'uploads' si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Carpeta "uploads" creada.');
}

// Middleware global
app.use(cors({
  origin: process.env.FRONTEND_URL, // Usa la variable de entorno
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Procesa datos JSON
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Procesa datos codificados en URL

// Servir la carpeta 'uploads' como pública
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas de la API
app.use('/api/auth', authRoutes);           // Rutas de autenticación
app.use('/api/products', productRoutes);    // Rutas de productos
app.use('/api/sales', salesRoutes);         // Rutas de ventas
app.use('/api/reports', reportsRoutes);     // Rutas de reportes
app.use('/api/users', usersRoutes);         // Rutas de usuarios
app.use('/api/actividades', activityRoutes); // Rutas de actividades

// Verificar conexión a la base de datos
pool.getConnection()
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch((err) => console.error('Error al conectar a la base de datos:', err));

// Puerto de escucha del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));