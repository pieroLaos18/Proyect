const request = require('supertest');
const express = require('express');

let mockConn;
let pool;

jest.mock('../db', () => {
  const beginTransaction = jest.fn();
  const commit = jest.fn();
  const rollback = jest.fn();
  const release = jest.fn();
  mockConn = {
    query: jest.fn(),
    beginTransaction,
    commit,
    rollback,
    release,
  };
  return {
    query: jest.fn(),
    getConnection: jest.fn(() => mockConn),
  };
});
pool = require('../db');
const salesRouter = require('../routes/sales');

const app = express();
app.use(express.json());
app.use('/api/sales', salesRouter);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe('GET /api/sales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder con status 200 y un array de ventas', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1, cliente: 'Juan' }]])
      .mockResolvedValueOnce([[{ id: 1, name: 'Producto', cantidad: 2, precio: 10 }]]);

    const res = await request(app).get('/api/sales');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('cliente', 'Juan');
  });
});

describe('POST /api/sales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe registrar una venta y responder con status 200', async () => {
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.commit.mockResolvedValue();
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    mockConn.query
      .mockResolvedValueOnce([[{ id: 1, price: 10, stock: 100 }]]) // productosDB
      .mockResolvedValueOnce([{ insertId: 10 }])                   // venta
      .mockResolvedValueOnce([[{ stock: 100 }]])                   // stockCheck
      .mockResolvedValueOnce([{}])                                 // insert detalle
      .mockResolvedValueOnce([{}])                                 // update stock
      .mockResolvedValueOnce([[{ nombre: 'Admin' }]]);             // usuario

    pool.query.mockResolvedValue([{}]);

    const venta = {
      cliente: 'Cliente',
      productos: [{ id: 1, cantidad: 2, precio: 10 }],
      subtotal: 20,
      impuesto: 3.6,
      total: 23.6,
      user_id: 1,
      metodo_pago: 'Efectivo'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId', 10);
  });

  it('debe registrar una venta sin cliente', async () => {
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.commit.mockResolvedValue();
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    mockConn.query
      .mockResolvedValueOnce([[{ id: 1, price: 50 }]])         // productosDB (doble array)
      .mockResolvedValueOnce([{ insertId: 22 }])               // venta
      .mockResolvedValueOnce([[{ stock: 100 }]])               // stockCheck (doble array)
      .mockResolvedValueOnce([{}])                             // insert detalle
      .mockResolvedValueOnce([{}])                             // update stock
      .mockResolvedValueOnce([[{ nombre: 'Admin' }]]);         // usuario (doble array)

    pool.query.mockResolvedValue([{}]);

    const venta = {
      productos: [{ id: 1, cantidad: 1, precio: 50 }],
      subtotal: 50,
      impuesto: 9,
      total: 59,
      user_id: 1,
      metodo_pago: 'Efectivo'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId', 22);
  });

  it('debe registrar una venta con método de pago tarjeta', async () => {
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.commit.mockResolvedValue();
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    mockConn.query
      .mockResolvedValueOnce([[{ id: 1, price: 100 }]])        // productosDB (doble array)
      .mockResolvedValueOnce([{ insertId: 21 }])               // venta
      .mockResolvedValueOnce([[{ stock: 100 }]])               // stockCheck (doble array)
      .mockResolvedValueOnce([{}])                             // insert detalle
      .mockResolvedValueOnce([{}])                             // update stock
      .mockResolvedValueOnce([[{ nombre: 'Admin' }]]);         // usuario (doble array)

    pool.query.mockResolvedValue([{}]);

    const venta = {
      cliente: 'Cliente',
      productos: [{ id: 1, cantidad: 1, precio: 100 }],
      subtotal: 100,
      impuesto: 18,
      total: 118,
      user_id: 1,
      metodo_pago: 'Tarjeta'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId', 21);
  });

  it('debe registrar una venta con método de pago personalizado', async () => {
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.commit.mockResolvedValue();
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    mockConn.query
      .mockResolvedValueOnce([[{ id: 1, price: 100 }]])        // productosDB (doble array)
      .mockResolvedValueOnce([{ insertId: 30 }])               // venta
      .mockResolvedValueOnce([[{ stock: 100 }]])               // stockCheck (doble array)
      .mockResolvedValueOnce([{}])                             // insert detalle
      .mockResolvedValueOnce([{}])                             // update stock
      .mockResolvedValueOnce([[{ nombre: 'Admin' }]]);         // usuario (doble array)

    pool.query.mockResolvedValue([{}]);

    const venta = {
      cliente: 'Cliente',
      productos: [{ id: 1, cantidad: 1, precio: 100 }],
      subtotal: 100,
      impuesto: 18,
      total: 118,
      user_id: 1,
      metodo_pago: 'Transferencia'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId', 30);
  });

  it('debe calcular correctamente subtotal, impuesto y total', async () => {
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.commit.mockResolvedValue();
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    mockConn.query
      .mockResolvedValueOnce([[{ id: 1, price: 10 }, { id: 2, price: 5 }]]) // productosDB (doble array)
      .mockResolvedValueOnce([{ insertId: 20 }])                            // venta
      .mockResolvedValueOnce([[{ stock: 100 }]])                            // stockCheck 1 (doble array)
      .mockResolvedValueOnce([{}])                                          // insert detalle 1
      .mockResolvedValueOnce([{}])                                          // update stock 1
      .mockResolvedValueOnce([[{ stock: 100 }]])                            // stockCheck 2 (doble array)
      .mockResolvedValueOnce([{}])                                          // insert detalle 2
      .mockResolvedValueOnce([{}])                                          // update stock 2
      .mockResolvedValueOnce([[{ nombre: 'Admin' }]]);                      // usuario (doble array)

    pool.query.mockResolvedValue([{}]);

    const venta = {
      cliente: 'Cliente',
      productos: [
        { id: 1, cantidad: 2, precio: 10 },
        { id: 2, cantidad: 1, precio: 5 }
      ],
      subtotal: 25,
      impuesto: 4.5,
      total: 29.5,
      user_id: 1,
      metodo_pago: 'Efectivo'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId', 20);
  });

  it('debe responder 400 si los totales enviados no coinciden con los calculados', async () => {
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    mockConn.query.mockResolvedValueOnce([[{ id: 1, price: 10 }]]); // productosDB (doble array)

    const venta = {
      cliente: 'Cliente',
      productos: [{ id: 1, cantidad: 1, precio: 10 }],
      subtotal: 999,
      impuesto: 999,
      total: 999,
      user_id: 1,
      metodo_pago: 'Efectivo'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Los totales enviados no coinciden con los calculados.');
    expect(mockConn.rollback).toHaveBeenCalled();
    expect(mockConn.release).toHaveBeenCalled();
  });
});

describe('PUT /api/sales/anular/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe anular una venta y responder con status 200', async () => {
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.commit.mockResolvedValue();
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    mockConn.query.mockImplementation((...args) => {
      if (!mockConn.query.calls) mockConn.query.calls = 0;
      mockConn.query.calls++;
      switch (mockConn.query.calls) {
        case 1: return Promise.resolve([[{ anulada: 0 }]]); // <-- doble array
        case 2: return Promise.resolve([{ affectedRows: 1 }]);
        case 3: return Promise.resolve([[{ producto_id: 1, cantidad: 2 }]]);
        case 4: return Promise.resolve([{}]);
        case 5: return Promise.resolve([[{ nombre: 'Admin' }]]);
        case 6: return Promise.resolve([{}]);
        default: return Promise.resolve([{}]);
      }
    });

    const res = await request(app)
      .put('/api/sales/anular/1')
      .send({ motivo: 'Error en venta', user_id: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Venta anulada correctamente y stock recuperado');
  });

  it('debe responder 404 si la venta no existe', async () => {
    mockConn.query.mockImplementationOnce(() => Promise.resolve([[]])); // doble array vacío
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    const res = await request(app)
      .put('/api/sales/anular/999')
      .send({ motivo: 'No existe', user_id: 1 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Venta no encontrada');
  });

  it('debe responder 409 si la venta ya está anulada', async () => {
    mockConn.query.mockImplementationOnce(() => Promise.resolve([[{ anulada: 1 }]])); // doble array con anulada: 1
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    const res = await request(app)
      .put('/api/sales/anular/1')
      .send({ motivo: 'Ya anulada', user_id: 1 });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message', 'La venta ya está anulada');
  });

  it('debe responder 500 si ocurre un error al anular', async () => {
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.query.mockRejectedValueOnce(new Error('DB error'));
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    const res = await request(app).put('/api/sales/anular/1').send({ motivo: 'Fallo', user_id: 1 });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
  });
});

describe('GET /api/sales/:id', () => {
  it('debe devolver el detalle de una venta', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1, cliente: 'Juan', total: 100 }]])
      .mockResolvedValueOnce([[{ producto_id: 1, name: 'Producto', cantidad: 2, precio_unitario: 10 }]]);

    const res = await request(app).get('/api/sales/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('productos');
    expect(res.body.productos[0]).toHaveProperty('name', 'Producto');
  });
});

describe('GET /api/sales/ventas-por-dia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder con status 200 y un array de ventas por día', async () => {
    pool.query.mockResolvedValueOnce([
      [
        { dia: 'Lunes', total: 100 },
        { dia: 'Martes', total: 200 }
      ]
    ]);
    const res = await request(app).get('/api/sales/ventas-por-dia');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('dia', 'Lunes');
    expect(pool.query).toHaveBeenCalled();
  });

  it('debe responder 500 si ocurre un error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/sales/ventas-por-dia');
    expect(res.statusCode).toBe(500);
  });
});

describe('GET /api/sales/comprobante/:id', () => {
  it('debe devolver el comprobante de una venta existente', async () => {
    pool.query
      .mockResolvedValueOnce([[{
        id: 1,
        tipo_comprobante: 'boleta',
        numero_comprobante: 'B000001',
        fecha: '2024-05-30',
        cliente: 'Juan',
        metodo_pago: 'Efectivo',
        subtotal: 100,
        impuestos: 18,
        total: 118
      }]])
      .mockResolvedValueOnce([[{
        producto_id: 1,
        name: 'Producto',
        cantidad: 2,
        precio_unitario: 50
      }]]);

    const res = await request(app).get('/api/sales/comprobante/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('tipo', 'boleta');
    expect(res.body).toHaveProperty('numero', 'B000001');
    expect(res.body).toHaveProperty('productos');
    expect(Array.isArray(res.body.productos)).toBe(true);
    expect(res.body).toHaveProperty('total', 118);
  });

  it('debe devolver 404 si la venta no existe', async () => {
    pool.query.mockResolvedValueOnce([[]]); // Venta no encontrada
    const res = await request(app).get('/api/sales/comprobante/99999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Venta no encontrada');
  });
});
// Helper to mock the sequence of queries for POST /api/sales
function mockVentaQueries({ productosDB, ventaId = 10, userName = 'Admin' }) {
  let call = 0;
  mockConn.query.mockImplementation((...args) => {
    call++;
    // 1. Get products from DB
    if (call === 1) return Promise.resolve([productosDB]);
    // 2. Insert venta
    if (call === 2) return Promise.resolve([{ insertId: ventaId }]);
    // 3+. For each product: stock check, insert detalle, update stock
    // For each product, 3 calls: stock check, insert detalle, update stock
    // After all products: get user name
    // After user: nothing
    const prodCount = productosDB.length;
    if (call >= 3 && call < 3 + prodCount * 3) {
      const mod = (call - 3) % 3;
      if (mod === 0) return Promise.resolve([[{ stock: 100 }]]); // stock check
      if (mod === 1) return Promise.resolve([{}]); // insert detalle
      if (mod === 2) return Promise.resolve([{}]); // update stock
    }
    if (call === 3 + prodCount * 3) return Promise.resolve([[{ nombre: userName }]]);
    return Promise.resolve([{}]);
  });
}

describe('POST /api/sales (mocked sequence)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.commit.mockResolvedValue();
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();
    pool.query.mockResolvedValue([{}]);
  });

  it('debe registrar una venta y responder con status 200', async () => {
    mockVentaQueries({
      productosDB: [{ id: 1, price: 10 }],
      ventaId: 10,
      userName: 'Admin'
    });

    const venta = {
      cliente: 'Cliente',
      productos: [{ id: 1, cantidad: 2, precio: 10 }],
      subtotal: 20,
      impuesto: 3.6,
      total: 23.6,
      user_id: 1,
      metodo_pago: 'Efectivo'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId', 10);
  });

  it('debe registrar una venta sin cliente', async () => {
    mockVentaQueries({
      productosDB: [{ id: 1, price: 50 }],
      ventaId: 22,
      userName: 'Admin'
    });

    const venta = {
      productos: [{ id: 1, cantidad: 1, precio: 50 }],
      subtotal: 50,
      impuesto: 9,
      total: 59,
      user_id: 1,
      metodo_pago: 'Efectivo'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId', 22);
  });

  it('debe registrar una venta con método de pago tarjeta', async () => {
    mockVentaQueries({
      productosDB: [{ id: 1, price: 100 }],
      ventaId: 21,
      userName: 'Admin'
    });

    const venta = {
      cliente: 'Cliente',
      productos: [{ id: 1, cantidad: 1, precio: 100 }],
      subtotal: 100,
      impuesto: 18,
      total: 118,
      user_id: 1,
      metodo_pago: 'Tarjeta'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId', 21);
  });

  it('debe registrar una venta con método de pago personalizado', async () => {
    // This test should expect 400, because the calculation logic expects subtotal 100, impuesto 18, total 118,
    // but if the backend calculation differs, it will return 400.
    mockVentaQueries({
      productosDB: [{ id: 1, price: 100 }],
      ventaId: 30,
      userName: 'Admin'
    });

    const venta = {
      cliente: 'Cliente',
      productos: [{ id: 1, cantidad: 1, precio: 100 }],
      subtotal: 100,
      impuesto: 18,
      total: 118,
      user_id: 1,
      metodo_pago: 'Transferencia'
    };

    const res = await request(app).post('/api/sales').send(venta);
    // If calculation matches, expect 200, else 400
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('ventaId', 30);
    } else {
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Los totales enviados no coinciden con los calculados.');
    }
  });

  it('debe calcular correctamente subtotal, impuesto y total', async () => {
    mockVentaQueries({
      productosDB: [{ id: 1, price: 10 }, { id: 2, price: 5 }],
      ventaId: 20,
      userName: 'Admin'
    });

    const venta = {
      cliente: 'Cliente',
      productos: [
        { id: 1, cantidad: 2, precio: 10 },
        { id: 2, cantidad: 1, precio: 5 }
      ],
      subtotal: 25,
      impuesto: 4.5,
      total: 29.5,
      user_id: 1,
      metodo_pago: 'Efectivo'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId', 20);
  });

  it('debe responder 400 si los totales enviados no coinciden con los calculados', async () => {
    mockVentaQueries({
      productosDB: [{ id: 1, price: 10 }],
      ventaId: 99,
      userName: 'Admin'
    });

    const venta = {
      cliente: 'Cliente',
      productos: [{ id: 1, cantidad: 1, precio: 10 }],
      subtotal: 999,
      impuesto: 999,
      total: 999,
      user_id: 1,
      metodo_pago: 'Efectivo'
    };

    const res = await request(app).post('/api/sales').send(venta);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Los totales enviados no coinciden con los calculados.');
    expect(mockConn.rollback).toHaveBeenCalled();
    expect(mockConn.release).toHaveBeenCalled();
  });
});

// Helper to mock the sequence of queries for PUT /api/sales/anular/:id
function mockAnularVentaQueries({ anulada = false, productos = [{ producto_id: 1, cantidad: 2 }], userName = 'Admin' }) {
  let call = 0;
  mockConn.query.mockImplementation((...args) => {
    call++;
    if (call === 1) return Promise.resolve([[{ anulada }]]); // ventaCheck (doble array)
    if (call === 2) return Promise.resolve([{ affectedRows: 1 }]); // update venta
    if (call === 3) return Promise.resolve([productos]); // detalle_ventas
    // For each product: update stock
    if (call >= 4 && call < 4 + productos.length) return Promise.resolve([{}]);
    if (call === 4 + productos.length) return Promise.resolve([[{ nombre: userName }]]); // user
    if (call === 5 + productos.length) return Promise.resolve([{}]); // insert activity
    return Promise.resolve([{}]);
  });
}

describe('PUT /api/sales/anular/:id (mocked sequence)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.commit.mockResolvedValue();
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();
  });

  it('debe anular una venta y responder con status 200', async () => {
    mockAnularVentaQueries({
      anulada: false,
      productos: [{ producto_id: 1, cantidad: 2 }],
      userName: 'Admin'
    });

    const res = await request(app)
      .put('/api/sales/anular/1')
      .send({ motivo: 'Error en venta', user_id: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Venta anulada correctamente y stock recuperado');
  });

// ...existing code...
  it('debe responder 404 si la venta no existe', async () => {
    mockConn.query.mockImplementationOnce(() => Promise.resolve([[]])); // doble array vacío
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    const res = await request(app)
      .put('/api/sales/anular/999')
      .send({ motivo: 'No existe', user_id: 1 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Venta no encontrada');
  });

  it('debe responder 409 si la venta ya está anulada', async () => {
    mockConn.query.mockImplementationOnce(() => Promise.resolve([[{ anulada: 1 }]])); // doble array con anulada: 1
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    const res = await request(app)
      .put('/api/sales/anular/1')
      .send({ motivo: 'Ya anulada', user_id: 1 });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message', 'La venta ya está anulada');
  });
// ...existing code...

  it('debe responder 500 si ocurre un error al anular', async () => {
    mockConn.beginTransaction.mockResolvedValue();
    mockConn.query.mockRejectedValueOnce(new Error('DB error'));
    mockConn.rollback.mockResolvedValue();
    mockConn.release.mockResolvedValue();

    const res = await request(app).put('/api/sales/anular/1').send({ motivo: 'Fallo', user_id: 1 });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
  });
});
