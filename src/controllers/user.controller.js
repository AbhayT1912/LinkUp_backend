import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { emitNotification } from "../socket.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================
   FOLLOW USER
   ========================= */
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

  const alreadyFollowing = currentUser.following.some(
  (id) => id.toString() === targetUserId
);

if (alreadyFollowing) {
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
      _id: req.user._id,
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

  let query = {
    _id: { $ne: userId },
  };

  if (q && q.trim() !== "") {
    query.$or = [
      { username: { $regex: q, $options: "i" } },
      { name: { $regex: q, $options: "i" } },
      { bio: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("username name avatar bio tagline location")
    .limit(20);

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
    name,
    username,
    email,
    bio,
    avatar,
    isPrivate,
    password,
    tagline,
    location,
    links,
    coverImage,
  } = req.body;

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

  if (name !== undefined) user.name = name;
  if (username !== undefined) user.username = username;
  if (email !== undefined) user.email = email;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (tagline !== undefined) user.tagline = tagline;
  if (location !== undefined) user.location = location;
  if (links !== undefined) user.links = links;
  if (coverImage !== undefined) user.coverImage = coverImage;
  if (isPrivate !== undefined) user.isPrivate = isPrivate;
  if (password !== undefined) user.password = password;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      name: updatedUser.name,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      tagline: updatedUser.tagline,
      location: updatedUser.location,
      links: updatedUser.links,
      coverImage: updatedUser.coverImage,
      isPrivate: updatedUser.isPrivate,
      followers: updatedUser.followers,
      following: updatedUser.following,
      createdAt: updatedUser.createdAt,
    },
  });
});

/* =========================
   GET MY FOLLOWERS
   ========================= */
export const getMyFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("followers", "username name avatar bio location");

  res.status(200).json({
    success: true,
    users: user.followers,
    count: user.followers.length,
  });
});

/* =========================
   GET MY FOLLOWING
   ========================= */
export const getMyFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("following", "username name avatar bio location");

  res.status(200).json({
    success: true,
    users: user.following,   // 🔥 IMPORTANT
    count: user.following.length,
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

/* =========================
   GET USER BY USERNAME
   ========================= */
export const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

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
        name: user.name,
        tagline: user.tagline,
        location: user.location,
        links: user.links,
      },
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/* =========================
   UPLOAD AVATAR
   ========================= */
export const uploadAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  if (!avatar) {
    res.status(400);
    throw new Error("No avatar image provided");
  }

  const result = await cloudinary.uploader.upload(avatar, {
    folder: "avatars",
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { avatar: result.secure_url },
    { new: true }
  );

  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});

/* =========================
   GET MY PROFILE
   ========================= */
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.status(200).json({
    success: true,
    user,
  });
});
