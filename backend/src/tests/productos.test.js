const request = require('supertest');
const express = require('express');

// Mockear authenticate para endpoints protegidos
jest.mock('../middleware/authenticate', () => (req, res, next) => {
  req.user = { id: 1, nombre: 'Test', correo_electronico: 'test@mail.com', rol: 'admin' };
  next();
});

// Mock pool.query para todas las rutas
jest.mock('../db', () => ({
  query: jest.fn()
}));
const pool = require('../db');
const productsRouter = require('../routes/products');

const app = express();
app.use(express.json());
app.use('/api/products', productsRouter);

describe('GET /api/products', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe responder con status 200 y un array de productos', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Producto Test', stock: 10, stock_min: 5 }]]);
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Producto Test');
  });

  it('debe marcar low_stock si stock <= stock_min', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Test', stock: 2, stock_min: 5 }]]);
    const res = await request(app).get('/api/products');
    expect(res.body[0]).toHaveProperty('low_stock', true);
  });

  it('no debe marcar low_stock si stock > stock_min', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 2, name: 'Test2', stock: 10, stock_min: 5 }]]);
    const res = await request(app).get('/api/products');
    expect(res.body[0]).toHaveProperty('low_stock', false);
  });

  it('GET /api/products responde en menos de 2 segundos', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Test', stock: 10, stock_min: 5 }]]);
    const start = Date.now();
    await request(app).get('/api/products');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});

describe('POST /api/products', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe crear un producto y responder con status 201', async () => {
    pool.query
      .mockResolvedValueOnce([{ insertId: 123 }]) // Para insertar producto
      .mockResolvedValueOnce([{}]); // Para insertar actividad

    const producto = {
      name: 'Nuevo Producto',
      description: 'Descripción',
      price: 10,
      purchase_price: 5,
      category: 'A',
      marca: 'Nike',
      unidad_medida: 'kg',
      stock: 100,
      stock_min: 10,
      stock_max: 200,
      usuario: 'admin'
    };

    const res = await request(app)
      .post('/api/products')
      .field('name', producto.name)
      .field('description', producto.description)
      .field('price', producto.price)
      .field('purchase_price', producto.purchase_price)
      .field('category', producto.category)
      .field('marca', producto.marca)
      .field('unidad_medida', producto.unidad_medida)
      .field('stock', producto.stock)
      .field('stock_min', producto.stock_min)
      .field('stock_max', producto.stock_max)
      .field('usuario', producto.usuario)
      .attach('image', Buffer.from('fake image'), 'test.jpg');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', 123);
    expect(pool.query).toHaveBeenCalled();
  });

  it('debe responder 400 si faltan campos', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Solo nombre' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

describe('PUT /api/products/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe actualizar un producto y responder con status 200', async () => {
    pool.query
      .mockResolvedValueOnce([{}]) // update producto
      .mockResolvedValueOnce([{}]); // insert actividad

    const res = await request(app)
      .put('/api/products/1')
      .field('name', 'Producto Actualizado')
      .field('description', 'Desc')
      .field('price', 20)
      .field('purchase_price', 10)
      .field('category', 'B')
      .field('marca', 'Adidas')
      .field('unidad_medida', 'lt')
      .field('stock', 50)
      .field('stock_min', 5)
      .field('stock_max', 100)
      .field('usuario', 'admin');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(pool.query).toHaveBeenCalled();
  });
});

describe('DELETE /api/products/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe desactivar un producto y responder con status 200', async () => {
    pool.query
      .mockResolvedValueOnce([{}]) // update producto
      .mockResolvedValueOnce([{}]); // insert actividad

    const res = await request(app)
      .delete('/api/products/1')
      .send({ usuario: 'admin' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Producto desactivado exitosamente');
    expect(pool.query).toHaveBeenCalled();
  });
});

describe('GET /api/products/categoria/:categoria', () => {
  it('debe filtrar productos por categoría', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Test', category: 'A', marca: 'Nike', unidad_medida: 'kg' }]]);
    const res = await request(app).get('/api/products/categoria/A');
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('category', 'A');
  });
});

describe('GET /api/products/marca/:marca', () => {
  it('debe filtrar productos por marca', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Test', category: 'A', marca: 'Nike', unidad_medida: 'kg' }]]);
    const res = await request(app).get('/api/products/marca/Nike');
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('marca', 'Nike');
  });
});

describe('GET /api/products/unidad/:unidad', () => {
  it('debe filtrar productos por unidad de medida', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Test', category: 'A', marca: 'Nike', unidad_medida: 'kg' }]]);
    const res = await request(app).get('/api/products/unidad/kg');
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('unidad_medida', 'kg');
  });
});