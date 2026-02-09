import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    }
  },
  {
    timestamps: true
  }
)

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    caption: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },

    type: {
  type: String,
  enum: ['text', 'image', 'video', 'poll'],
  required: true
},


    media: {
      type: [String],
      default: []
    },

    poll: {
  type: {
    question: String,
    options: [
      {
        text: String,
        votes: { type: Number, default: 0 }
      }
    ],
    totalVotes: { type: Number, default: 0 },
    endsAt: String
  },
  default: null
},


   likes: {
  type: [mongoose.Schema.Types.ObjectId],
  ref: 'User',
  default: [],
}
,

  comments: {
  type: [commentSchema],
  default: []
}

  },
  {
    timestamps: true
  }
)

// ✅ ADD INDEXES PROPERLY
postSchema.index({ user: 1, createdAt: -1 })


const Post = mongoose.model('Post', postSchema)
export default Post
