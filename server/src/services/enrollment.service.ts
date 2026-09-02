import { Enrollment, EnrollmentStatus } from '../models/Enrollment';
import { Course } from '../models/Course';
import { AppError } from '../utils/appError';
import { CertificateService } from './certificate.service';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';

export class EnrollmentService {
  static async enroll(studentId: string, courseId: string) {
    const course =
      (courseId.match(/^[0-9a-fA-F]{24}$/) ? await Course.findById(courseId) : null) ||
      (await Course.findOne({ slug: courseId }));

    if (!course || course.status !== 'PUBLISHED') {
      throw new AppError('Course not found or unavailable for enrollment.', 404, 'COURSE_UNAVAILABLE');
    }

    if (course.capacity && course.enrollmentCount >= course.capacity) {
      throw new AppError('Course or workshop has reached maximum capacity.', 400, 'CAPACITY_REACHED');
    }

    const realCourseId = (course._id as any).toString();

    const existing = await Enrollment.findOne({ student: studentId, course: realCourseId });
    if (existing) {
      throw new AppError('You are already enrolled in this course.', 409, 'ALREADY_ENROLLED');
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: realCourseId,
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
      `/learn/${realCourseId}`
    );

    await AuditService.logAction(studentId, 'COURSE_ENROLLED', 'Enrollment', (enrollment._id as any).toString(), {
      courseId: realCourseId,
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
    const course =
      (courseId.match(/^[0-9a-fA-F]{24}$/) ? await Course.findById(courseId) : null) ||
      (await Course.findOne({ slug: courseId }));

    if (!course) return null;
    return Enrollment.findOne({ student: studentId, course: course._id }).lean();
  }

  /**
   * Records throttled video playback progress. Automatically marks the lesson completed
   * and recalculates course progress when watched threshold >= 90%.
   */
  static async updateVideoProgress(
    enrollmentId: string,
    studentId: string,
    lessonId: string,
    watchedSeconds: number,
    duration: number
  ) {
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
    if (totalLessonsCount === 0) totalLessonsCount = 1;

    const safeDuration = duration > 0 ? duration : 1;
    const progressPercent = Math.min(100, Math.round((watchedSeconds / safeDuration) * 100));
    const isCompleted = progressPercent >= 90;

    // Update lesson progress array
    const progressList = enrollment.lessonProgress || [];
    const existingIndex = progressList.findIndex((lp) => lp.lessonId === lessonId);

    if (existingIndex >= 0) {
      progressList[existingIndex].watchedSeconds = Math.max(progressList[existingIndex].watchedSeconds, watchedSeconds);
      progressList[existingIndex].duration = safeDuration;
      progressList[existingIndex].progressPercent = Math.max(progressList[existingIndex].progressPercent, progressPercent);
      if (isCompleted) {
        progressList[existingIndex].completed = true;
      }
      progressList[existingIndex].lastWatchedAt = new Date();
    } else {
      progressList.push({
        lessonId,
        watchedSeconds,
        duration: safeDuration,
        progressPercent,
        completed: isCompleted,
        lastWatchedAt: new Date(),
      });
    }

    enrollment.lessonProgress = progressList;
    enrollment.lastWatchedLesson = lessonId;
    enrollment.lastWatchedPosition = watchedSeconds;
    enrollment.currentLesson = lessonId;
    enrollment.lastAccessedAt = new Date();

    const progressSet = new Set(enrollment.progress);
    if (isCompleted) {
      progressSet.add(lessonId);
    }
    enrollment.progress = Array.from(progressSet);
    enrollment.completedLessons = enrollment.progress.length;

    const completionPercentage = Math.min(100, Math.round((enrollment.completedLessons / totalLessonsCount) * 100));
    enrollment.completionPercentage = completionPercentage;

    let certData = null;
    if (completionPercentage === 100 && enrollment.status !== 'COMPLETED') {
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
      lessonProgress: progressList.find((lp) => lp.lessonId === lessonId),
      isCompleted,
      certificate: certData,
    };
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
