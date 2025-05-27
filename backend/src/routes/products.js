// Rutas para gestión de productos en la API

const express = require('express');
const pool = require('../db'); // Conexión a la base de datos
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configuración de almacenamiento para imágenes de productos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); // Ruta absoluta a la carpeta 'uploads'
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname); // Obtiene la extensión del archivo
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9); // Genera un nombre único
    cb(null, `${uniqueName}${extension}`); // Guarda el archivo con un nombre único y su extensión
  },
});

// Filtro para aceptar solo imágenes válidas
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    const extname = allowedExtensions.includes(ext);
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error(`Solo se permiten imágenes (jpeg, jpg, png, gif). Recibido: ext=${ext}, mime=${file.mimetype}`));
    }
  },
});

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Productos más vendidos (destacados)
router.get('/destacados', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, SUM(dv.cantidad) as vendidos, p.stock
      FROM detalle_ventas dv
      JOIN products p ON dv.producto_id = p.id
      GROUP BY p.id, p.name, p.stock
      ORDER BY vendidos DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos destacados' });
  }
});

// Agregar un producto
router.post('/', upload.single('image'), async (req, res) => {
  const { name, description, price, purchase_price, category, stock, stock_min, stock_max } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !description || !price || !purchase_price || !category || !stock || !image || stock_min === undefined || stock_max === undefined) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, purchase_price, category, stock, stock_min, stock_max, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, purchase_price, category, stock, stock_min, stock_max, image]
    );
    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Producto agregado: ${name}`, req.body.usuario || 'Desconocido']
    );
    res.status(201).json({ id: result.insertId, name, description, price, purchase_price, category, stock, stock_min, stock_max, image });
  } catch (error) {
    console.error('Error al agregar el producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar un producto
router.put('/:id', upload.single('image'), async (req, res) => {
  const { name, description, price, purchase_price, category, stock, stock_min, stock_max } = req.body;

  // Asegura valores por defecto
  const safeStockMin = stock_min !== undefined && stock_min !== null ? stock_min : 0;
  const safeStockMax = stock_max !== undefined && stock_max !== null ? stock_max : 0;

  let query, params;

  if (req.file) {
    const image = `/uploads/${req.file.filename}`;
    query = `
      UPDATE products 
      SET name=?, description=?, price=?, purchase_price=?, category=?, stock=?, stock_min=?, stock_max=?, image=?
      WHERE id=?
    `;
    params = [name, description, price, purchase_price, category, stock, safeStockMin, safeStockMax, image, req.params.id];
  } else {
    query = `
      UPDATE products 
      SET name=?, description=?, price=?, purchase_price=?, category=?, stock=?, stock_min=?, stock_max=?
      WHERE id=?
    `;
    params = [name, description, price, purchase_price, category, stock, safeStockMin, safeStockMax, req.params.id];
  }

  try {
    await pool.query(query, params);
    res.status(200).json({ message: 'Producto actualizado correctamente' });
    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Producto actualizado: ${name}`, req.body.usuario || 'Desconocido']
    );
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Producto eliminado: ID ${id}`, req.body.usuario || 'Desconocido']
    );
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;