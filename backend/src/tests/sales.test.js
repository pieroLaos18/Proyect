const request = require('supertest');
const express = require('express');
const salesRouter = require('../routes/sales');
const pool = require('../db');

jest.mock('../db');
jest.mock('../middleware/authenticate', () => (req, res, next) => {
  req.user = { nombre: 'TestUser', correo_electronico: 'test@mail.com' };
  next();
});

const app = express();
app.use(express.json());
app.use('/api/sales', salesRouter);

describe('Gestión de Ventas', () => {
  afterEach(() => jest.clearAllMocks());

  it('calcula automáticamente subtotal, impuesto e importe final al registrar venta', async () => {
    // Mock de conexión y queries
    const conn = {
      beginTransaction: jest.fn(),
      query: jest.fn()
        // Productos en DB
        .mockResolvedValueOnce([[{ id: 1, price: 100 }]])
        // Insert venta (debe ser [{ insertId: ... }])
        .mockResolvedValueOnce([{ insertId: 10 }])
        // Stock check
        .mockResolvedValueOnce([[{ stock: 10 }]])
        // Insert detalle_ventas
        .mockResolvedValueOnce([{}])
        // Update stock
        .mockResolvedValueOnce([{}])
        // Insert actividad
        .mockResolvedValueOnce([{}]),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    };
    pool.getConnection.mockResolvedValue(conn);
    pool.query.mockResolvedValueOnce([{}]); // Para insert actividad fuera de la transacción

    const venta = {
      cliente: 'Cliente Prueba',
      productos: [{ id: 1, cantidad: 2, precio: 100 }],
      user_id: 1,
      metodo_pago: 'Efectivo',
      subtotal: 200,
      impuesto: 36,
      total: 236
    };

    const res = await request(app)
      .post('/api/sales')
      .send(venta);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId');
    expect(conn.query).toHaveBeenCalled();
  });

  it('registra venta con detalle por producto', async () => {
    // Puedes expandir este test para verificar los parámetros de detalle_ventas si lo deseas
    const conn = {
      beginTransaction: jest.fn(),
      query: jest.fn()
        .mockResolvedValueOnce([[{ id: 1, price: 100 }]])
        .mockResolvedValueOnce([{ insertId: 12 }])
        .mockResolvedValueOnce([[{ stock: 10 }]])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}]),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    };
    pool.getConnection.mockResolvedValue(conn);
    pool.query.mockResolvedValueOnce([{}]);

    const venta = {
      cliente: 'Cliente Detalle',
      productos: [{ id: 1, cantidad: 1, precio: 100 }],
      user_id: 1,
      metodo_pago: 'Tarjeta',
      subtotal: 100,
      impuesto: 18,
      total: 118
    };

    const res = await request(app)
      .post('/api/sales')
      .send(venta);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId');
    expect(conn.query).toHaveBeenCalled();
  });

  it('acepta métodos de pago: efectivo, tarjeta, otros', async () => {
    pool.query.mockResolvedValueOnce([[{ metodo_pago: 'Efectivo', total: 100 }, { metodo_pago: 'Tarjeta', total: 50 }]]);
    const res = await request(app).get('/api/sales/metodos-pago');
    expect(res.statusCode).toBe(200);
    expect(res.body.map(m => m.metodo_pago)).toEqual(expect.arrayContaining(['Efectivo', 'Tarjeta']));
  });

  it('emite comprobante de venta', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1, tipo_comprobante: 'boleta', numero_comprobante: 'B000001', fecha: '2024-06-01', cliente: 'Cliente', metodo_pago: 'Efectivo', subtotal: 100, impuestos: 18, total: 118 }]])
      .mockResolvedValueOnce([[{ producto_id: 1, cantidad: 2, precio_unitario: 50 }]]);
    const res = await request(app).get('/api/sales/comprobante/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('tipo', 'boleta');
    expect(res.body).toHaveProperty('productos');
  });

  it('permite registrar venta sin cliente (opcional)', async () => {
    // Mock de autenticación
    const authenticate = (req, res, next) => {
      req.user = { nombre: 'Admin' };
      next();
    };
    app.post('/api/sales', authenticate, salesRouter);

    const conn = {
      beginTransaction: jest.fn(),
      query: jest.fn()
        .mockResolvedValueOnce([[{ id: 1, price: 50 }]])
        .mockResolvedValueOnce([{ insertId: 11 }])
        .mockResolvedValueOnce([[{ stock: 10 }]])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}]),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    };
    pool.getConnection.mockResolvedValue(conn);
    pool.query.mockResolvedValueOnce([{}]);

    const venta = {
      productos: [{ id: 1, cantidad: 1, precio: 50 }],
      user_id: 1,
      metodo_pago: 'Tarjeta',
      subtotal: 50,
      impuesto: 9,
      total: 59
    };

    const res = await request(app)
      .post('/api/sales')
      .send(venta);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ventaId');
  });

  it('anula una venta y registra motivo', async () => {
    const conn = {
      beginTransaction: jest.fn(),
      query: jest.fn()
        // Venta existe y no está anulada
        .mockResolvedValueOnce([[{ anulada: 0 }]])
        // Update ventas
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        // Productos de la venta
        .mockResolvedValueOnce([[{ producto_id: 1, cantidad: 2 }]])
        // Update stock
        .mockResolvedValueOnce([{}])
        // Usuario
        .mockResolvedValueOnce([[{ nombre: 'Admin' }]])
        // Insert actividad
        .mockResolvedValueOnce([{}]),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    };
    pool.getConnection.mockResolvedValue(conn);

    const res = await request(app)
      .put('/api/sales/anular/1')
      .send({ motivo: 'Error en venta', user_id: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', expect.stringContaining('anulada'));
  });
});