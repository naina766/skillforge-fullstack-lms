import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  user: Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
