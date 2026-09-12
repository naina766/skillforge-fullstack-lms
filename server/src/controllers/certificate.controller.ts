import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services/certificate.service';
import { ApiResponse } from '../utils/apiResponse';

export class CertificateController {
  static async getCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const cert = await CertificateService.getCertificate(req.params.id);

      const requestingUserId = req.user?.userId;
      const studentId = (cert.student as any)?._id?.toString() || (cert.student as any)?.toString();
      const isOwner = requestingUserId && studentId === requestingUserId;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return ApiResponse.error(res, 'You are not authorized to access this certificate record.', 403, 'FORBIDDEN');
      }

      return ApiResponse.success(res, cert);
    } catch (error) {
      return next(error);
    }
  }

  static async verifyCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const verification = await CertificateService.verifyCertificate(req.params.certId);
      return ApiResponse.success(res, verification);
    } catch (error) {
      return next(error);
    }
  }

  static async getUserCertificates(req: Request, res: Response, next: NextFunction) {
    try {
      const certs = await CertificateService.getUserCertificates(req.user!.userId);
      return ApiResponse.success(res, certs);
    } catch (error) {
      return next(error);
    }
  }
}
