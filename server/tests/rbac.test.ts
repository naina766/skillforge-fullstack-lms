import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../src/app';
import { User } from '../src/models/User';
import { Course } from '../src/models/Course';
import { Category } from '../src/models/Category';
import { Enrollment } from '../src/models/Enrollment';
import { Certificate } from '../src/models/Certificate';
import { Session } from '../src/models/Session';
import { generateAccessToken } from '../src/utils/jwt';

describe('RBAC & Security Authorization Integration Tests', () => {
  let studentUser: any;
  let studentTwoUser: any;
  let instructorUserA: any;
  let instructorUserB: any;
  let adminUser: any;

  let studentToken: string;
  let studentTwoToken: string;
  let instructorAToken: string;
  let instructorBToken: string;
  let adminToken: string;

  let category: any;
  let courseA: any;
  let courseB: any;
  let studentEnrollmentA: any;
  let certificateA: any;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillforge_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('TestPass@123456', salt);

    // Create Category
    category = await Category.create({
      name: 'Security & Cloud Systems',
      slug: 'security-cloud-systems-test',
      description: 'System security and backend cloud architecture',
      icon: 'Shield',
    });

    // Create Test Users
    studentUser = await User.create({
      name: 'Alice Student',
      email: 'alice.student.test@skillforge.dev',
      passwordHash,
      role: 'STUDENT',
    });

    studentTwoUser = await User.create({
      name: 'Bob Student',
      email: 'bob.student.test@skillforge.dev',
      passwordHash,
      role: 'STUDENT',
    });

    instructorUserA = await User.create({
      name: 'Prof. Alice Instructor',
      email: 'prof.alice.test@skillforge.dev',
      passwordHash,
      role: 'INSTRUCTOR',
    });

    instructorUserB = await User.create({
      name: 'Prof. Bob Instructor',
      email: 'prof.bob.test@skillforge.dev',
      passwordHash,
      role: 'INSTRUCTOR',
    });

    adminUser = await User.create({
      name: 'Super Admin',
      email: 'super.admin.test@skillforge.dev',
      passwordHash,
      role: 'ADMIN',
    });

    studentToken = generateAccessToken({ userId: studentUser._id.toString(), email: studentUser.email, role: studentUser.role });
    studentTwoToken = generateAccessToken({ userId: studentTwoUser._id.toString(), email: studentTwoUser.email, role: studentTwoUser.role });
    instructorAToken = generateAccessToken({ userId: instructorUserA._id.toString(), email: instructorUserA.email, role: instructorUserA.role });
    instructorBToken = generateAccessToken({ userId: instructorUserB._id.toString(), email: instructorUserB.email, role: instructorUserB.role });
    adminToken = generateAccessToken({ userId: adminUser._id.toString(), email: adminUser.email, role: adminUser.role });

    const lessonA1Id = new Types.ObjectId();
    const lessonA2Id = new Types.ObjectId();

    courseA = await Course.create({
      title: 'Advanced System Hardening',
      slug: 'advanced-system-hardening-test',
      shortDescription: 'Production security and defense in depth',
      description: 'Comprehensive guide to container security and Linux hardening',
      category: category._id,
      instructor: instructorUserA._id,
      level: 'ADVANCED',
      duration: 360,
      price: 199,
      status: 'PUBLISHED',
      curriculum: [
        {
          _id: new Types.ObjectId(),
          title: 'Module 1: Defense Fundamentals',
          order: 1,
          lessons: [
            {
              _id: lessonA1Id,
              title: 'Lesson 1.1: Threat Modeling',
              type: 'VIDEO',
              videoSource: 'NONE',
              videoStatus: 'READY',
              duration: 600,
              order: 1,
              isPreview: true,
              resources: [],
            },
            {
              _id: lessonA2Id,
              title: 'Lesson 1.2: Boundary Validation',
              type: 'VIDEO',
              videoSource: 'NONE',
              videoStatus: 'READY',
              duration: 900,
              order: 2,
              isPreview: false,
              resources: [],
            },
          ],
        },
      ],
    });

    courseB = await Course.create({
      title: 'Instructor B Cloud Course',
      slug: 'instructor-b-cloud-course-test',
      shortDescription: 'Authored exclusively by Instructor B',
      description: 'Distributed cloud computing',
      category: category._id,
      instructor: instructorUserB._id,
      level: 'INTERMEDIATE',
      duration: 180,
      price: 99,
      status: 'PUBLISHED',
      curriculum: [],
    });

    studentEnrollmentA = await Enrollment.create({
      student: studentUser._id,
      course: courseA._id,
      status: 'ACTIVE',
      progress: [],
      completedLessons: 0,
      completionPercentage: 0,
    });

    certificateA = await Certificate.create({
      certificateId: 'SF-2026-TESTSEC',
      student: studentUser._id,
      course: courseA._id,
      issueDate: new Date(),
      verificationHash: 'dummyhash1234567890abcdef',
    });
  });

  afterAll(async () => {
    const userIds = [studentUser?._id, studentTwoUser?._id, instructorUserA?._id, instructorUserB?._id, adminUser?._id].filter(Boolean);
    await Certificate.deleteMany({ student: { $in: userIds } });
    await Enrollment.deleteMany({ student: { $in: userIds } });
    await Course.deleteMany({ _id: { $in: [courseA?._id, courseB?._id].filter(Boolean) } });
    await Category.deleteMany({ _id: category?._id });
    await Session.deleteMany({ user: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
  });

  describe('1. Course & Role Authorization', () => {
    it('should reject course creation when attempted by a STUDENT (403)', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Malicious Student Course',
          shortDescription: 'Should be rejected',
          description: 'Students lack instructor privilege',
          category: category._id.toString(),
          level: 'BEGINNER',
          price: 50,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow INSTRUCTOR A to update their own course (200)', async () => {
      const res = await request(app)
        .patch(`/api/courses/${courseA._id}`)
        .set('Authorization', `Bearer ${instructorAToken}`)
        .send({ title: 'Advanced System Hardening v2' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Advanced System Hardening v2');
    });

    it('should REJECT INSTRUCTOR B from updating INSTRUCTOR A course (403)', async () => {
      const res = await request(app)
        .patch(`/api/courses/${courseA._id}`)
        .set('Authorization', `Bearer ${instructorBToken}`)
        .send({ title: 'Hacked Title By Instructor B' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('FORBIDDEN');
    });

    it('should allow ADMIN to update any instructor course (200)', async () => {
      const res = await request(app)
        .patch(`/api/courses/${courseA._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ shortDescription: 'Updated by Admin moderation' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('2. Curriculum & Progress Validation', () => {
    it('should reject progress update with fake/nonexistent lessonId (400 INVALID_LESSON)', async () => {
      const fakeLessonId = new Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/enrollments/${studentEnrollmentA._id}/progress`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ lessonId: fakeLessonId, isCompleted: true });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('INVALID_LESSON');
    });

    it('should accept progress update for legitimate lesson in course curriculum (200)', async () => {
      const validLessonId = courseA.curriculum[0].lessons[0]._id.toString();

      const res = await request(app)
        .patch(`/api/enrollments/${studentEnrollmentA._id}/progress`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ lessonId: validLessonId, isCompleted: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enrollment.completedLessons).toBe(1);
    });

    it('should reject student from updating another student enrollment progress (404)', async () => {
      const validLessonId = courseA.curriculum[0].lessons[0]._id.toString();

      const res = await request(app)
        .patch(`/api/enrollments/${studentEnrollmentA._id}/progress`)
        .set('Authorization', `Bearer ${studentTwoToken}`)
        .send({ lessonId: validLessonId, isCompleted: true });

      expect(res.status).toBe(404);
    });
  });

  describe('3. Certificate Authorization', () => {
    it('should allow owner student to view their certificate by ID (200)', async () => {
      const res = await request(app)
        .get(`/api/certificates/${certificateA._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.certificateId).toBe(certificateA.certificateId);
    });

    it('should REJECT another student from accessing private certificate record (403)', async () => {
      const res = await request(app)
        .get(`/api/certificates/${certificateA._id}`)
        .set('Authorization', `Bearer ${studentTwoToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('FORBIDDEN');
    });

    it('should allow ADMIN to inspect any certificate record (200)', async () => {
      const res = await request(app)
        .get(`/api/certificates/${certificateA._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('4. Admin Self-Protection Safeguards', () => {
    it('should prevent admin from deactivating their own account (400 CANNOT_DEACTIVATE_SELF)', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('CANNOT_DEACTIVATE_SELF');
    });

    it('should prevent admin from demoting their own administrative role (400 CANNOT_DEMOTE_SELF)', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'STUDENT' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('CANNOT_DEMOTE_SELF');
    });
  });

  describe('5. Video Upload Authorization & Ownership Binding', () => {
    it('should reject video sign upload for course belonging to another instructor (403)', async () => {
      const res = await request(app)
        .post('/api/videos/sign-upload')
        .set('Authorization', `Bearer ${instructorBToken}`)
        .send({ courseId: courseA._id.toString() });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('FORBIDDEN');
    });

    it('should reject video sign upload when attempted by a student (403)', async () => {
      const res = await request(app)
        .post('/api/videos/sign-upload')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId: courseA._id.toString() });

      expect(res.status).toBe(403);
    });
  });
});
