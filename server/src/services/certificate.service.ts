import crypto from 'crypto';
import { Certificate } from '../models/Certificate';
import { AppError } from '../utils/appError';

export class CertificateService {
  static generateId(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const year = new Date().getFullYear();
    return `SF-${year}-${randomHex}`;
  }

  static async issueCertificate(studentId: string, courseId: string) {
    const existing = await Certificate.findOne({ student: studentId, course: courseId });
    if (existing) {
      return existing;
    }

    const certificateId = this.generateId();
    const verificationHash = crypto
      .createHash('sha256')
      .update(`${studentId}-${courseId}-${certificateId}-${Date.now()}`)
      .digest('hex');

    return Certificate.create({
      certificateId,
      student: studentId,
      course: courseId,
      issueDate: new Date(),
      verificationHash,
    });
  }

  static async getCertificate(idOrCertId: string) {
    const cert = await Certificate.findOne({
      $or: [{ certificateId: idOrCertId.toUpperCase() }, { _id: idOrCertId.match(/^[0-9a-fA-F]{24}$/) ? idOrCertId : null }],
    })
      .populate('student', 'name email avatar')
      .populate('course', 'title type thumbnail duration instructor category')
      .lean();

    if (!cert) {
      throw new AppError('Certificate not found.', 404, 'CERTIFICATE_NOT_FOUND');
    }

    return cert;
  }

  static async getUserCertificates(studentId: string) {
    return Certificate.find({ student: studentId })
      .populate('course', 'title type thumbnail level')
      .sort({ issueDate: -1 })
      .lean();
  }
}
