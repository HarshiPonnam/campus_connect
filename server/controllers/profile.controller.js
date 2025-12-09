import { User } from "../models/User.js";

export async function getMyProfile(req, res) {
  const user = await User.findById(req.user._id).select("-passwordHash -resetCodeHash -resetPasswordToken");
  res.json({ ok: true, data: user });
}

export async function updateMyProfile(req, res) {
  const updates = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true }
  ).select("-passwordHash -resetCodeHash -resetPasswordToken");

  res.json({ ok: true, data: user });
}

// Discover users with similar interests
export async function discoverUsers(req, res) {
  const me = await User.findById(req.user._id);

  const matches = await User.find({
    _id: { $ne: me._id },
    interests: { $in: me.interests },
  }).select("name major department interests bio");

  res.json({ ok: true, data: matches });
}