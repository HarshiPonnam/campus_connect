// server/models/Report.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["post", "comment", "user"],
      required: true,
    },

    // For post reports
    post: { type: Schema.Types.ObjectId, ref: "Post" },

    // For comment reports (embedded comment _id inside the post)
    commentId: { type: Schema.Types.ObjectId },

    // The user who is being reported (post author / comment author)
    reportedUser: { type: Schema.Types.ObjectId, ref: "User" },

    // Who made the report
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Optional reason text
    reason: { type: String, default: "" },

    // Status for future admin review
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);