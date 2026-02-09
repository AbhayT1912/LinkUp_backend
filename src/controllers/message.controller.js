import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import asyncHandler from "../utils/asyncHandler.js";
import { emitMessageRead } from "../socket.js";
import { emitMessage } from "../socket.js";
import { emitMessageDelete } from "../socket.js";

/* =========================
   SEND MESSAGE
   ========================= */
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, text } = req.body;
  const senderId = req.user._id;

  if (!text) {
    res.status(400);
    throw new Error("Message text is required");
  }

  // Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  // Create message
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    text,
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  // Realtime emit
  emitMessage(receiverId, {
    conversationId: conversation._id,
    message,
  });

  res.status(201).json({
    success: true,
    message,
  });
});

/* =========================
   GET OR CREATE CONVERSATION
   ========================= */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const myUserId = req.user._id;

  // Prevent self-chat
  if (userId.toString() === myUserId.toString()) {
    res.status(400);
    throw new Error("Cannot start conversation with yourself");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [myUserId, userId] },
  })
    .populate("participants", "username avatar")
    .populate("lastMessage");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [myUserId, userId],
    });

    conversation = await conversation.populate(
      "participants",
      "username avatar"
    );
  }

  res.status(200).json({
    success: true,
    conversation,
  });
});



/* =========================
   GET TOTAL UNREAD COUNT
   ========================= */
export const getTotalUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const totalUnread = await Message.countDocuments({
    sender: { $ne: userId },
    seen: false,
  });

  res.status(200).json({
    success: true,
    totalUnread,
  });
});

/* =========================
   GET UNREAD COUNTS (PER CONVERSATION)
   ========================= */

export const getUnreadCounts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get my conversations
  const conversations = await Conversation.find({
    participants: userId,
  }).select("_id participants");

  const results = [];

  for (const convo of conversations) {
    const unreadCount = await Message.countDocuments({
      conversation: convo._id,
      sender: { $ne: userId }, // messages from the other user
      seen: false,
    });

    results.push({
      conversationId: convo._id,
      unreadCount,
    });
  }

  res.status(200).json({
    success: true,
    conversations: results,
  });
});


/* =========================
   UNSEND MESSAGE (DELETE FOR EVERYONE)
   ========================= */
export const unsendMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id.toString();

  const message = await Message.findById(messageId);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  // Only sender can unsend
  if (message.sender.toString() !== userId) {
    res.status(403);
    throw new Error("You can only unsend your own messages");
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.text = ""; // optional safety

  await message.save();

  // 🔔 Realtime emit (optional but recommended)
  emitMessageDelete(message.conversation, {
    messageId,
    conversationId: message.conversation,
  });

  res.status(200).json({
    success: true,
    message: "Message unsent",
  });
});


/* =========================
   GET MY CONVERSATIONS
   ========================= */
export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "username avatar")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "username" },
    })
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    conversations,
  });
});

/* =========================
   GET MESSAGES
   ========================= */
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({
    conversation: conversationId,
  })
    .populate("sender", "username avatar")
    .sort({ createdAt: 1 });

  const formattedMessages = messages.map((msg) => {
    if (msg.isDeleted) {
      return {
        _id: msg._id,
        isDeleted: true,
        deletedAt: msg.deletedAt,
        sender: msg.sender,
        createdAt: msg.createdAt,
      };
    }
    return msg;
  });

  res.status(200).json({
    success: true,
    count: formattedMessages.length,
    messages: formattedMessages,
  });
});
/* =========================
   MARK MESSAGES AS READ
   ========================= */
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      seen: false,
    },
    {
      $set: { seen: true },
    }
  );

  // Find the other participant
  const otherUserId = conversation.participants.find(
    (id) => id.toString() !== userId.toString()
  );

  if (otherUserId) {
    emitMessageRead(otherUserId, {
      conversationId,
      readerId: userId,
    });
  }

  res.status(200).json({
    success: true,
    message: "Messages marked as read",
  });
});
