import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },

    text: {
      type: String,
      maxlength: 300,
    },

    bgColor: {
      type: String,
      default: "#8B5CF6",
    },

    media: {
      type: String,
    },

    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
