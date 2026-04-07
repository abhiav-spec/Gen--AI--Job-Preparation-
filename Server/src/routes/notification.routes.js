import { Router } from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from '../controllers/notification.controller.js';
import { authUser } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/all', authUser, getNotifications);
router.patch('/:notificationId/read', authUser, markAsRead);
router.patch('/all/read', authUser, markAllAsRead);

export default router;
