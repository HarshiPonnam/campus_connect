// server/controllers/report.controller.js
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { Report } from "../models/Report.js";

/**
 * Report a post
 * POST /api/reports/post/:postId
 * Body: { reason? }
 */
// server/controllers/report.controller.js
export async function reportPost(req, res, next) {
  try {
    const { postId } = req.params;
    const { reason } = req.body || {};
    const reporter = req.user;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ ok: false, error: "Post not found" });
    }

    const reportedUser = await User.findById(post.author);

    const report = await Report.create({
      type: "post",
      post: post._id,
      commentId: null,
      reportedUser: reportedUser ? reportedUser._id : null,
      reportedBy: reporter._id,
      reason: reason || "",
      status: "pending",
    });

    // New: auto-block the reported user for the reporter
    if (reportedUser) {
      await User.findByIdAndUpdate(reporter._id, {
        $addToSet: { blockedUsers: reportedUser._id },
      });
    }

    return res.status(201).json({
      ok: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Report a comment on a post
 * POST /api/reports/post/:postId/comment/:commentId
 * Body: { reason? }
 */
export async function reportComment(req, res, next) {
  try {
    const { postId, commentId } = req.params;
    const { reason } = req.body || {};
    const reporter = req.user;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ ok: false, error: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ ok: false, error: "Comment not found" });
    }

    const reportedUser = await User.findById(comment.user);

    const report = await Report.create({
      type: "comment",
      post: post._id,
      commentId: comment._id,
      reportedUser: reportedUser ? reportedUser._id : null,
      reportedBy: reporter._id,
      reason: reason || "",
      status: "pending",
    });

    return res.status(201).json({
      ok: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all reports created by the current logged-in user
 * GET /api/reports/mine
 */
export async function getMyReports(req, res, next) {
  try {
    const userId = req.user._id;

    const reports = await Report.find({ reportedBy: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      ok: true,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
}