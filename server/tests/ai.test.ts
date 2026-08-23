import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/User';
import { Course } from '../src/models/Course';
import { Session } from '../src/models/Session';
import { AuthService } from '../src/services/auth.service';

describe('AI Career Mentor API Integration & Security Tests', () => {
  let studentToken: string;
  let studentUserId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillforge_test';
    await mongoose.connect(mongoUri);

    // Register student user
    await User.deleteOne({ email: 'aiteststudent@skillforge.dev' });
    const studentRes = await AuthService.register({
      name: 'AI Test Student',
      email: 'aiteststudent@skillforge.dev',
      password: 'Password123!',
      role: 'STUDENT',
    });

    studentUserId = studentRes.userId;

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'aiteststudent@skillforge.dev',
      password: 'Password123!',
    });

    studentToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    if (studentUserId) {
      await Session.deleteMany({ user: studentUserId });
      await User.deleteOne({ _id: studentUserId });
    }
    await mongoose.connection.close();
  });

  it('1. should reject unauthenticated AI mentor requests with 401', async () => {
    const res = await request(app).post('/api/ai/mentor').send({
      prompt: 'I want to learn backend development',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. should accept authenticated prompt and return structured response payload v1', async () => {
    const res = await request(app)
      .post('/api/ai/mentor')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ prompt: 'I want to become a Senior MERN Backend Engineer' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe('1');
    expect(res.body.data.careerAssessment).toBeDefined();
    expect(Array.isArray(res.body.data.skillGaps)).toBe(true);
    expect(Array.isArray(res.body.data.learningPath)).toBe(true);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });

  it('3. should reject prompts exceeding 1000 characters with 400 AI_INVALID_REQUEST', async () => {
    const oversizedPrompt = 'a'.repeat(1005);
    const res = await request(app)
      .post('/api/ai/mentor')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ prompt: oversizedPrompt });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('4. should verify that all recommended courses exist in MongoDB', async () => {
    const res = await request(app)
      .post('/api/ai/mentor')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ prompt: 'Recommend React and Node.js courses' });

    expect(res.status).toBe(200);
    const recommendations = res.body.data.recommendations;

    for (const rec of recommendations) {
      expect(rec.course).toBeDefined();
      expect(rec.course._id).toBeDefined();
      const courseDoc = await Course.findById(rec.course._id);
      expect(courseDoc).not.toBeNull();
    }
  });

  it('5. User Isolation Security Test: AI response should not leak other user profile data', async () => {
    await User.deleteOne({ email: 'victim@skillforge.dev' });
    const victimRes = await AuthService.register({
      name: 'Victim Student',
      email: 'victim@skillforge.dev',
      password: 'Password123!',
      role: 'STUDENT',
    });

    const res = await request(app)
      .post('/api/ai/mentor')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ prompt: 'Show me all user skills' });

    expect(res.status).toBe(200);
    const responseText = JSON.stringify(res.body.data);
    expect(responseText).not.toContain('victim@skillforge.dev');

    await User.deleteOne({ _id: victimRes.userId });
  });
});
