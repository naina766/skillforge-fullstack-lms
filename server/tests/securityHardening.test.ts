import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../src/app';
import { User } from '../src/models/User';
import { Course } from '../src/models/Course';
import { Category } from '../src/models/Category';
import { Enrollment } from '../src/models/Enrollment';
import { Certificate } from '../src/models/Certificate';
import { CertificateService } from '../src/services/certificate.service';
import { generateAccessToken } from '../src/utils/jwt';
import { env } from '../src/config/env';

describe('Production Hardening & Access Control Suite', () => {
  let studentUser: any;
  let nonEnrolledStudent: any;
  let instructorUser: any;
  let otherInstructorUser: any;
  let adminUser: any;

  let studentToken: string;
  let nonEnrolledToken: string;
  let instructorToken: string;
  let otherInstructorToken: string;
  let adminToken: string;

  let category: any;
  let publishedCourse: any;
  let draftCourse: any;
  let certificate: any;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillforge_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('HardeningPass@123', salt);

    category = await Category.create({
      name: 'Security Engineering',
      slug: 'security-engineering-' + Date.now(),
      description: 'Production Application Defense and Authorization',
      icon: 'Shield',
    });

    studentUser = await User.create({
      name: 'Enrolled Learner',
      email: `enrolled-${Date.now()}@skillforge.test`,
      passwordHash,
      role: 'STUDENT',
    });

    nonEnrolledStudent = await User.create({
      name: 'Guest Learner',
      email: `guest-${Date.now()}@skillforge.test`,
      passwordHash,
      role: 'STUDENT',
    });

    instructorUser = await User.create({
      name: 'Lead Instructor',
      email: `author-${Date.now()}@skillforge.test`,
      passwordHash,
      role: 'INSTRUCTOR',
    });

    otherInstructorUser = await User.create({
      name: 'Other Instructor',
      email: `other-inst-${Date.now()}@skillforge.test`,
      passwordHash,
      role: 'INSTRUCTOR',
    });

    adminUser = await User.create({
      name: 'Security Admin',
      email: `secadmin-${Date.now()}@skillforge.test`,
      passwordHash,
      role: 'ADMIN',
    });

    studentToken = generateAccessToken({ userId: studentUser._id.toString(), role: studentUser.role });
    nonEnrolledToken = generateAccessToken({ userId: nonEnrolledStudent._id.toString(), role: nonEnrolledStudent.role });
    instructorToken = generateAccessToken({ userId: instructorUser._id.toString(), role: instructorUser.role });
    otherInstructorToken = generateAccessToken({ userId: otherInstructorUser._id.toString(), role: otherInstructorUser.role });
    adminToken = generateAccessToken({ userId: adminUser._id.toString(), role: adminUser.role });

    // Published course with private media in non-preview lessons
    publishedCourse = await Course.create({
      title: 'Advanced Cryptography & Auth Systems',
      slug: 'advanced-crypto-auth-' + Date.now(),
      shortDescription: 'Master modern cryptographic protocols and backend token security.',
      description: 'Comprehensive course detailing HMAC, digital certificates, and session rotation.',
      type: 'COURSE',
      category: category._id,
      instructor: instructorUser._id,
      level: 'ADVANCED',
      price: 199,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      curriculum: [
        {
          title: 'Module 1: Foundations',
          order: 1,
          lessons: [
            {
              title: 'Lesson 1: Public Preview',
              type: 'VIDEO',
              videoSource: 'YOUTUBE',
              videoStatus: 'READY',
              youtubeVideoId: 'public_preview_id_123',
              duration: 300,
              order: 1,
              isPreview: true,
              resources: ['https://example.com/preview-notes.pdf'],
            },
            {
              title: 'Lesson 2: Private Core Video',
              type: 'VIDEO',
              videoSource: 'CLOUDINARY',
              videoStatus: 'READY',
              cloudinaryPublicId: 'courses/private_video_secret_456',
              cloudinaryUrl: 'https://res.cloudinary.com/skillforge/video/private_secret_456.mp4',
              videoUrl: 'https://res.cloudinary.com/skillforge/video/private_secret_456.mp4',
              duration: 1200,
              order: 2,
              isPreview: false,
              resources: ['https://example.com/private-exam-cheatsheet.pdf'],
            },
          ],
        },
      ],
    });

    // Draft course owned by instructorUser
    draftCourse = await Course.create({
      title: 'Internal Unpublished Draft Course',
      slug: 'internal-draft-course-' + Date.now(),
      shortDescription: 'Unpublished curriculum in development.',
      description: 'Draft content undergoing curriculum design.',
      type: 'COURSE',
      category: category._id,
      instructor: instructorUser._id,
      level: 'BEGINNER',
      price: 49,
      status: 'DRAFT',
      curriculum: [],
    });

    // Enroll studentUser in publishedCourse
    await Enrollment.create({
      student: studentUser._id,
      course: publishedCourse._id,
      status: 'ACTIVE',
      progress: [],
      completedLessons: 0,
      completionPercentage: 0,
    });

    // Issue cryptographic certificate
    certificate = await CertificateService.issueCertificate(
      studentUser._id.toString(),
      publishedCourse._id.toString()
    );
  });

  afterAll(async () => {
    if (category) await Category.findByIdAndDelete(category._id);
    if (publishedCourse) await Course.findByIdAndDelete(publishedCourse._id);
    if (draftCourse) await Course.findByIdAndDelete(draftCourse._id);
    if (studentUser) await User.findByIdAndDelete(studentUser._id);
    if (nonEnrolledStudent) await User.findByIdAndDelete(nonEnrolledStudent._id);
    if (instructorUser) await User.findByIdAndDelete(instructorUser._id);
    if (otherInstructorUser) await User.findByIdAndDelete(otherInstructorUser._id);
    if (adminUser) await User.findByIdAndDelete(adminUser._id);
    if (certificate) await Certificate.findByIdAndDelete(certificate._id);
    await Enrollment.deleteMany({ course: publishedCourse?._id });
  });

  // ==========================================
  // P0 — COURSE CONTENT ACCESS CONTROL
  // ==========================================
  describe('P0 — Course Content Access Control & Media Sanitization', () => {
    it('1. Public unauthenticated request to GET /api/courses/:id must strip private video URLs & resources', async () => {
      const res = await request(app).get(`/api/courses/${publishedCourse._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const modules = res.body.data.curriculum;
      expect(modules).toBeDefined();
      expect(modules[0].lessons).toHaveLength(2);

      const previewLesson = modules[0].lessons[0];
      const privateLesson = modules[0].lessons[1];

      // Preview lesson keeps preview media
      expect(previewLesson.isPreview).toBe(true);
      expect(previewLesson.youtubeVideoId).toBe('public_preview_id_123');

      // Private non-preview lesson must NOT contain private media or resources
      expect(privateLesson.isPreview).toBe(false);
      expect(privateLesson.cloudinaryPublicId).toBeUndefined();
      expect(privateLesson.cloudinaryUrl).toBeUndefined();
      expect(privateLesson.videoUrl).toBeUndefined();
      expect(privateLesson.resources).toBeUndefined();
    });

    it('2. Public unauthenticated request to GET /api/courses/slug/:slug must also sanitize curriculum', async () => {
      const res = await request(app).get(`/api/courses/slug/${publishedCourse.slug}`);
      expect(res.status).toBe(200);

      const privateLesson = res.body.data.curriculum[0].lessons[1];
      expect(privateLesson.cloudinaryPublicId).toBeUndefined();
      expect(privateLesson.cloudinaryUrl).toBeUndefined();
      expect(privateLesson.resources).toBeUndefined();
    });

    it('3. Non-enrolled authenticated student must receive sanitized curriculum (cannot bypass enrollment)', async () => {
      const res = await request(app)
        .get(`/api/courses/${publishedCourse._id}`)
        .set('Authorization', `Bearer ${nonEnrolledToken}`);

      expect(res.status).toBe(200);
      const privateLesson = res.body.data.curriculum[0].lessons[1];
      expect(privateLesson.cloudinaryPublicId).toBeUndefined();
      expect(privateLesson.videoUrl).toBeUndefined();
    });

    it('4. Enrolled student must receive full curriculum with authorized media URLs', async () => {
      const res = await request(app)
        .get(`/api/courses/${publishedCourse._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      const privateLesson = res.body.data.curriculum[0].lessons[1];
      expect(privateLesson.cloudinaryPublicId).toBe('courses/private_video_secret_456');
      expect(privateLesson.cloudinaryUrl).toContain('private_secret_456.mp4');
      expect(privateLesson.resources).toContain('https://example.com/private-exam-cheatsheet.pdf');
    });

    it('5. Course author instructor must access their own full course curriculum', async () => {
      const res = await request(app)
        .get(`/api/courses/${publishedCourse._id}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
      const privateLesson = res.body.data.curriculum[0].lessons[1];
      expect(privateLesson.cloudinaryPublicId).toBe('courses/private_video_secret_456');
    });

    it('6. Platform ADMIN must access full curriculum', async () => {
      const res = await request(app)
        .get(`/api/courses/${publishedCourse._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const privateLesson = res.body.data.curriculum[0].lessons[1];
      expect(privateLesson.cloudinaryPublicId).toBe('courses/private_video_secret_456');
    });

    it('7. Public unauthenticated user cannot access unpublished draft course (404)', async () => {
      const res = await request(app).get(`/api/courses/${draftCourse._id}`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('COURSE_NOT_FOUND');
    });

    it('8. Unrelated instructor cannot access another instructor draft course (404)', async () => {
      const res = await request(app)
        .get(`/api/courses/${draftCourse._id}`)
        .set('Authorization', `Bearer ${otherInstructorToken}`);

      expect(res.status).toBe(404);
    });

    it('9. Course author can view their own draft course', async () => {
      const res = await request(app)
        .get(`/api/courses/${draftCourse._id}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id.toString()).toBe(draftCourse._id.toString());
    });
  });

  // ==========================================
  // P1 — CRYPTOGRAPHIC CERTIFICATE VERIFICATION
  // ==========================================
  describe('P1 — Cryptographic Certificate Verification (HMAC-SHA256)', () => {
    it('1. Verifies a genuine certificate and returns HMAC-SHA256 cryptographic standard', async () => {
      const res = await request(app).get(`/api/certificates/verify/${certificate.certificateId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isValid).toBe(true);
      expect(res.body.data.cryptographicStandard).toBe('HMAC-SHA256');
      expect(res.body.data.certificate.student.name).toBe('Enrolled Learner');
      // Student email is protected on public verification endpoint
      expect(res.body.data.certificate.student.email).toBeUndefined();
    });

    it('2. Rejects non-existent certificate ID with 404 CERTIFICATE_INVALID', async () => {
      const res = await request(app).get('/api/certificates/verify/SF-9999-FAKEID');
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CERTIFICATE_INVALID');
    });

    it('3. Rejects tampered certificate with 400 CERTIFICATE_TAMPERED via timingSafeEqual', async () => {
      // Create a corrupted certificate directly in MongoDB
      await Certificate.deleteMany({ certificateId: /^SF-2026-TAMPER/ });
      const fakeHash = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
      const tamperedCert = await Certificate.create({
        certificateId: `SF-2026-TAMPER-${Date.now()}`,
        student: studentUser._id,
        course: publishedCourse._id,
        issueDate: new Date(),
        verificationHash: fakeHash,
      });

      const res = await request(app).get(`/api/certificates/verify/${tamperedCert.certificateId}`);
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('CERTIFICATE_TAMPERED');

      await Certificate.findByIdAndDelete(tamperedCert._id);
    });
  });

  // ==========================================
  // P1 — SEARCH REGEX INJECTION & QUERY SAFETY
  // ==========================================
  describe('P1 — Search Regex Injection Safety', () => {
    it('1. Safely handles regex metacharacters in search queries without crashing (ReDoS protection)', async () => {
      const dangerousPatterns = ['.*', '([a-z]+)+', 'test(', 'test[', 'test\\', 'test+'];
      for (const pattern of dangerousPatterns) {
        const res = await request(app).get(`/api/courses?search=${encodeURIComponent(pattern)}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });

    it('2. Rejects oversized search query (>100 characters) with 400 validation error', async () => {
      const oversized = 'a'.repeat(101);
      const res = await request(app).get(`/api/courses?search=${oversized}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  // ==========================================
  // P1 — GEMINI MODEL & AI ISOLATION
  // ==========================================
  describe('P1 — AI Configuration & Isolation', () => {
    it('1. Rejects oversized mentor prompt (>2000 characters) before calling external AI', async () => {
      const hugePrompt = 'x'.repeat(2001);
      const res = await request(app)
        .post('/api/ai/mentor')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ prompt: hugePrompt });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('2. Configured GEMINI_MODEL is accessible in environment layer', () => {
      expect(env.GEMINI_MODEL).toBeDefined();
      expect(typeof env.GEMINI_MODEL).toBe('string');
      expect(env.GEMINI_MODEL.length).toBeGreaterThan(0);
    });
  });
});
