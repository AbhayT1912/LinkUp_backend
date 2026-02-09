import Post from "../models/Post.js";
import asyncHandler from "../utils/asyncHandler.js";
import Notification from "../models/Notification.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import { emitNotification } from "../socket.js";

/* =========================
   CREATE POST
   ========================= */
export const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;

  if (!caption && (!req.files || !req.files.length)) {
  res.status(400);
  throw new Error("Post must contain text or media");
}


  const mediaUploads = req.files
  ? await Promise.all(
      req.files.map(file =>
        uploadToCloudinary(file, "linkup/posts").then(r => r.secure_url)
      )
    )
  : [];


  const postType =
  mediaUploads.length > 0 ? "image" : "text";

const post = await Post.create({
  user: req.user._id,
  caption,
  type: postType,
  media: mediaUploads,
});


  res.status(201).json({
    success: true,
    message: "Post created successfully",
    post,
  });
});


/* =========================
   GET FEED POSTS
   ========================= */
/* =========================
   GET FEED POSTS (PAGINATED)
   ========================= */
/* =========================
   GET FEED POSTS (FOLLOWING ONLY)
   ========================= */
export const getFeedPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const currentUser = req.user;

  const following = Array.isArray(currentUser.following)
    ? currentUser.following
    : [];

  const feedUserIds = [currentUser._id, ...following];

  const totalPosts = await Post.countDocuments({
    user: { $in: feedUserIds },
  });

  const posts = await Post.find({
    user: { $in: feedUserIds },
  })
    .populate("user", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // ✅ ADD currentUserId for frontend
  const enrichedPosts = posts.map((post) => ({
    ...post,
    currentUserId: currentUser._id.toString(),
  }));

  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(totalPosts / limit),
    totalPosts,
    count: enrichedPosts.length,
    posts: enrichedPosts,
  });
});




/* =========================
   GET POSTS BY USER
   ========================= */
export const getPostsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

 const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const skip = (page - 1) * limit;

const posts = await Post.find({ user: userId })
  .populate("user", "username avatar")
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);


  res.status(200).json({
    success: true,
    count: posts.length,
    posts,
  });
});


/* =========================
   ADD COMMENT
   ========================= */
export const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  post.comments.push({
    user: req.user._id,
    text,
  });

  await post.save();

  if (post.user.toString() !== req.user._id.toString()) {
  await Notification.create({
    recipient: post.user,
    actor: req.user._id,
    type: "comment",
    post: post._id,
  });
}
if (post.user.toString() !== req.user._id.toString()) {
  emitNotification(post.user, {
    type: "comment",
    postId: post._id,
    actor: {
      id: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
    },
  });
}



  res.status(201).json({
    success: true,
    message: "Comment added",
    commentsCount: post.comments.length,
  });
});


/* =========================
   GET COMMENTS
   ========================= */
/* =========================
   GET COMMENTS (PAGINATED)
   ========================= */
export const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const post = await Post.findById(postId)
    .populate("comments.user", "username avatar")
    .select("comments");

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const totalComments = post.comments.length;

  const comments = [...post.comments]
  .sort((a, b) => b.createdAt - a.createdAt)
  .slice(skip, skip + limit);


  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(totalComments / limit),
    totalComments,
    count: comments.length,
    comments,
  });
});



/* =========================
   DELETE COMMENT
   ========================= */
export const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user._id.toString();

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = post.comments.id(commentId);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (comment.user.toString() !== userId) {
    res.status(403);
    throw new Error("You can delete only your own comments");
  }

  comment.remove();
  await post.save();

  res.status(200).json({
    success: true,
    message: "Comment deleted",
  });
});



/* =========================
   LIKE / UNLIKE POST
   ========================= */
export const toggleLikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id.toString();

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const isLiked = post.likes.some(
  id => id.toString() === userId
);


  if (isLiked) {
    post.likes = post.likes.filter(
      (id) => id.toString() !== userId
    );
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();

  // 🔔 Like notification (ONLY on like)
  if (!isLiked && post.user.toString() !== userId) {
    await Notification.create({
      recipient: post.user,
      actor: userId,
      type: "like",
      post: post._id,
    });
  }

  if (!isLiked && post.user.toString() !== userId) {
  emitNotification(post.user, {
    type: "like",
    postId: post._id,
    actor: {
      id: userId,
      username: req.user.username,
      avatar: req.user.avatar,
    },
  });
}



  res.status(200).json({
    success: true,
    message: isLiked ? "Post unliked" : "Post liked",
    likesCount: post.likes.length,
     liked: !isLiked, 
  });
});

