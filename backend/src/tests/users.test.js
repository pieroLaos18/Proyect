const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock pool.query
jest.mock('../db', () => ({
  query: jest.fn()
}));
const pool = require('../db');
const usersRouter = require('../routes/users');
const authRouter = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

process.env.JWT_SECRET = 'secretKey';

const adminToken = jwt.sign({ id: 1, rol: 'admin' }, 'secretKey');
const supervisorToken = jwt.sign({ id: 2, rol: 'supervisor' }, 'secretKey');
const cajeroToken = jwt.sign({ id: 3, rol: 'cajero' }, 'secretKey');
const almaceneroToken = jwt.sign({ id: 4, rol: 'almacenero' }, 'secretKey');

describe('Users API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/users debe devolver usuarios activos', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Juan', email: 'juan@mail.com', role: 'admin' }]]);
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Juan');
  });

  it('GET /api/users/activos debe devolver cantidad de usuarios activos', async () => {
    pool.query.mockResolvedValueOnce([[{ activos: 5 }]]);
    const res = await request(app)
      .get('/api/users/activos')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('activos', 5);
  });

  it('PUT /api/users/:id debe actualizar el rol de un usuario', async () => {
    pool.query.mockResolvedValue([{}]); // Para ambas queries
    const res = await request(app)
      .put('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'user', usuario: 'admin' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(pool.query).toHaveBeenCalledWith('UPDATE users SET rol = ? WHERE id = ?', ['user', '1']);
  });

  it('DELETE /api/users/:id debe desactivar un usuario', async () => {
    pool.query.mockResolvedValue([{}]); // Para ambas queries
    const res = await request(app)
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ usuario: 'admin' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(pool.query).toHaveBeenCalledWith('UPDATE users SET activo = 0 WHERE id = ?', ['1']);
  });

  it('GET /api/users debe manejar errores', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error al obtener usuarios');
  });

  it('POST /api/auth/register debe registrar un usuario', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) // Para verificar usuario existente (debe ser [[]])
      .mockResolvedValueOnce({ insertId: 10 })   // Para insertar usuario
      .mockResolvedValueOnce({});  // Para registrar actividad

    const newUser = {
      correo_electronico: 'nuevo@mail.com',
      password: '123456',
      nombre: 'Nuevo',
      apellido: 'Apellido',
      rol: 'user',
      direccion: 'Calle 123'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Usuario registrado correctamente');
    expect(pool.query).toHaveBeenCalled();
  });

  it('rechaza registro con email inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        correo_electronico: 'no-es-email',
        password: '123456',
        nombre: 'Test',
        apellido: 'Test'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Correo electrónico inválido');
  });

  it('rechaza registro con todos los campos vacíos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});
    expect(res.statusCode).toBe(400);
    // El mensaje puede variar según el primer campo que falle
    expect(res.body).toHaveProperty('message');
  });

  it('rechaza registro sin nombre', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        correo_electronico: 'test@mail.com',
        password: '123456',
        nombre: '', // Vacío
        apellido: 'Test'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'El nombre es obligatorio');
  });

  it('rechaza registro con contraseña muy corta', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        correo_electronico: 'test@mail.com',
        password: '123', // Menos de 6 caracteres
        nombre: 'Test',
        apellido: 'Test'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'La contraseña debe tener al menos 6 caracteres');
  });
});

describe('Permisos por rol en /api/users', () => {
  it('permite acceso a admin', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Juan', email: 'juan@mail.com', role: 'admin' }]]);
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('permite acceso a supervisor', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 2, name: 'Pedro', email: 'pedro@mail.com', role: 'supervisor' }]]);
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${supervisorToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('deniega acceso a cajero', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${cajeroToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });

  it('deniega acceso a almacenero', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${almaceneroToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });
});