import * as notificationService from '../services/notificationService.js';

export const listNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.listUserNotifications(req.user._id);
    return res.status(200).json({
      success: true,
      data: result.notifications,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const notif = await notificationService.markAsRead(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      data: notif,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};
