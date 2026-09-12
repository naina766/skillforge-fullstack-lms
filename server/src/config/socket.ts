import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from './logger';
import { env } from './env';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join-course', (courseId: string) => {
      if (courseId) {
        socket.join(`course:${courseId}`);
      }
    });

    socket.on('leave-course', (courseId: string) => {
      if (courseId) {
        socket.leave(`course:${courseId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};

export const emitRatingUpdated = (payload: {
  courseId: string;
  ratingAverage: number;
  ratingCount: number;
  ratingDistribution: { [key: string]: number };
}) => {
  if (io) {
    io.emit('course:ratingUpdated', payload);
    io.to(`course:${payload.courseId}`).emit('course:ratingUpdated', payload);
  }
};
