const request = require('supertest');
const express = require('express');

// Mock pool.query
jest.mock('../db', () => ({
  query: jest.fn()
}));
const pool = require('../db');
const activityRouter = require('../routes/activity');

const app = express();
app.use(express.json());
app.use('/api/activity', activityRouter);

describe('Activity API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/activity/ultimas debe devolver las últimas 10 actividades', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, descripcion: 'Test', fecha: '2024-01-01' }]]);
    const res = await request(app).get('/api/activity/ultimas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('descripcion', 'Test');
  });

  it('GET /api/activity/todas debe devolver todas las actividades', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 2, descripcion: 'Otra', fecha: '2024-01-02' }]]);
    const res = await request(app).get('/api/activity/todas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('descripcion', 'Otra');
  });

  it('GET /api/activity/ultimas debe manejar errores', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/activity/ultimas');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error al obtener actividades');
  });

  it('GET /api/activity/todas debe manejar errores', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/activity/todas');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error al obtener actividades');
  });
});