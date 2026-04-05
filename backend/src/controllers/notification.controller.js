const Notification = require('../models/Notification');
const toResponse = (notification) => ({
  _id: notification._id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  data: notification.data,
  link: notification.link,
  read: notification.isRead,
  createdAt: notification.createdAt,
});
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications.map(toResponse) });
  } catch (error) {
    console.error('Failed to load notifications', error);
    res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: toResponse(notification) });
  } catch (error) {
    console.error('Failed to mark notification as read', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notifications', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};
const deleteNotification = async (req, res) => {
  try {
    const result = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete notification', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};
module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
