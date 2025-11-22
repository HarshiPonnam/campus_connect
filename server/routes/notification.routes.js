// server/routes/notification.routes.js
import { Router } from "express";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getMyNotifications);
router.post("/:id/read", requireAuth, markNotificationRead);
router.post("/read-all", requireAuth, markAllNotificationsRead);

export default router;