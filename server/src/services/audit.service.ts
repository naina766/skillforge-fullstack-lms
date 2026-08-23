import { AuditLog } from '../models/AuditLog';
import { logger } from '../config/logger';

export class AuditService {
  static async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await AuditLog.create({
        user: userId,
        action,
        resource,
        resourceId,
        metadata,
      });
    } catch (error) {
      logger.error(error, `Failed to create audit log for action: ${action}`);
    }
  }
}
