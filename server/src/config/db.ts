import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

// Use reliable public DNS resolvers if local ISP DNS fails on MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setServers is restricted
  
}

export const connectDB = async (retries = 5, delay = 5000): Promise<typeof mongoose> => {
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI);
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries -= 1;
      logger.error(`MongoDB Connection Error. Retries remaining: ${retries}. Error: ${(error as Error).message}`);
      if (retries === 0) {
        throw error;
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple retries.');
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB Disconnected.');
};
