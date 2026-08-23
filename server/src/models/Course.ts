import { Schema, model, Document, Types } from 'mongoose';

export type CourseType = 'COURSE' | 'WORKSHOP' | 'BOOTCAMP' | 'WEBINAR';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
export type CourseStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type LessonType = 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'ASSIGNMENT';

export interface ILesson {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  type: LessonType;
  videoUrl?: string;
  duration: number; // in seconds
  order: number;
  isPreview: boolean;
  resources: string[];
}

export interface IModule {
  _id?: Types.ObjectId;
  title: string;
  order: number;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  type: CourseType;
  category: Types.ObjectId;
  instructor: Types.ObjectId;
  level: CourseLevel;
  duration: number; // total duration in minutes
  language: string;
  price: number;
  discountedPrice?: number;
  skills: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  curriculum: IModule[];
  // Workshop specific fields
  startDate?: Date;
  endDate?: Date;
  registrationDeadline?: Date;
  location?: string;
  meetingUrl?: string;
  capacity?: number;
  maxStudents?: number;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  status: CourseStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['VIDEO', 'ARTICLE', 'QUIZ', 'ASSIGNMENT'], default: 'VIDEO' },
    videoUrl: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    order: { type: Number, required: true },
    isPreview: { type: Boolean, default: false },
    resources: { type: [String], default: [] },
  },
  { _id: true }
);

const moduleSchema = new Schema<IModule>(
  {
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: true }
);

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Course slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
    },
    description: {
      type: String,
      required: [true, 'Full description is required'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['COURSE', 'WORKSHOP', 'BOOTCAMP', 'WEBINAR'],
      default: 'COURSE',
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Course category is required'],
      index: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
      index: true,
    },
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'],
      default: 'ALL_LEVELS',
    },
    duration: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: 'English',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountedPrice: {
      type: Number,
      min: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    curriculum: {
      type: [moduleSchema],
      default: [],
    },
    // Workshop specific optional fields
    startDate: { type: Date },
    endDate: { type: Date },
    registrationDeadline: { type: Date },
    location: { type: String, default: '' },
    meetingUrl: { type: String, default: '' },
    capacity: { type: Number },

    maxStudents: { type: Number },
    enrollmentCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ title: 'text', description: 'text', skills: 'text' });

export const Course = model<ICourse>('Course', courseSchema);
