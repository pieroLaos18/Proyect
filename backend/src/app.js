const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth'); // Importar las rutas de autenticación
const productRoutes = require('./routes/products'); // Importar las rutas de productos
const salesRoutes = require('./routes/sales'); // Importar las rutas de ventas
const reportsRoutes = require('./routes/reports'); // Importar las rutas de reportes
const usersRouter = require('./routes/users'); // Importar las rutas de usuarios
const activityRoutes = require('./routes/activity'); // Agrega esta línea arriba, con los otros requires
const pool = require('./db'); // Conexión a la base de datos

dotenv.config();

const app = express();

// Crear la carpeta 'uploads' si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Carpeta "uploads" creada.');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Procesa datos JSON
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Procesa datos codificados en URL

// Servir la carpeta 'uploads' como pública
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes); // Conectar las rutas de autenticación
app.use('/api/products', productRoutes); // Conectar las rutas de productos
app.use('/api/sales', salesRoutes); // Conectar las rutas de ventas
app.use('/api/reports', reportsRoutes); // Conectar las rutas de reportes
app.use('/api/users', usersRouter); // Conectar las rutas de usuarios
app.use('/api/actividades', activityRoutes); // Agrega esta línea junto a las otras rutas

// Verificar conexión a la base de datos
pool.getConnection()
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch((err) => console.error('Error al conectar a la base de datos:', err));

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));