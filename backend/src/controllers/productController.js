const productService = require('../services/productService');
const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    const products = await productService.getAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error interno al listar productos' });
  }
};

const getDestacados = async (req, res) => {
  try {
    const productos = await productService.getDestacados();
    res.json(productos);
  } catch {
    res.status(500).json({ message: 'Error al obtener productos destacados' });
  }
};

const add = async (req, res) => {
  try {
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const {
      name, description, price, purchase_price, category,
      marca, unidad_medida, stock, stock_min, stock_max
    } = req.body;

    if (!name || !description || !price || !purchase_price || !category || !marca || !unidad_medida || !stock || !stock_min || !stock_max) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const id = await productService.insertProduct({
      name, description, price, purchase_price, category,
      marca, unidad_medida, stock, stock_min, stock_max, image
    });

    const usuario = req.user?.nombre || req.user?.correo_electronico || 'Desconocido';
    await pool.query('INSERT INTO activities (descripcion, usuario) VALUES (?, ?)', [`Producto agregado: ${name}`, usuario]);

    res.status(201).json({ id, name });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar producto' });
  }
};

const update = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    await productService.updateProduct(req.params.id, data);
    const usuario = req.user?.nombre || req.user?.correo_electronico || 'Desconocido';
    await pool.query('INSERT INTO activities (descripcion, usuario) VALUES (?, ?)', [`Producto actualizado: ${req.body.name}`, usuario]);
    res.status(200).json({ message: 'Producto actualizado' });
  } catch {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

const remove = async (req, res) => {
  try {
    await productService.softDelete(req.params.id);
    const usuario = req.user?.nombre || req.user?.correo_electronico || 'Desconocido';
    await pool.query('INSERT INTO activities (descripcion, usuario) VALUES (?, ?)', [`Producto desactivado: ID ${req.params.id}`, usuario]);
    res.status(200).json({ message: 'Producto desactivado' });
  } catch {
    res.status(500).json({ message: 'Error al desactivar producto' });
  }
};

const filterBy = async (req, res) => {
  const field = req.params.field;
  const value = req.params.value;
  try {
    const result = await productService.getByFilter(field, value);
    res.status(200).json(result);
  } catch {
    res.status(500).json({ message: `Error al filtrar productos por ${field}` });
  }
};

module.exports = {
  getAll,
  getDestacados,
  add,
  update,
  remove,
  filterBy
};
