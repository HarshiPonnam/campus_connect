// server/models/Notification.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // recipient
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true }, // actor
    type: {
      type: String,
      enum: ["like", "comment", "reply"],
      required: true,
    },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    commentId: { type: Schema.Types.ObjectId }, // for comment/reply
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);