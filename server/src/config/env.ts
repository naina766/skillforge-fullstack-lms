import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillforge',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'skillforge_default_access_secret_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'skillforge_default_refresh_secret_2026',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  AI_API_KEY: process.env.AI_API_KEY || '',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'Admin@123456',
  SEED_INSTRUCTOR_PASSWORD: process.env.SEED_INSTRUCTOR_PASSWORD || 'Instructor@123456',
  SEED_STUDENT_PASSWORD: process.env.SEED_STUDENT_PASSWORD || 'Student@123456',
};
