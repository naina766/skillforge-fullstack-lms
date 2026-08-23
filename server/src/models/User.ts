import { Schema, model, Document } from 'mongoose';

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  skills: string[];
  interests: string[];
  learningGoals: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
      default: 'STUDENT',
      index: true,
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    learningGoals: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);
