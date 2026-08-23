import { Schema, model, Document, Types } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string;
  student: Types.ObjectId;
  course: Types.ObjectId;
  issueDate: Date;
  verificationHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    verificationHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Certificate = model<ICertificate>('Certificate', certificateSchema);
