import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/User';
import { Session } from '../src/models/Session';

describe('Authentication API Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillforge_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    const testUsers = await User.find({ email: 'teststudent@skillforge.dev' });
    const userIds = testUsers.map((u) => u._id);
    await Session.deleteMany({ user: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
    await mongoose.connection.close();
  });

  const testUser = {
    name: 'Test Student',
    email: 'teststudent@skillforge.dev',
    password: 'Password123!',
  };

  it('should register a new student successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('should reject registration with an existing email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('EMAIL_EXISTS');
  });

  it('should authenticate user and return access token + set refresh cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
