// server/routes/user.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMe,
  updateProfile,
  getSettings,
  updateSettings,
  changePassword,
  getBlockedUsers,
  discoverPeople,
  toggleBlock,
  deleteAccount,
} from "../controllers/user.controller.js";

const router = Router();

// Profile
router.get('/me', requireAuth, getMe);
router.put('/me/profile', requireAuth, updateProfile);

// Settings
router.get('/settings', requireAuth, getSettings);
router.put('/settings/account', requireAuth, updateSettings);
router.post('/settings/password', requireAuth, changePassword);

// Blocked users
router.get('/blocked', requireAuth, getBlockedUsers);
router.post('/:id/block', requireAuth, toggleBlock);

// Discover similar users
router.get('/discover', requireAuth, discoverPeople);

// Delete my account (soft delete)
router.delete('/me', requireAuth, deleteAccount);

export default router;