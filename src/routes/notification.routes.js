import express from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  getMyNotifications,
  markNotificationRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

/* =========================
   NOTIFICATION ROUTES
   ========================= */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get logged-in user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 */
router.get("/", protect, getMyNotifications);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.put(
  "/:notificationId/read",
  protect,
  markNotificationRead
);

export default router;
