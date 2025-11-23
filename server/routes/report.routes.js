// server/routes/report.routes.js
import { Router } from "express";
import { reportPost, reportComment } from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Report a post
// POST /api/reports/post/:postId
router.post("/post/:postId", requireAuth, reportPost);

// Report a comment on a post
// POST /api/reports/post/:postId/comment/:commentId
router.post("/post/:postId/comment/:commentId", requireAuth, reportComment);

export default router;