const pool = require('../config/db');

const getAll = async () => {
  const [products] = await pool.query('SELECT * FROM products WHERE activo = 1');
  return products.map(p => ({ ...p, low_stock: Number(p.stock) <= Number(p.stock_min) }));
};

const getDestacados = async () => {
  const [rows] = await pool.query(`
    SELECT p.id, p.name, SUM(dv.cantidad) as vendidos, p.stock
    FROM detalle_ventas dv
    JOIN products p ON dv.producto_id = p.id
    GROUP BY p.id, p.name, p.stock
    ORDER BY vendidos DESC
    LIMIT 5
  `);
  return rows;
};

const insertProduct = async (data) => {
  const [result] = await pool.query(`
    INSERT INTO products 
    (name, description, price, purchase_price, category, marca, unidad_medida, stock, stock_min, stock_max, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    Object.values(data)
  );
  return result.insertId;
};

const updateProduct = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const sets = keys.map(key => `${key} = ?`).join(', ');
  values.push(id);
  await pool.query(`UPDATE products SET ${sets} WHERE id = ?`, values);
};

const softDelete = async (id) => {
  await pool.query('UPDATE products SET activo = 0 WHERE id = ?', [id]);
};

const getByFilter = async (field, value) => {
  const [rows] = await pool.query(`SELECT * FROM products WHERE ${field} = ? AND activo = 1`, [value]);
  return rows;
};

module.exports = {
  getAll,
  getDestacados,
  insertProduct,
  updateProduct,
  softDelete,
  getByFilter
};
