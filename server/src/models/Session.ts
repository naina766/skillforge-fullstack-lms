import { Schema, model, Document, Types } from 'mongoose';

export interface ISession extends Document {
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  lastUsedAt: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index for automatic expiry
    },
    revokedAt: {
      type: Date,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Session = model<ISession>('Session', sessionSchema);
