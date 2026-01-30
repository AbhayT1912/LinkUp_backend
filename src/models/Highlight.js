import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: 30,
    },

    cover: {
      type: String, // image URL
      default: "",
    },

    stories: [
      {
        media: {
          type: String,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Highlight = mongoose.model("Highlight", highlightSchema);
export default Highlight;
