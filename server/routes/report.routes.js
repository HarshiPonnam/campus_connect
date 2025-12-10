// server/routes/report.routes.js
import { Router } from "express";
import {
  reportPost,
  reportComment,
  getMyReports,   // 👈 new
} from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Report a post
// POST /api/reports/post/:postId
router.post("/post/:postId", requireAuth, reportPost);

// Report a comment on a post
// POST /api/reports/post/:postId/comment/:commentId
router.post("/post/:postId/comment/:commentId", requireAuth, reportComment);

// Get all reports created by the current logged-in user
// GET /api/reports/mine
router.get("/mine", requireAuth, getMyReports);

export default router;