import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Insecure development defaults (ONLY permitted in non-production environments)
const DEV_DEFAULT_ACCESS_SECRET = 'skillforge_default_access_secret_2026';
const DEV_DEFAULT_REFRESH_SECRET = 'skillforge_default_refresh_secret_2026';

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || (!isProduction ? DEV_DEFAULT_ACCESS_SECRET : '');
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || (!isProduction ? DEV_DEFAULT_REFRESH_SECRET : '');
const mongoUri = process.env.MONGO_URI || (!isProduction ? 'mongodb://127.0.0.1:27017/skillforge' : '');

// Strict production fail-fast validation
if (isProduction) {
  const missingSecrets: string[] = [];

  if (!jwtAccessSecret || jwtAccessSecret === DEV_DEFAULT_ACCESS_SECRET) {
    missingSecrets.push('JWT_ACCESS_SECRET (must be set to a secure production secret)');
  }
  if (!jwtRefreshSecret || jwtRefreshSecret === DEV_DEFAULT_REFRESH_SECRET) {
    missingSecrets.push('JWT_REFRESH_SECRET (must be set to a secure production secret)');
  }
  if (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
    missingSecrets.push('MONGO_URI (must be set to a valid production database cluster)');
  }

  if (missingSecrets.length > 0) {
    throw new Error(
      `[FATAL] Production configuration error. The server cannot start due to missing or insecure secrets:\n` +
      missingSecrets.map((s) => `  - ${s}`).join('\n') +
      `\nPlease supply valid production credentials via environment variables.`
    );
  }
}

export const env = {
  NODE_ENV: nodeEnv,
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGO_URI: mongoUri,
  JWT_ACCESS_SECRET: jwtAccessSecret,
  JWT_REFRESH_SECRET: jwtRefreshSecret,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  MAX_VIDEO_DURATION_SECONDS: parseInt(process.env.MAX_VIDEO_DURATION_SECONDS || '900', 10), // 15 minutes max
  MAX_VIDEO_SIZE_MB: parseInt(process.env.MAX_VIDEO_SIZE_MB || '500', 10), // 500 MB max
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  AI_API_KEY: process.env.AI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'Admin@123456',
  SEED_INSTRUCTOR_PASSWORD: process.env.SEED_INSTRUCTOR_PASSWORD || 'Instructor@123456',
  SEED_STUDENT_PASSWORD: process.env.SEED_STUDENT_PASSWORD || 'Student@123456',
};

