// salesService.js

const pool = require('../config/db');

// Obtener todas las ventas con sus productos
async function getAllSalesWithProducts() {
  const [ventas] = await pool.query('SELECT * FROM ventas ORDER BY fecha DESC');
  if (ventas.length === 0) return [];

  const ventaIds = ventas.map(v => v.id);
  if (ventaIds.length === 0) return ventas; // PREVENCIÓN IMPORTANTE

  const [productos] = await pool.query(
    `SELECT dv.venta_id, dv.producto_id as id, p.name, dv.cantidad, dv.precio_unitario as precio
     FROM detalle_ventas dv
     JOIN products p ON dv.producto_id = p.id
     WHERE dv.venta_id IN (${ventaIds.map(() => '?').join(',')})`,
    ventaIds
  );

  for (const venta of ventas) {
    venta.productos = productos.filter(p => p.venta_id === venta.id);
  }

  return ventas;
}

// Obtener resumen de ventas (hoy y mes actual)
async function getSalesSummary() {
  const [hoy] = await pool.query(
    "SELECT IFNULL(SUM(total),0) as hoy FROM ventas WHERE DATE(fecha) = CURDATE() AND anulada = 0"
  );
  const [mes] = await pool.query(
    "SELECT IFNULL(SUM(total),0) as mes FROM ventas WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE()) AND anulada = 0"
  );
  return { hoy: hoy[0].hoy, mes: mes[0].mes };
}

// Obtener ventas por día de la semana (últimos 7 días o semana anterior)
async function getSalesByDay(startInterval, endInterval) {
  const [rows] = await pool.query(
    `SELECT DAYOFWEEK(fecha) as dia_num, SUM(total) as total FROM ventas
     WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       AND fecha < DATE_SUB(CURDATE(), INTERVAL ? DAY)
       AND anulada = 0
     GROUP BY dia_num`,
    [startInterval, endInterval]
  );
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return diasSemana.map((dia, idx) => {
    const diaNum = idx === 6 ? 1 : idx + 2;
    const found = rows.find(r => Number(r.dia_num) === diaNum);
    return { dia, total: found ? Number(found.total) : 0 };
  });
}

// Obtener métodos de pago
async function getPaymentMethods() {
  const [rows] = await pool.query(
    `SELECT metodo_pago, SUM(total) as total FROM ventas WHERE anulada = 0 GROUP BY metodo_pago`
  );
  return rows;
}

// Obtener detalle de una venta por ID
async function getSaleById(id) {
  const [venta] = await pool.query('SELECT * FROM ventas WHERE id = ?', [id]);
  const [productos] = await pool.query(
    `SELECT dv.*, p.name FROM detalle_ventas dv
     JOIN products p ON dv.producto_id = p.id WHERE dv.venta_id = ?`,
    [id]
  );
  const productosMapeados = productos.map(p => ({ ...p, precio: p.precio_unitario }));
  return { ...venta[0], productos: productosMapeados };
}

// Registrar nueva venta y actualizar stock
async function createSale({ productos, cliente = '', user_id, metodo_pago, usuario }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Obtener precios actuales desde la base de datos
    const ids = productos.map(p => p.id);
    const [productosDB] = await conn.query(
      `SELECT id, price FROM products WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    // Calcular totales desde los datos oficiales
    let subtotal = 0;
    for (const prod of productos) {
      const prodDB = productosDB.find(pdb => pdb.id === prod.id);
      if (!prodDB) throw new Error(`Producto con ID ${prod.id} no encontrado.`);
      subtotal += prod.cantidad * prodDB.price;
    }

    const impuesto = +(subtotal * 0.18).toFixed(2);
    const total = +(subtotal + impuesto).toFixed(2);

    // Insertar la venta principal
    const [insertResult] = await conn.query(
      `INSERT INTO ventas (cliente, fecha, subtotal, impuesto, total, user_id, metodo_pago)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?)`,
      [cliente, subtotal, impuesto, total, user_id, metodo_pago]
    );
    const ventaId = insertResult.insertId;

    // Insertar productos en detalle_ventas y actualizar stock
    for (const prod of productos) {
      const prodDB = productosDB.find(pdb => pdb.id === prod.id);
      const [[stockCheck]] = await conn.query('SELECT stock FROM products WHERE id = ?', [prod.id]);

      if (!stockCheck || stockCheck.stock < prod.cantidad) {
        throw new Error(`Stock insuficiente para el producto ID ${prod.id}`);
      }

      await conn.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [ventaId, prod.id, prod.cantidad, prodDB.price]
      );

      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [prod.cantidad, prod.id]
      );
    }

    // Registrar en el historial de actividades
    await conn.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Venta registrada para el cliente "${cliente}" por S/ ${total}`, usuario || 'Desconocido']
    );

    await conn.commit();
    return ventaId;

  } catch (error) {
    await conn.rollback();
    console.error('Error en createSale:', error.message);
    throw new Error(`Error al registrar venta: ${error.message}`);
  } finally {
    conn.release();
  }
}

// Anular venta y recuperar stock
async function cancelSale(id, motivo, user_id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [ventaCheck] = await conn.query('SELECT anulada FROM ventas WHERE id = ?', [id]);
    if (ventaCheck.length === 0) throw new Error('Venta no encontrada');
    if (ventaCheck[0].anulada) throw new Error('La venta ya está anulada');

    await conn.query('UPDATE ventas SET anulada = 1, motivo_anulacion = ? WHERE id = ?', [motivo, id]);

    const [productos] = await conn.query('SELECT producto_id, cantidad FROM detalle_ventas WHERE venta_id = ?', [id]);
    for (const prod of productos) {
      await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [prod.cantidad, prod.producto_id]);
    }

    let nombreUsuario = 'Desconocido';
    if (user_id) {
      const [[usuario]] = await conn.query('SELECT nombre FROM users WHERE id = ?', [user_id]);
      if (usuario) nombreUsuario = usuario.nombre;
    }

    await conn.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Venta N°${id} anulada. Motivo: ${motivo}`, nombreUsuario]
    );

    await conn.commit();
    return { message: 'Venta anulada correctamente y stock recuperado' };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// Generar comprobante simulado
async function generateComprobante(id) {
  const [ventaRows] = await pool.query('SELECT * FROM ventas WHERE id = ?', [id]);
  const [detalleRows] = await pool.query('SELECT * FROM detalle_ventas WHERE venta_id = ?', [id]);
  if (ventaRows.length === 0) throw new Error('Venta no encontrada');

  const venta = ventaRows[0];
  return {
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
}

module.exports = {
  getAllSalesWithProducts,
  getSalesResumen: getSalesSummary,
  getSalesByDay,
  getVentasPorDia: () => getSalesByDay(7, 0),
  getMetodosPago: getPaymentMethods,
  getSaleById,
  createVenta: createSale,
  anularVenta: cancelSale,
  generarComprobante: generateComprobante
};
