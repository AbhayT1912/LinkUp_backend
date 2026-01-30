import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

/* =========================
   GET MY NOTIFICATIONS
   ========================= */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,
  })
    .populate("actor", "username avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  });
});

/* =========================
   MARK NOTIFICATION AS READ
   ========================= */
export const markNotificationRead = asyncHandler(
  async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findById(
      notificationId
    );

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    if (
      notification.recipient.toString() !==
      req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Not allowed");
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  }
);
