import Story from "../models/Story.js";
import Notification from "../models/Notification.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { emitNotification } from "../socket.js";

export const addStory = asyncHandler(async (req, res) => {
  console.log("=== ADD STORY ENDPOINT HIT ===");
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);
  
  const { text, bgColor } = req.body;

  let mediaUrl = null;
  let type = "text";

  // Handle image upload
  if (req.file) {
    console.log("📸 Image file detected:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    });

    try {
      const uploaded = await uploadToCloudinary(
        req.file,
        "linkup/stories"
      );
      mediaUrl = uploaded.secure_url;
      type = "image";
      console.log("✅ Image uploaded to Cloudinary:", mediaUrl);
    } catch (uploadError) {
      console.error("❌ Cloudinary upload failed:", uploadError);
      res.status(500);
      throw new Error("Failed to upload image: " + uploadError.message);
    }
  } else {
    console.log("📝 No image file - creating text story");
  }

  // Validation
  if (!text && !mediaUrl) {
    console.log("❌ Validation failed: No text or image");
    res.status(400);
    throw new Error("Story must have text or image");
  }

  // Create story object
  const storyData = {
    user: req.user._id,
    type: type,
    text: text || undefined,
    bgColor: mediaUrl ? undefined : (bgColor || "#8B5CF6"),
    media: mediaUrl || undefined,
  };

  console.log("💾 Creating story with data:", storyData);

  const story = await Story.create(storyData);

  // Populate user data for response
  await story.populate("user", "username avatar");

  console.log("✅ Story created successfully:", story._id);

  res.status(201).json({ success: true, story });
});

export const getFeedStories = asyncHandler(async (req, res) => {
  const feedUserIds = [req.user._id, ...req.user.following];

  const stories = await Story.find({
    user: { $in: feedUserIds },
    expiresAt: { $gt: new Date() },
  })
    .populate("user", "username avatar")
    .sort({ createdAt: -1 });

  res.json({ success: true, stories });
});

export const viewStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  const story = await Story.findById(storyId);
  if (!story) throw new Error("Story not found");

  if (!story.viewers.some(v => v.equals(userId))) {
    story.viewers.push(userId);
    await story.save();
  }

  if (!story.user.equals(userId)) {
    await Notification.create({
      recipient: story.user,
      actor: userId,
      type: "story_view",
      story: story._id,
    });

    emitNotification(story.user, {
      type: "story_view",
      storyId: story._id,
      actor: {
        id: userId,
        username: req.user.username,
        avatar: req.user.avatar,
      },
    });
  }

  res.json({ success: true });
});