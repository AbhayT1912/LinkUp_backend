import express from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  markMessagesAsRead,
  getUnreadCounts,
  getTotalUnreadCount,
  unsendMessage,
} from "../controllers/message.controller.js";

import {
  sendMessage,
  getMyConversations,
  getMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

/* =========================
   MESSAGE ROUTES
   ========================= */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - text
 *             properties:
 *               receiverId:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post("/", protect, sendMessage);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get my conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations fetched successfully
 */
router.get("/conversations", protect, getMyConversations);

/**
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 */
router.get("/:conversationId", protect, getMessages);

/**
 * @swagger
 * /api/messages/{conversationId}/read:
 *   put:
 *     summary: Mark messages in a conversation as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.put("/:conversationId/read", protect, markMessagesAsRead);

/**
 * @swagger
 * /api/messages/unread/total:
 *   get:
 *     summary: Get total unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total unread count fetched
 */
router.get("/unread/total", protect, getTotalUnreadCount);

/**
 * @swagger
 * /api/messages/unread:
 *   get:
 *     summary: Get unread message counts per conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread counts fetched
 */
router.get("/unread", protect, getUnreadCounts);

/**
 * @swagger
 * /api/messages/unsend/{messageId}:
 *   delete:
 *     summary: Unsend (delete for everyone) a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message unsent successfully
 */
router.delete("/unsend/:messageId", protect, unsendMessage);

export default router;
