import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";


/* =========================
   REGISTER USER
   ========================= */
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, name, bio, location, isPrivate, avatar } = req.body;

  console.log("📝 Register request received:", { username, email, name, bio, location });

  if (!username || !email || !password) {
    console.error("❌ Missing required fields:", { username, email, password });
    res.status(400);
    throw new Error("All fields are required");
  }

  // Normalize username and email
  const normalizedUsername = username.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  const emailExists = await User.findOne({ email: normalizedEmail });
  if (emailExists) {
    res.status(400);
    throw new Error("Email is already registered");
  }

  const usernameExists = await User.findOne({ username: normalizedUsername });
  if (usernameExists) {
    res.status(400);
    throw new Error("Username is already taken");
  }

  try {
    const user = await User.create({
      name: name || "",
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      bio: bio || "",
      location: location || "",
      isPrivate: isPrivate || false,
      avatar: avatar || "",
    });

    console.log("✅ User created successfully:", user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });
  } catch (createError) {
    console.error("❌ User creation error:", createError.message);
    if (createError.code === 11000) {
      // MongoDB duplicate key error
      const field = Object.keys(createError.keyPattern)[0];
      res.status(400);
      throw new Error(`${field} already exists`);
    }
    throw createError;
  }
});


/* =========================
   LOGIN USER
   ========================= */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});
