import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(window.location.origin.replace(':5173', ':5000'), {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socketInstance;
};

export const useSocketListener = (courseId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    if (courseId) {
      socket.emit('join-course', courseId);
    }

    const handleRatingUpdated = (data: { courseId: string; ratingAverage: number; ratingCount: number }) => {
      queryClient.invalidateQueries({ queryKey: ['course-reviews', data.courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', data.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-analytics'] });
    };

    socket.on('course:ratingUpdated', handleRatingUpdated);

    return () => {
      if (courseId) {
        socket.emit('leave-course', courseId);
      }
      socket.off('course:ratingUpdated', handleRatingUpdated);
    };
  }, [courseId, queryClient]);
};
