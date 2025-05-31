// Rutas para gestión de ventas en la API

const express = require('express');
const pool = require('../db');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

// Obtener todas las ventas y sus productos asociados
router.get('/', async (req, res) => {
  try {
    const [ventas] = await pool.query(
      'SELECT * FROM ventas ORDER BY fecha DESC'
    );

    if (ventas.length === 0) return res.json([]); // <-- Solo un array vacío

    const ventaIds = ventas.map(v => v.id);
    let productos = [];
    if (ventaIds.length > 0) {
      [productos] = await pool.query(
        `SELECT dv.venta_id, dv.producto_id as id, p.name, dv.cantidad, dv.precio_unitario as precio
         FROM detalle_ventas dv
         JOIN products p ON dv.producto_id = p.id
         WHERE dv.venta_id IN (${ventaIds.map(() => '?').join(',')})`,
        ventaIds
      );
    }

    for (const venta of ventas) {
      venta.productos = productos.filter(p => p.venta_id === venta.id);
    }

    res.json(ventas); // <-- Siempre un array
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
    // Días cortos en español, en orden de lunes a domingo
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    // Agrupa por número de día de la semana
    const [rows] = await pool.query(`
      SELECT 
        DAYOFWEEK(fecha) as dia_num,
        SUM(total) as total
      FROM ventas
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND anulada = 0
      GROUP BY dia_num
    `);

    // Mapea los resultados a los días de la semana (lunes a domingo)
    const ventasPorDia = diasSemana.map((dia, idx) => {
      // idx: 0 (Lun) -> dia_num 2, ..., idx: 6 (Dom) -> dia_num 1
      const diaNum = idx === 6 ? 1 : idx + 2;
      const found = rows.find(r => Number(r.dia_num) === diaNum);
      return {
        dia,
        total: found ? Number(found.total) : 0
      };
    });

    res.json(ventasPorDia);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas por día', error: error.message });
  }
});

// Ventas por día de la semana (semana anterior)
router.get('/ventas-por-dia-anterior', async (req, res) => {
  try {
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const [rows] = await pool.query(`
      SELECT 
        DAYOFWEEK(fecha) as dia_num,
        SUM(total) as total
      FROM ventas
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
        AND fecha < DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND anulada = 0
      GROUP BY dia_num
    `);
    const ventasPorDia = diasSemana.map((dia, idx) => {
      const diaNum = idx === 6 ? 1 : idx + 2;
      const found = rows.find(r => Number(r.dia_num) === diaNum);
      return { dia, total: found ? Number(found.total) : 0 };
    });
    res.json(ventasPorDia);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas semana anterior' });
  }
});
// Métodos de pago utilizados en ventas
router.get('/metodos-pago', async (req, res) => {
  try {
    console.log('>>> ENDPOINT METODOS-PAGO EJECUTADO <<<');
    const [rows] = await pool.query(`
      SELECT metodo_pago, SUM(total) as total
      FROM ventas
      WHERE anulada = 0
      GROUP BY metodo_pago
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener métodos de pago' });
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
router.post('/', authenticate, async (req, res) => {
  const { cliente, productos, user_id, metodo_pago } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Obtener los productos reales de la base de datos
    const ids = productos.map(p => p.id);
    const [productosDB] = await conn.query(
      `SELECT id, price FROM products WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    // 2. Calcular subtotal, impuesto y total en el backend
    let subtotal = 0;
    for (const prod of productos) {
      const prodDB = productosDB.find(pdb => pdb.id === prod.id);
      if (!prodDB) throw new Error(`Producto ID ${prod.id} no encontrado`);
      subtotal += prod.cantidad * prodDB.price;
    }
    const impuestoPorcentaje = 18; // o el valor que uses
    const impuesto = +(subtotal * impuestoPorcentaje / 100).toFixed(2);
    const total = +(subtotal + impuesto).toFixed(2);

    // (Opcional) Validar que los valores enviados coincidan
    if (
      +req.body.subtotal !== subtotal ||
      +req.body.impuesto !== impuesto ||
      +req.body.total !== total
    ) {
      await conn.rollback();
      return res.status(400).json({ message: 'Los totales enviados no coinciden con los calculados.' });
    }

    // 3. Registrar la venta usando los valores calculados
    const [result] = await conn.query(
      `INSERT INTO ventas (cliente, fecha, subtotal, impuesto, total, user_id, metodo_pago) 
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?)`,
      [cliente, subtotal, impuesto, total, user_id, metodo_pago]
    );
    const ventaId = result.insertId;

    for (const prod of productos) {
      console.log('Insertando en detalle_ventas:', prod);
      // Verifica stock antes de descontar
      const [[stockCheck]] = await conn.query(
        'SELECT stock FROM products WHERE id = ?',
        [prod.id]
      );
      if (!stockCheck || stockCheck.stock < prod.cantidad) {
        await conn.rollback();
        return res.status(400).json({ message: `Stock insuficiente para el producto ID ${prod.id}` });
      }
      await conn.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [ventaId, prod.id, prod.cantidad, prod.precio || prodDB.price]
      );
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [prod.cantidad, prod.id]
      );
    }

    // Obtener el nombre del usuario
    const usuario = req.user ? (req.user.nombre || req.user.correo_electronico) : 'Desconocido';

    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [
        `Venta registrada para el cliente ${cliente} por S/ ${total}`,
        usuario
      ]
    );

    await conn.commit();
    res.status(200).json({ ventaId });
  } catch (error) {
    console.error(error); // <-- Esto te dará la pista
    await conn.rollback();
    res.status(500).json({ message: 'Error al registrar venta' });
  } finally {
    conn.release();
  }
});

// Anular una venta, recuperar stock y registrar actividad
router.put('/anular/:id', authenticate, async (req, res) => {
  const { motivo, user_id } = req.body;
  const ventaId = req.params.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verifica si la venta existe y si ya está anulada
    const [ventaCheck] = await conn.query('SELECT anulada FROM ventas WHERE id = ?', [ventaId]);
    if (ventaCheck.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    if (ventaCheck[0].anulada) {
      await conn.rollback();
      return res.status(409).json({ message: 'La venta ya está anulada' });
    }

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

// Generar comprobante simulado (boleta/factura) para una venta
router.get('/comprobante/:id', async (req, res) => {
  const ventaId = req.params.id;
  try {
    // Obtén los datos de la venta y su detalle
    const [ventaRows] = await pool.query('SELECT * FROM ventas WHERE id = ?', [ventaId]);
    const [detalleRows] = await pool.query('SELECT * FROM detalle_ventas WHERE venta_id = ?', [ventaId]);
    if (ventaRows.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    const venta = ventaRows[0];

    // Simula el comprobante (puedes mejorar el formato)
    const comprobante = {
      tipo: venta.tipo_comprobante || 'boleta',
      numero: venta.numero_comprobante || `B${venta.id.toString().padStart(6, '0')}`,
      fecha: venta.fecha,
      cliente: venta.cliente,
      metodo_pago: venta.metodo_pago,
      productos: detalleRows,
      subtotal: venta.subtotal,
      impuestos: venta.impuestos,
      total: venta.total
    };

    res.json(comprobante);
  } catch (error) {
    res.status(500).json({ message: 'Error al generar comprobante', error });
  }
});

module.exports = router;
