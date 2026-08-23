import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services/certificate.service';
import { ApiResponse } from '../utils/apiResponse';

export class CertificateController {
  static async getCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const cert = await CertificateService.getCertificate(req.params.id);
      return ApiResponse.success(res, cert);
    } catch (error) {
      return next(error);
    }
  }

  static async verifyCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const cert = await CertificateService.getCertificate(req.params.certId);
      return ApiResponse.success(res, {
        isValid: true,
        certificate: cert,
      });
    } catch (error) {
      return ApiResponse.error(res, 'Invalid or unrecognized certificate ID.', 404, 'CERTIFICATE_INVALID');
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
