import { Notification } from '../models/Notification.js';

export const listUserNotifications = async (userId) => {
  const notifications = await Notification.find({ owner: userId }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ owner: userId, isRead: false });
  return { notifications, unreadCount };
};

export const markAsRead = async (userId, notificationId) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: notificationId, owner: userId },
    { isRead: true },
    { new: true }
  );
  return notif;
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ owner: userId, isRead: false }, { isRead: true });
  return { success: true };
};
