import express from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  createHighlight,
  addStoryToHighlight,
  getUserHighlights,
} from "../controllers/highlight.controller.js";

const router = express.Router();

/* =========================
   HIGHLIGHT ROUTES
   ========================= */

/**
 * @swagger
 * /api/highlights:
 *   post:
 *     summary: Create a new highlight
 *     tags: [Highlights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Highlight created successfully
 */
router.post("/", protect, createHighlight);

/**
 * @swagger
 * /api/highlights/{highlightId}/stories/{storyId}:
 *   post:
 *     summary: Add a story to a highlight
 *     tags: [Highlights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: highlightId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Story added to highlight
 */
router.post(
  "/:highlightId/stories/:storyId",
  protect,
  addStoryToHighlight
);

/**
 * @swagger
 * /api/highlights/user/{userId}:
 *   get:
 *     summary: Get highlights of a user
 *     tags: [Highlights]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User highlights fetched successfully
 */
router.get("/user/:userId", getUserHighlights);

export default router;
