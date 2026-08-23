import { Enrollment, EnrollmentStatus } from '../models/Enrollment';
import { Course } from '../models/Course';
import { AppError } from '../utils/appError';
import { CertificateService } from './certificate.service';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';

export class EnrollmentService {
  static async enroll(studentId: string, courseId: string) {
    const course = await Course.findById(courseId);
    if (!course || course.status !== 'PUBLISHED') {
      throw new AppError('Course not found or unavailable for enrollment.', 404, 'COURSE_UNAVAILABLE');
    }

    if (course.capacity && course.enrollmentCount >= course.capacity) {
      throw new AppError('Course or workshop has reached maximum capacity.', 400, 'CAPACITY_REACHED');
    }

    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) {
      throw new AppError('You are already enrolled in this course.', 409, 'ALREADY_ENROLLED');
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'ACTIVE',
      progress: [],
      completedLessons: 0,
      completionPercentage: 0,
      startedAt: new Date(),
      lastAccessedAt: new Date(),
    });

    // Increment course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    await NotificationService.createNotification(
      studentId,
      'Enrollment Successful',
      `You successfully enrolled in "${course.title}". Start learning now!`,
      'ENROLLMENT',
      `/learn/${courseId}`
    );

    await AuditService.logAction(studentId, 'COURSE_ENROLLED', 'Enrollment', (enrollment._id as any).toString(), {
      courseId,
      courseTitle: course.title,
    });

    return enrollment;
  }

  static async getUserEnrollments(studentId: string) {
    return Enrollment.find({ student: studentId })
      .populate({
        path: 'course',
        select: 'title slug thumbnail category instructor level duration type rating reviewCount curriculum',
        populate: [
          { path: 'category', select: 'name slug icon' },
          { path: 'instructor', select: 'name avatar' },
        ],
      })
      .sort({ lastAccessedAt: -1 })
      .lean();
  }

  static async getEnrollmentById(enrollmentId: string, userId: string) {
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      student: userId,
    })
      .populate({
        path: 'course',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'instructor', select: 'name avatar bio' },
        ],
      })
      .lean();

    if (!enrollment) {
      throw new AppError('Enrollment record not found.', 404, 'ENROLLMENT_NOT_FOUND');
    }

    return enrollment;
  }

  static async getEnrollmentByCourse(studentId: string, courseId: string) {
    return Enrollment.findOne({ student: studentId, course: courseId }).lean();
  }

  static async updateProgress(enrollmentId: string, studentId: string, lessonId: string, isCompleted = true) {
    const enrollment = await Enrollment.findOne({ _id: enrollmentId, student: studentId });
    if (!enrollment) {
      throw new AppError('Enrollment record not found.', 404, 'ENROLLMENT_NOT_FOUND');
    }

    const course = await Course.findById(enrollment.course);
    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    let totalLessonsCount = 0;
    course.curriculum.forEach((mod) => {
      totalLessonsCount += mod.lessons.length;
    });

    if (totalLessonsCount === 0) totalLessonsCount = 1; // Prevent div by 0

    const progressSet = new Set(enrollment.progress);
    if (isCompleted) {
      progressSet.add(lessonId);
    } else {
      progressSet.delete(lessonId);
    }

    enrollment.progress = Array.from(progressSet);
    enrollment.completedLessons = enrollment.progress.length;
    enrollment.currentLesson = lessonId;
    enrollment.lastAccessedAt = new Date();

    const percentage = Math.min(100, Math.round((enrollment.completedLessons / totalLessonsCount) * 100));
    enrollment.completionPercentage = percentage;

    let certData = null;
    if (percentage === 100 && enrollment.status !== 'COMPLETED') {
      enrollment.status = 'COMPLETED';
      enrollment.completedAt = new Date();

      if (!enrollment.certificateIssued) {
        certData = await CertificateService.issueCertificate(studentId, (course._id as any).toString());
        enrollment.certificateIssued = true;

        await NotificationService.createNotification(
          studentId,
          'Course Completed! 🎓',
          `Congratulations! You have completed "${course.title}". Your certificate is ready!`,
          'CERTIFICATE',
          `/dashboard/certificates`
        );
      }
    }

    await enrollment.save();

    return {
      enrollment,
      certificate: certData,
    };
  }
}
