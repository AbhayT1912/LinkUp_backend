import express from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  getMyProfile,
  getUserByUsername,
  followUser,
  unfollowUser,
  getMyFollowers,
  getMyFollowing,
  updateMyProfile,
  searchUsers,
} from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 */
router.get("/me", protect, getMyProfile);
/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/me", protect, updateMyProfile);
/**
 * @swagger
 * /api/users/me/followers:
 *   get:
 *     summary: Get followers of logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Followers list fetched
 */
router.get("/me/followers", protect, getMyFollowers);
/**
 * @swagger
 * /api/users/me/following:
 *   get:
 *     summary: Get users followed by logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Following list fetched
 */
router.get("/me/following", protect, getMyFollowing);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by username
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Username search query
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */
router.get("/search", protect, searchUsers);

/**
 * @swagger
 * /api/users/{userId}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User followed successfully
 */
router.post("/:userId/follow", protect, followUser);
/**
 * @swagger
 * /api/users/{userId}/unfollow:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 */
router.post("/:userId/unfollow", protect, unfollowUser);
/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Get public user profile by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile fetched
 */
router.get("/:username", getUserByUsername);


export default router;
