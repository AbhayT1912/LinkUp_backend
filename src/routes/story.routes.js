import express from "express";
import protect from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  addStory,
  getFeedStories,
  viewStory,
} from "../controllers/story.controller.js";

const router = express.Router();

/* =========================
   STORY ROUTES
   ========================= */

/**
 * @swagger
 * /api/stories:
 *   post:
 *     summary: Add a new story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - media
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Story added successfully
 */
router.post(
  "/",
  protect,
  upload.single("media"),
  addStory
);

/**
 * @swagger
 * /api/stories/feed:
 *   get:
 *     summary: Get active stories from self and followed users
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active stories fetched successfully
 */
router.get("/feed", protect, getFeedStories);

/**
 * @swagger
 * /api/stories/{storyId}/view:
 *   post:
 *     summary: View a story (tracks viewer)
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Story viewed successfully
 */
router.post("/:storyId/view", protect, viewStory);

export default router;
