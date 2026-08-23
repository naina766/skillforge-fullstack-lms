import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public verification route
router.get('/verify/:certId', CertificateController.verifyCertificate);

// Protected routes
router.get('/my-certificates', authenticate, CertificateController.getUserCertificates);
router.get('/:id', authenticate, CertificateController.getCertificate);

export default router;
