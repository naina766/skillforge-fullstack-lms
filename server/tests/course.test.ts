import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';

describe('Course Discovery API Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillforge_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return health status endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('should list course catalog with pagination', async () => {
    const res = await request(app).get('/api/courses?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeDefined();
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
