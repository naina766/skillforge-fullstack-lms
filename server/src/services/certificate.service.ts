import crypto from 'crypto';
import { Certificate } from '../models/Certificate';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export class CertificateService {
  static generateId(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const year = new Date().getFullYear();
    return `SF-${year}-${randomHex}`;
  }

  static computeVerificationHash(studentId: string, courseId: string, certificateId: string, issueDate: Date | string): string {
    const dateStr = issueDate instanceof Date ? issueDate.toISOString() : new Date(issueDate).toISOString();
    const payload = `${studentId}:${courseId}:${certificateId}:${dateStr}`;
    return crypto
      .createHmac('sha256', env.JWT_ACCESS_SECRET)
      .update(payload)
      .digest('hex');
  }

  static async issueCertificate(studentId: string, courseId: string) {
    const existing = await Certificate.findOne({ student: studentId, course: courseId });
    if (existing) {
      return existing;
    }

    const certificateId = this.generateId();
    const issueDate = new Date();
    const verificationHash = this.computeVerificationHash(studentId, courseId, certificateId, issueDate);

    return Certificate.create({
      certificateId,
      student: studentId,
      course: courseId,
      issueDate,
      verificationHash,
    });
  }

  static async verifyCertificate(idOrCertId: string) {
    const cert = await Certificate.findOne({
      $or: [
        { certificateId: idOrCertId.toUpperCase() },
        { _id: idOrCertId.match(/^[0-9a-fA-F]{24}$/) ? idOrCertId : null },
      ],
    })
      .populate('student', 'name avatar') // Public verification preserves student privacy (no email leaked)
      .populate('course', 'title type thumbnail duration instructor category')
      .lean();

    if (!cert) {
      throw new AppError('Invalid or unrecognized certificate ID.', 404, 'CERTIFICATE_INVALID');
    }

    const studentId = (cert.student as any)?._id?.toString() || (cert.student as any)?.toString();
    const courseId = (cert.course as any)?._id?.toString() || (cert.course as any)?.toString();

    const expectedHash = this.computeVerificationHash(studentId, courseId, cert.certificateId, cert.issueDate);

    const storedBuf = Buffer.from(cert.verificationHash || '', 'hex');
    const expectedBuf = Buffer.from(expectedHash, 'hex');

    const isValid = storedBuf.length === expectedBuf.length && crypto.timingSafeEqual(storedBuf, expectedBuf);

    if (!isValid) {
      throw new AppError('Certificate verification failed. Record integrity check failed.', 400, 'CERTIFICATE_TAMPERED');
    }

    return {
      isValid: true,
      certificate: cert,
      verifiedAt: new Date().toISOString(),
      cryptographicStandard: 'HMAC-SHA256',
    };
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
