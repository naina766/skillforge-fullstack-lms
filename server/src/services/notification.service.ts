import { Notification, NotificationType } from '../models/Notification';

export class NotificationService {
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'SYSTEM',
    link?: string
  ) {
    return Notification.create({
      user: userId,
      title,
      message,
      type,
      link: link || '',
    });
  }

  static async getUserNotifications(userId: string) {
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    return {
      notifications,
      unreadCount,
    };
  }

  static async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    return { success: true };
  }
}
