const request = require('supertest');
const express = require('express');

jest.mock('../db', () => ({
  query: jest.fn()
}));
const pool = require('../db');
const reportsRouter = require('../routes/reports');
const productsRouter = require('../routes/products');

const app = express();
app.use(express.json());
app.use('/api/reports', reportsRouter);
app.use('/api/products', productsRouter); // <-- necesario para /api/products/destacados

describe('GET /api/reports/by-date', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe responder con status 200 y un array de ventas', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1, fecha: '2024-01-01', product: 'Producto', cantidad: 2, total: 100, usuario: 'Juan' }]])
      .mockResolvedValueOnce([{}]); // Para registrar actividad

    const res = await request(app)
      .get('/api/reports/by-date')
      .query({ from: '2024-01-01', to: '2024-01-31', user: 'admin' });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('product', 'Producto');
    expect(pool.query).toHaveBeenCalled();
  });

  it('debe responder 500 si ocurre un error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/reports/by-date');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error al obtener el reporte');
  });
});

describe('GET /api/products/destacados', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe responder con status 200 y un array de productos más vendidos', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Producto Top', vendidos: 10, stock: 5 }]]);
    // Usa la ruta real de tu backend
    const res = await request(app).get('/api/products/destacados');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Producto Top');
    expect(res.body[0]).toHaveProperty('vendidos', 10);
    expect(pool.query).toHaveBeenCalled();
  });

  it('debe responder 500 si ocurre un error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/products/destacados');
    expect(res.statusCode).toBe(500);
  });
});
