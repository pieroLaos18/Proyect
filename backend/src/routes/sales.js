// Rutas para gestión de ventas en la API

const express = require('express');
const pool = require('../db');
const router = express.Router();

// Obtener todas las ventas y sus productos asociados
router.get('/', async (req, res) => {
  try {
    // Obtén todas las ventas
    const [ventas] = await pool.query('SELECT * FROM ventas');

    // Para cada venta, obtén sus productos
    for (const venta of ventas) {
      const [productos] = await pool.query(`
        SELECT dv.producto_id as id, p.name, dv.cantidad, dv.precio_unitario as precio
        FROM detalle_ventas dv
        JOIN products p ON dv.producto_id = p.id
        WHERE dv.venta_id = ?
      `, [venta.id]);
      venta.productos = productos;
    }

    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
});

// Resumen de ventas (hoy y mes actual, solo no anuladas)
router.get('/resumen', async (req, res) => {
  try {
    // Ventas de hoy (solo no anuladas)
    const [hoy] = await pool.query(
      "SELECT IFNULL(SUM(total),0) as hoy FROM ventas WHERE DATE(fecha) = CURDATE() AND anulada = 0"
    );
    // Ventas del mes (solo no anuladas)
    const [mes] = await pool.query(
      "SELECT IFNULL(SUM(total),0) as mes FROM ventas WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE()) AND anulada = 0"
    );
    res.json({
      hoy: hoy[0].hoy,
      mes: mes[0].mes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener resumen de ventas' });
  }
});

// Ventas por día de la semana (últimos 7 días)
router.get('/ventas-por-dia', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DAYNAME(fecha) as dia,
        DATE(fecha) as fecha,
        SUM(total) as total
      FROM ventas
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY fecha
      ORDER BY fecha
    `);

    // Mapear a días de la semana en español
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const ventasPorDia = diasSemana.map(dia => {
      const row = rows.find(r => {
        // Ajustar nombres según tu base de datos (puede ser en inglés)
        const map = {
          Monday: 'Lunes',
          Tuesday: 'Martes',
          Wednesday: 'Miércoles',
          Thursday: 'Jueves',
          Friday: 'Viernes',
          Saturday: 'Sábado',
          Sunday: 'Domingo'
        };
        return map[r.dia] === dia;
      });
      return {
        dia,
        total: row ? Number(row.total) : 0
      };
    });

    res.json(ventasPorDia);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas por día' });
  }
});

// Obtener detalle de una venta por ID
router.get('/:id', async (req, res) => {
  try {
    const [venta] = await pool.query('SELECT * FROM ventas WHERE id = ?', [req.params.id]);
    const [productos] = await pool.query(`
      SELECT dv.*, p.name 
      FROM detalle_ventas dv
      JOIN products p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?
    `, [req.params.id]);
    // Mapea precio_unitario a precio
    const productosMapeados = productos.map(p => ({
      ...p,
      precio: p.precio_unitario
    }));
    res.json({ ...venta[0], productos: productosMapeados });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener detalle de venta' });
  }
});

// Registrar una nueva venta y actualizar stock
router.post('/', async (req, res) => {
  const { cliente, productos, subtotal, impuesto, total, user_id, metodo_pago } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO ventas (cliente, fecha, subtotal, impuesto, total, user_id, metodo_pago) 
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?)`,
      [cliente, subtotal, impuesto, total, user_id, metodo_pago]
    );
    const ventaId = result.insertId;

    for (const prod of productos) {
      await conn.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [ventaId, prod.id, prod.cantidad, prod.precio]
      );
      // Actualiza el stock del producto
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [prod.cantidad, prod.id, prod.cantidad]
      );
    }

    // Obtener el nombre del usuario
    const [[usuario]] = await conn.query('SELECT nombre FROM users WHERE id = ?', [user_id]);
    const nombreUsuario = usuario ? usuario.nombre : 'Desconocido';

    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [
        `Venta registrada para el cliente ${cliente} por S/ ${total}`,
        nombreUsuario
      ]
    );

    await conn.commit();
    res.json({ message: 'Venta registrada', ventaId });
  } catch (error) {
    await conn.rollback();
    console.error('Error real al registrar venta:', error);
    res.status(500).json({ message: 'Error al registrar venta' });
  } finally {
    conn.release();
  }
});

// Anular una venta, recuperar stock y registrar actividad
router.put('/anular/:id', async (req, res) => {
  const { motivo, user_id } = req.body; // <-- Asegúrate de recibir el user_id
  const ventaId = req.params.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Marcar la venta como anulada
    const [result] = await conn.query(
      'UPDATE ventas SET anulada = 1, motivo_anulacion = ? WHERE id = ?',
      [motivo, ventaId]
    );
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    // 2. Recuperar los productos de la venta
    const [productos] = await conn.query(
      'SELECT producto_id, cantidad FROM detalle_ventas WHERE venta_id = ?',
      [ventaId]
    );

    // 3. Sumar la cantidad al stock de cada producto
    for (const prod of productos) {
      await conn.query(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [prod.cantidad, prod.producto_id]
      );
    }

    // 4. Obtener el nombre del usuario que anula
    let nombreUsuario = 'Desconocido';
    if (user_id) {
      const [[usuario]] = await conn.query('SELECT nombre FROM users WHERE id = ?', [user_id]);
      if (usuario) nombreUsuario = usuario.nombre;
    }

    // 5. Registrar la actividad
    await conn.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [
        `Venta N°${ventaId} anulada. Motivo: ${motivo}`,
        nombreUsuario
      ]
    );

    await conn.commit();
    res.json({ message: 'Venta anulada correctamente y stock recuperado' });
  } catch (error) {
    await conn.rollback();
    console.error('Error al anular venta:', error);
    res.status(500).json({ message: 'Error al anular venta', error: error.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
