import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./src/models/User.js";

async function deleteUser(username) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const result = await User.findOneAndDelete({ username: username.toLowerCase() });
    
    if (result) {
      console.log(`✅ Deleted user: ${result.username} (${result.email})`);
    } else {
      console.log(`❌ User not found: ${username}`);
    }

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const username = process.argv[2];
if (!username) {
  console.error("Usage: node deleteUser.js <username>");
  process.exit(1);
}

deleteUser(username);
