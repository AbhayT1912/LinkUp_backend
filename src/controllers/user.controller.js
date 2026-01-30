import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { emitNotification } from "../socket.js";


export const followUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user._id.toString();

  if (targetUserId === currentUserId) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser) {
    res.status(404);
    throw new Error("User not found");
  }

  if (currentUser.following.includes(targetUserId)) {
    res.status(400);
    throw new Error("Already following this user");
  }

  currentUser.following.push(targetUserId);
  targetUser.followers.push(currentUserId);

  await currentUser.save();
  await targetUser.save();

   await Notification.create({
    recipient: targetUserId,
    actor: currentUserId,
    type: "follow",
  });

  emitNotification(targetUserId, {
  type: "follow",
  actor: {
    id: currentUserId,
    username: req.user.username,
    avatar: req.user.avatar,
  },
});


  res.status(200).json({
    success: true,
    message: "User followed successfully",
  });
});


/* =========================
   SEARCH USERS
   ========================= */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const userId = req.user._id;

  if (!q) {
    return res.status(200).json({
      success: true,
      users: [],
    });
  }

  const users = await User.find({
    username: {
      $regex: q,
      $options: "i", // case-insensitive
    },
    _id: { $ne: userId }, // exclude self
  })
    .select("username avatar bio")
    .limit(10);

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});



/* =========================
   UPDATE MY PROFILE
   ========================= */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    username,
    email,
    bio,
    avatar,
    isPrivate,
    password,
  } = req.body;

  // Check for username/email conflicts (if provided)
  if (username) {
    const usernameTaken = await User.findOne({
      username,
      _id: { $ne: userId },
    });
    if (usernameTaken) {
      res.status(400);
      throw new Error("Username already taken");
    }
  }

  if (email) {
    const emailTaken = await User.findOne({
      email,
      _id: { $ne: userId },
    });
    if (emailTaken) {
      res.status(400);
      throw new Error("Email already in use");
    }
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update only provided fields
  if (username !== undefined) user.username = username;
  if (email !== undefined) user.email = email;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (isPrivate !== undefined) user.isPrivate = isPrivate;
  if (password !== undefined) user.password = password; // auto-hashed by model

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      isPrivate: updatedUser.isPrivate,
    },
  });
});


/* =========================
   GET MY FOLLOWERS
   ========================= */
export const getMyFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("followers", "username avatar bio")
    .select("followers");

  res.status(200).json({
    success: true,
    count: user.followers.length,
    followers: user.followers,
  });
});



/* =========================
   GET MY FOLLOWING
   ========================= */
export const getMyFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("following", "username avatar bio")
    .select("following");

  res.status(200).json({
    success: true,
    count: user.following.length,
    following: user.following,
  });
});



/* =========================
   UNFOLLOW USER
   ========================= */
export const unfollowUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user._id.toString();

  if (targetUserId === currentUserId) {
    res.status(400);
    throw new Error("You cannot unfollow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!currentUser.following.includes(targetUserId)) {
    res.status(400);
    throw new Error("You are not following this user");
  }

  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== targetUserId
  );

  targetUser.followers = targetUser.followers.filter(
    (id) => id.toString() !== currentUserId
  );

  await currentUser.save();
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: "User unfollowed successfully",
  });
});


export const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select(
    "-password"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Basic private account handling (can be expanded later)
  if (user.isPrivate) {
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        isPrivate: true,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/* =========================
   GET CURRENT USER PROFILE
   ========================= */
export const getMyProfile = asyncHandler(async (req, res) => {
  // req.user is already attached by auth middleware
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
