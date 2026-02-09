import express from "express";
import protect from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  createPost,
  getFeedPosts,
  getPostsByUser,
  toggleLikePost,
  addComment,
  getPostComments,
  deleteComment,
} from "../controllers/post.controller.js";

const router = express.Router();

/* =========================
   POST ROUTES
   ========================= */

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Get feed posts from followed users
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feed posts fetched successfully
 */
router.get("/feed", protect, getFeedPosts);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post (text-only or media-based)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post(
  "/",
  protect,
  upload.array("media", 5),
  createPost
);

/**
 * @swagger
 * /api/posts/{postId}/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post like status toggled
 */
router.post("/:postId/like", protect, toggleLikePost);

/**
 * @swagger
 * /api/posts/user/{userId}:
 *   get:
 *     summary: Get posts by a specific user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User posts fetched successfully
 */
router.get("/user/:userId", protect, getPostsByUser);

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post("/:postId/comments", protect, addComment);

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: Get comments of a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comments fetched successfully
 */
router.get("/:postId/comments", getPostComments);

/**
 * @swagger
 * /api/posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment from a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.delete(
  "/:postId/comments/:commentId",
  protect,
  deleteComment
);

export default router;
