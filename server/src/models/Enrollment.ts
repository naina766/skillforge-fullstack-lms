import { Schema, model, Document, Types } from 'mongoose';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface ILessonProgress {
  lessonId: string;
  watchedSeconds: number;
  duration: number;
  progressPercent: number;
  completed: boolean;
  lastWatchedAt: Date;
}

export interface IEnrollment extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  status: EnrollmentStatus;
  progress: string[]; // Completed lesson IDs
  completedLessons: number;
  currentLesson?: string;
  lastWatchedLesson?: string;
  lastWatchedPosition?: number;
  lessonProgress: ILessonProgress[];
  completionPercentage: number;
  startedAt: Date;
  lastAccessedAt: Date;
  totalLearningSeconds: number;
  completedAt?: Date;
  certificateIssued: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    lessonId: { type: String, required: true },
    watchedSeconds: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const enrollmentSchema = new Schema<IEnrollment>(
  {
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
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    progress: {
      type: [String],
      default: [],
    },
    completedLessons: {
      type: Number,
      default: 0,
    },
    currentLesson: {
      type: String,
    },
    lastWatchedLesson: {
      type: String,
    },
    lastWatchedPosition: {
      type: Number,
      default: 0,
    },
    lessonProgress: {
      type: [lessonProgressSchema],
      default: [],
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    totalLearningSeconds: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index preventing duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });

export const Enrollment = model<IEnrollment>('Enrollment', enrollmentSchema);
