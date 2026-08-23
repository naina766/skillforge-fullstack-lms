import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './config/logger';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      logger.info(`SkillForge Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    const handleShutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    logger.error(error, 'Failed to initialize server');
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
