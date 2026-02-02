import express from "express";
import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================
   CONTROLLER FUNCTIONS
   ========================= */

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, bio, location, tagline, links, username } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, location, tagline, links, username },
      { new: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    console.error("Failed to update profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const getMyFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("followers");
    res.json({ success: true, followers: user.followers });
  } catch (error) {
    console.error("Failed to fetch followers:", error);
    res.status(500).json({ message: "Failed to fetch followers" });
  }
};

const getMyFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("following");
    res.json({ success: true, following: user.following });
  } catch (error) {
    console.error("Failed to fetch following:", error);
    res.status(500).json({ message: "Failed to fetch following" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    }).select("-password").limit(10);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};

const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.following.includes(userId)) {
      currentUser.following.push(userId);
      await currentUser.save();
      await User.findByIdAndUpdate(userId, { $push: { followers: req.user._id } });
    }
    res.json({ success: true, message: "Followed" });
  } catch (error) {
    res.status(500).json({ message: "Follow failed" });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    await currentUser.save();
    await User.findByIdAndUpdate(userId, { $pull: { followers: req.user._id } });
    res.json({ success: true, message: "Unfollowed" });
  } catch (error) {
    res.status(500).json({ message: "Unfollow failed" });
  }
};

const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/* =========================
   AUTHENTICATED USER ROUTES
   ========================= */

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.get("/me/followers", protect, getMyFollowers);
router.get("/me/following", protect, getMyFollowing);
router.get("/search", protect, searchUsers);
router.post("/:userId/follow", protect, followUser);
router.post("/:userId/unfollow", protect, unfollowUser);

/**
 * @swagger
 * /api/users/upload-avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.post("/upload-avatar", async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ message: "Avatar is required" });
    }

    console.log("📸 Uploading avatar...");
    console.log("Avatar data length:", avatar.length);
    
    const avatarUrl = await uploadToCloudinary(avatar, "linkup_avatars");
    console.log("✅ Avatar uploaded to Cloudinary:", avatarUrl);
    
    const userId = req.user?._id || req.body.userId;
    if (!userId) {
      return res.status(401).json({ message: "User ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Avatar upload error:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Avatar upload failed",
      error: error.message,
      details: error.toString()
    });
  }
});

/**
 * @swagger
 * /api/users/upload-cover:
 *   post:
 *     summary: Upload user cover image
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cover image uploaded successfully
 */
router.post("/upload-cover", protect, async (req, res) => {
  try {
    const { coverImage } = req.body;
    if (!coverImage) {
      return res.status(400).json({ message: "Cover image is required" });
    }

    console.log("🖼️  Uploading cover image...");
    const coverUrl = await uploadToCloudinary(coverImage, "linkup_covers");
    console.log("✅ Cover image uploaded to Cloudinary:", coverUrl);
    
    const userId = req.user?._id || req.body.userId;
    if (!userId) {
      return res.status(401).json({ message: "User ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { coverImage: coverUrl },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Cover image uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Cover upload error:", error);
    res.status(500).json({ 
      message: "Cover image upload failed",
      error: error.message 
    });
  }
});

/* =========================
   PUBLIC ROUTES (KEEP LAST)
   ========================= */

router.get("/:username", getUserByUsername);

export default router;
