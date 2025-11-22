// server/routes/post.routes.js
import { Router } from "express";
import {
  createPost,
  getPost,
  getFeed,
  getMyPosts,
  editPost,
  deletePost,
  toggleLike,
  addComment,
  replyToComment,
  deleteComment,
  getTrendingPosts,
} from "../controllers/post.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// feed & mine
router.get("/feed", requireAuth, getFeed);
router.get("/mine", requireAuth, getMyPosts);
router.get("/trending/all", requireAuth, getTrendingPosts);

// post CRUD
router.post("/", requireAuth, createPost);
router.get("/:id", requireAuth, getPost);
router.put("/:id", requireAuth, editPost);
router.delete("/:id", requireAuth, deletePost);

// likes
router.post("/:id/like", requireAuth, toggleLike);

// comments + replies
router.post("/:id/comment", requireAuth, addComment);
router.post(
  "/:postId/comment/:commentId/reply",
  requireAuth,
  replyToComment
);
router.delete(
  "/:postId/comment/:commentId",
  requireAuth,
  deleteComment
);

export default router;