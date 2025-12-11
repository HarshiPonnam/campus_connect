// server/models/Notification.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    // Who receives the notification
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who triggered it (liker, commenter, DM sender, etc.)
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Type of notification
    type: {
      type: String,
      enum: ["like", "comment", "reply", "direct_message"],
      required: true,
    },

    // For post-related notifications; null for direct_message
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    // For comment / reply notifications; null otherwise
    commentId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    // For DM notifications; id of the DirectMessage doc
    directMessage: {
      type: Schema.Types.ObjectId,
      ref: "DirectMessage",
      default: null,
    },

    // Human-readable text shown in the UI
    message: {
      type: String,
      required: true,
    },

    // Read/unread flag
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);