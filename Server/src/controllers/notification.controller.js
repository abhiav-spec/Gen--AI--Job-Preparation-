import Notification from '../models/notification.model.js';

// Get all notifications for the current user
export async function getNotifications(req, res) {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
}

// Mark a single notification as read
export async function markAsRead(req, res) {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found.' });
        }

        return res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({ error: 'Failed to update notification.' });
    }
}

// Mark all as read
export async function markAllAsRead(req, res) {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read.',
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return res.status(500).json({ error: 'Failed to update notifications.' });
    }
}

// Create a notification (Internal helper)
export async function createNotification({ userId, type, title, message, link }) {
    try {
        const notification = new Notification({
            user: userId,
            type,
            title,
            message,
            link,
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}
