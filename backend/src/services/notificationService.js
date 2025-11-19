import { createNotification as createNotificationRecord } from '../models/notificationModel.js';

export async function createNotification({
  userId,
  title,
  message,
  linkUrl = null,
}) {
  return createNotificationRecord({
    user_id: userId,
    title: title || 'Notification',
    message,
    link_url: linkUrl,
  });
}
