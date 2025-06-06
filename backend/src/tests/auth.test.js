const request = require('supertest');
const express = require('express');

// Mock pool.query y bcrypt.hash
jest.mock('../db', () => ({
  query: jest.fn()
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashedPassword'))
}));
const pool = require('../db');
const bcrypt = require('bcrypt');
const authRouter = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

process.env.JWT_SECRET = 'testsecret';

describe('POST /api/auth/reset-password/:token', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => jest.clearAllMocks());

  it('debe responder 400 si el token es inválido o expirado', async () => {
    pool.query.mockResolvedValueOnce([[]]); // No se encuentra usuario
    const res = await request(app)
      .post('/api/auth/reset-password/badtoken')
      .send({ password: 'algo' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Token inválido o expirado');
  });

  it('debe responder 500 si ocurre un error en la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .post('/api/auth/reset-password/validtoken')
      .send({ password: 'algo' });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error al restablecer la contraseña');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe autenticar correctamente con usuario y contraseña válidos', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, nombre: 'Test', correo_electronico: 'test@mail.com', password: 'hashed', activo: 1 }]]);
    require('bcrypt').compare = jest.fn(() => Promise.resolve(true));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo_electronico: 'test@mail.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@mail.com');
  });

  it('debe rechazar si el usuario no existe', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo_electronico: 'noexiste@mail.com', password: '123456' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Usuario no encontrado');
  });

  it('debe rechazar si la contraseña es incorrecta', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, nombre: 'Test', correo_electronico: 'test@mail.com', password: 'hashed', activo: 1 }]]);
    require('bcrypt').compare = jest.fn(() => Promise.resolve(false));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo_electronico: 'test@mail.com', password: 'wrong' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Contraseña incorrecta');
  });

  it('debe responder 500 si ocurre un error en la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo_electronico: 'test@mail.com', password: '123456' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error interno del servidor');
  });

  it('debe rechazar el acceso si el usuario está inactivo', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, nombre: 'Test', correo_electronico: 'test@mail.com', password: 'hashed', activo: 0 }]]);
    require('bcrypt').compare = jest.fn(() => Promise.resolve(true));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo_electronico: 'test@mail.com', password: '123456' });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'Usuario inactivo');
  });
});

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe registrar un nuevo usuario correctamente', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) // Para verificar si existe (no existe)
      .mockResolvedValueOnce([{ insertId: 1 }]); // Para el insert
    const res = await request(app)
      .post('/api/auth/register')
      .send({ correo_electronico: 'nuevo@mail.com', password: '123456', nombre: 'Nuevo', apellido: 'Usuario' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Usuario registrado correctamente');
    expect(pool.query).toHaveBeenCalledTimes(3);
  });

  it('debe responder 400 si el email ya está en uso', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // Simular que ya existe un usuario con ese email
    const res = await request(app)
      .post('/api/auth/register')
      .send({ correo_electronico: 'yaexiste@mail.com', password: '123456', nombre: 'Usuario', apellido: 'Existente' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'El email ya está en uso');
  });

  it('rechaza registro de usuario con email inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ correo_electronico: 'no-es-email', password: '123', nombre: 'Test', apellido: 'Test' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Correo electrónico inválido');
  });
});