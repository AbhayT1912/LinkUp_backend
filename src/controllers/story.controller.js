import Story from "../models/Story.js";
import Notification from "../models/Notification.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { emitNotification } from "../socket.js";

/* =========================
   ADD STORY
   ========================= */
export const addStory = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Story media is required");
  }

  const uploaded = await uploadToCloudinary(
    req.file,
    "linkup/stories"
  );

  const story = await Story.create({
    user: req.user._id,
    media: uploaded.secure_url,
  });

  res.status(201).json({
    success: true,
    message: "Story added",
    story,
  });
});

/* =========================
   GET ACTIVE STORIES (FEED)
   ========================= */
export const getFeedStories = asyncHandler(async (req, res) => {
  const feedUserIds = [
    req.user._id,
    ...req.user.following,
  ];

  const stories = await Story.find({
    user: { $in: feedUserIds },
    expiresAt: { $gt: new Date() },
  })
    .populate("user", "username avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: stories.length,
    stories,
  });
});

/* =========================
   VIEW STORY (TRACK VIEWER)
   ========================= */
export const viewStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id.toString();

  const story = await Story.findById(storyId);

  if (!story) {
    res.status(404);
    throw new Error("Story not found");
  }

  if (!story.viewers.includes(userId)) {
    story.viewers.push(userId);
    await story.save();
  }

  // 🔔 Story view notification
  if (story.user.toString() !== userId) {
    await Notification.create({
      recipient: story.user,
      actor: userId,
      type: "story_view",
      story: story._id,
    });
  }

  emitNotification(story.user, {
  type: "story_view",
  storyId: story._id,
  actor: {
    id: userId,
    username: req.user.username,
    avatar: req.user.avatar,
  },
});


  res.status(200).json({
    success: true,
    message: "Story viewed",
  });
});
