const express = require('express');
const pool = require('../db'); // Conexión a la base de datos

const router = express.Router();

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

// Agregar un producto
router.post('/', async (req, res) => {
  const { name, description, price, category, stock, image } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, category, stock, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, category, stock, image]
    );
    res.status(201).json({ id: result.insertId, name, description, price, category, stock, image });
  } catch (error) {
    console.error('Error al agregar el producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Editar un producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock, image } = req.body;

  try {
    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, image = ? WHERE id = ?',
      [name, description, price, category, stock, image, id]
    );
    res.status(200).json({ message: 'Producto actualizado exitosamente' });
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
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;