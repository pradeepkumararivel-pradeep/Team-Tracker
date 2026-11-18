const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');

beforeAll(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/teamtracker_test';
  await mongoose.connect(uri);
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth & Health API', () => {
  it('GET /api/health should return 200 healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/auth/register should register user', async () => {
    await User.deleteMany({});
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@teamtracker.io',
      password: 'password123',
      role: 'Team Leader' // Should be ignored for public registration
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login should authenticate valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@teamtracker.io',
      password: 'password123'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
