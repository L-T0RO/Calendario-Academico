const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  execute: jest.fn(),
}));

const db = require('../src/config/database');
const app = require('../src/app');

describe('Pruebas del Calendario Académico - Taller III', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'secreto_desarrollo';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Casos Normales', () => {
    test('GET /api/cuatrimestres - Listar cuatrimestres (HTTP 200)', async () => {
      const mockCuatrimestres = [
        { id: 1, nombre: '1er Cuatrimestre 2026' },
        { id: 2, nombre: '2do Cuatrimestre 2026' },
      ];

      db.query.mockResolvedValue([mockCuatrimestres]);
      db.execute.mockResolvedValue([mockCuatrimestres]);

      const res = await request(app).get('/api/cuatrimestres');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('Acceso a ruta protegida con JWT válido de Director', async () => {
      const tokenDirector = jwt.sign(
        { id: 1, email: 'director@utn.edu.ar', rol: 'director' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      db.query.mockResolvedValue([[{ id: 1, materia: 'Programación IV' }]]);
      db.execute.mockResolvedValue([[{ id: 1, materia: 'Programación IV' }]]);

      const res = await request(app)
        .get('/api/examenes')
        .set('Authorization', `Bearer ${tokenDirector}`);

      expect(res.statusCode).not.toBe(401);
      expect(res.statusCode).not.toBe(403);
    });
  });

  describe('Casos de Error', () => {
    test('POST /api/auth/login - Rechazar credenciales vacías (HTTP 400/401)', async () => {
      db.query.mockResolvedValue([[]]);
      db.execute.mockResolvedValue([[]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '', password: '' });

      expect([400, 401]).toContain(res.statusCode);
    });

    test('Rechazar peticiones sin token JWT (HTTP 401/403)', async () => {
      const res = await request(app)
        .post('/api/examenes')
        .send({ materia: 'Metodología II' });

      expect([401, 403]).toContain(res.statusCode);
    });
  });

  describe('Casos Límite', () => {
    test('Rechazar JWT expirado (HTTP 401/403)', async () => {
      const tokenExpirado = jwt.sign(
        { id: 2, rol: 'director' },
        JWT_SECRET,
        { expiresIn: '-10s' }
      );

      const res = await request(app)
        .post('/api/examenes')
        .set('Authorization', `Bearer ${tokenExpirado}`)
        .send({ materia: 'Estadística' });

      expect([401, 403]).toContain(res.statusCode);
    });

    test('Ruta inexistente devuelve HTTP 404', async () => {
      const res = await request(app).get('/api/endpoint-inexistente');
      expect(res.statusCode).toBe(404);
    });
  });
});