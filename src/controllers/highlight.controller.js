import Highlight from "../models/Highlight.js";
import Story from "../models/Story.js";
import asyncHandler from "../utils/asyncHandler.js";

/* =========================
   CREATE HIGHLIGHT
   ========================= */
export const createHighlight = asyncHandler(async (req, res) => {
  const { title, cover } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Highlight title is required");
  }

  const highlight = await Highlight.create({
    user: req.user._id,
    title,
    cover,
  });

  res.status(201).json({
    success: true,
    message: "Highlight created",
    highlight,
  });
});

/* =========================
   ADD STORY TO HIGHLIGHT
   ========================= */
export const addStoryToHighlight = asyncHandler(async (req, res) => {
  const { highlightId, storyId } = req.params;

  const highlight = await Highlight.findById(highlightId);

  if (!highlight) {
    res.status(404);
    throw new Error("Highlight not found");
  }

  if (highlight.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not allowed");
  }

  const story = await Story.findById(storyId);

  if (!story) {
    res.status(404);
    throw new Error("Story not found");
  }

  highlight.stories.push({
    media: story.media,
  });

  await highlight.save();

  res.status(200).json({
    success: true,
    message: "Story added to highlight",
  });
});

/* =========================
   GET USER HIGHLIGHTS
   ========================= */
export const getUserHighlights = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const highlights = await Highlight.find({ user: userId });

  res.status(200).json({
    success: true,
    count: highlights.length,
    highlights,
  });
});
