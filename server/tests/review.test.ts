import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/User';
import { Course } from '../src/models/Course';
import { Enrollment } from '../src/models/Enrollment';
import { Review } from '../src/models/Review';
import { generateAccessToken } from '../src/utils/jwt';

describe('Course Rating & Review System - Comprehensive API Tests', () => {
  let studentUser: any;
  let otherStudentUser: any;
  let adminUser: any;
  let studentToken: string;
  let otherStudentToken: string;
  let adminToken: string;
  let testCourse: any;
  let nonEnrolledCourse: any;
  let createdReviewId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillforge_test';
    await mongoose.connect(mongoUri);

    // Create test student 1
    const studentEmail = `review_student_${Date.now()}@skillforge.dev`;
    studentUser = await User.create({
      name: 'Review Student 1',
      email: studentEmail,
      passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'STUDENT',
    });
    studentToken = generateAccessToken({
      userId: studentUser._id.toString(),
      email: studentUser.email,
      role: 'STUDENT',
    });

    // Create test student 2
    const otherEmail = `review_student2_${Date.now()}@skillforge.dev`;
    otherStudentUser = await User.create({
      name: 'Review Student 2',
      email: otherEmail,
      passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'STUDENT',
    });
    otherStudentToken = generateAccessToken({
      userId: otherStudentUser._id.toString(),
      email: otherStudentUser.email,
      role: 'STUDENT',
    });

    // Create test admin
    const adminEmail = `review_admin_${Date.now()}@skillforge.dev`;
    adminUser = await User.create({
      name: 'Review Admin',
      email: adminEmail,
      passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'ADMIN',
    });
    adminToken = generateAccessToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: 'ADMIN',
    });

    // Create test courses
    testCourse = await Course.create({
      title: 'Review System Test Course',
      slug: `review-test-course-${Date.now()}`,
      shortDescription: 'Test short description',
      description: 'Test description',
      thumbnail: 'https://example.com/thumb.jpg',
      type: 'COURSE',
      category: new Types.ObjectId(),
      instructor: new Types.ObjectId(),
      level: 'BEGINNER',
      duration: 120,
      language: 'English',
      price: 29.99,
      status: 'PUBLISHED',
      rating: 0,
      reviewCount: 0,
      ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    });

    nonEnrolledCourse = await Course.create({
      title: 'Non-Enrolled Test Course',
      slug: `non-enrolled-course-${Date.now()}`,
      shortDescription: 'Test',
      description: 'Test',
      thumbnail: 'https://example.com/thumb.jpg',
      type: 'COURSE',
      category: new Types.ObjectId(),
      instructor: new Types.ObjectId(),
      level: 'BEGINNER',
      duration: 60,
      language: 'English',
      price: 0,
      status: 'PUBLISHED',
    });

    // Enroll student 1 into testCourse
    await Enrollment.create({
      student: studentUser._id,
      course: testCourse._id,
      status: 'ACTIVE',
      progress: 25,
      enrolledAt: new Date(),
    });
  });

  afterAll(async () => {
    if (testCourse) {
      await Review.deleteMany({ course: testCourse._id });
      await Enrollment.deleteMany({ course: testCourse._id });
      await Course.findByIdAndDelete(testCourse._id);
    }
    if (nonEnrolledCourse) {
      await Course.findByIdAndDelete(nonEnrolledCourse._id);
    }
    if (studentUser) await User.findByIdAndDelete(studentUser._id);
    if (otherStudentUser) await User.findByIdAndDelete(otherStudentUser._id);
    if (adminUser) await User.findByIdAndDelete(adminUser._id);
    await mongoose.connection.close();
  });

  it('1. should reject review creation if unauthenticated (401)', async () => {
    const res = await request(app)
      .post(`/api/courses/${testCourse._id}/reviews`)
      .send({ rating: 5, comment: 'Great course!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. should reject review creation if student is not enrolled (403)', async () => {
    const res = await request(app)
      .post(`/api/courses/${nonEnrolledCourse._id}/reviews`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ rating: 5, comment: 'Nice course!' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('NOT_ENROLLED');
  });

  it('3. should reject invalid rating (< 1 or > 5) (400)', async () => {
    const resLow = await request(app)
      .post(`/api/courses/${testCourse._id}/reviews`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ rating: 0, comment: 'Too low' });

    expect(resLow.status).toBe(400);

    const resHigh = await request(app)
      .post(`/api/courses/${testCourse._id}/reviews`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ rating: 6, comment: 'Too high' });

    expect(resHigh.status).toBe(400);
  });

  it('4. should allow enrolled student to submit a 1-5 star review (201)', async () => {
    const res = await request(app)
      .post(`/api/courses/${testCourse._id}/reviews`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ rating: 5, comment: 'Exceptional deep dive! Highly recommended.' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.review).toBeDefined();
    expect(res.body.data.review.rating).toBe(5);
    expect(res.body.data.review.comment).toBe('Exceptional deep dive! Highly recommended.');
    expect(res.body.data.courseRating.ratingAverage).toBe(5);
    expect(res.body.data.courseRating.ratingCount).toBe(1);
    expect(res.body.data.courseRating.ratingDistribution['5']).toBe(1);

    createdReviewId = res.body.data.review._id;
  });

  it('5. should reject duplicate review for same student & course (409)', async () => {
    const res = await request(app)
      .post(`/api/courses/${testCourse._id}/reviews`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ rating: 4, comment: 'Trying duplicate review' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('REVIEW_EXISTS');
  });

  it('6. should retrieve my review via GET /my-review', async () => {
    const res = await request(app)
      .get(`/api/courses/${testCourse._id}/my-review`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data._id).toBe(createdReviewId);
    expect(res.body.data.rating).toBe(5);
  });

  it('7. should list public course reviews with pagination and summary', async () => {
    const res = await request(app).get(`/api/courses/${testCourse._id}/reviews?page=1&limit=5`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0]._id).toBe(createdReviewId);
    expect(res.body.data.ratingAverage).toBe(5);
    expect(res.body.data.ratingCount).toBe(1);
    expect(res.body.data.ratingDistribution['5']).toBe(1);
  });

  it('8. should allow review owner to update their review', async () => {
    const res = await request(app)
      .patch(`/api/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ rating: 4, comment: 'Updated review: Still great, 4 stars!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.review.rating).toBe(4);
    expect(res.body.data.review.comment).toContain('Updated review');
    expect(res.body.data.courseRating.ratingAverage).toBe(4);
    expect(res.body.data.courseRating.ratingDistribution['4']).toBe(1);
    expect(res.body.data.courseRating.ratingDistribution['5']).toBe(0);
  });

  it('9. should forbid other students from updating someone else review (403)', async () => {
    const res = await request(app)
      .patch(`/api/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${otherStudentToken}`)
      .send({ rating: 1, comment: 'Hacking review' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('10. should forbid other students from deleting someone else review (403)', async () => {
    const res = await request(app)
      .delete(`/api/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${otherStudentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('11. should allow admin to moderate review', async () => {
    const res = await request(app)
      .patch(`/api/reviews/${createdReviewId}/moderate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isModerated: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.review.isModerated).toBe(true);
  });

  it('12. should allow student owner to delete their review and recalculate aggregates', async () => {
    const res = await request(app)
      .delete(`/api/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courseRating.ratingAverage).toBe(0);
    expect(res.body.data.courseRating.ratingCount).toBe(0);

    // Verify course record updated in DB
    const course = await Course.findById(testCourse._id);
    expect(course?.rating).toBe(0);
    expect(course?.reviewCount).toBe(0);
  });
});
