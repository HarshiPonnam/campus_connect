// server/models/Post.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const replySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true } // each reply has its own _id
);

const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    text: { type: String, required: true },
    replies: [replySchema],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true } // each comment has its own _id
);

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },

    title: { type: String, required: true },
    body: { type: String, required: true },

    edited: { type: Boolean, default: false },

    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    tags: [String],
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);