// server/controllers/user.controller.js
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';

/**
 * GET /api/users/me
 * Return current user's profile + simple stats
 */
export async function getMe(req, res, next) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const myPosts = await Post.find({ author: userId }, 'likes comments').lean();
    const postsCount = myPosts.length;

    let likesReceivedCount = 0;
    let commentsReceivedCount = 0;
    for (const p of myPosts) {
      likesReceivedCount += Array.isArray(p.likes) ? p.likes.length : 0;
      commentsReceivedCount += Array.isArray(p.comments) ? p.comments.length : 0;
    }

    const likesGivenCount = await Post.countDocuments({ likes: userId });

    const profile = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,

      major: user.major || '',
      department: user.department || '',
      year: user.year || '',
      bio: user.bio || '',
      interests: Array.isArray(user.interests) ? user.interests : [],

      notificationSettings: user.notificationSettings || {
        likes: true,
        comments: true,
        replies: true,
        system: true,
      },

      postsCount,
      likesGivenCount,
      likesReceivedCount,
      commentsReceivedCount,
    };

    return res.json({ ok: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/me/profile
 * Update rich profile fields (major, dept, year, bio, interests)
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user._id;
    const {
      major,
      department,
      year,
      bio,
      interests,
    } = req.body || {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    if (typeof major === 'string') user.major = major.trim();
    if (typeof department === 'string') user.department = department.trim();
    if (typeof year === 'string') user.year = year.trim();
    if (typeof bio === 'string') user.bio = bio.trim();

    if (Array.isArray(interests)) {
      user.interests = interests
        .map(s => String(s).trim())
        .filter(Boolean);
    } else if (typeof interests === 'string') {
      user.interests = interests
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    await user.save();

    const profile = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      major: user.major || '',
      department: user.department || '',
      year: user.year || '',
      bio: user.bio || '',
      interests: Array.isArray(user.interests) ? user.interests : [],
      notificationSettings: user.notificationSettings || {
        likes: true,
        comments: true,
        replies: true,
        system: true,
      },
    };

    return res.json({ ok: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/settings
 * Basic account + settings info for Settings page
 */
export async function getSettings(req, res, next) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.json({
      ok: true,
      data: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        notificationSettings: user.notificationSettings || {
          likes: true,
          comments: true,
          replies: true,
          system: true,
        },
        createdAt: user.createdAt,
        isDeleted: !!user.isDeleted,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/settings/account
 * Update basic account data (name) + notification preferences
 */
export async function updateSettings(req, res, next) {
  try {
    const userId = req.user._id;
    const { name, notificationSettings } = req.body || {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (notificationSettings && typeof notificationSettings === 'object') {
      user.notificationSettings = {
        likes: notificationSettings.likes ?? user.notificationSettings.likes ?? true,
        comments: notificationSettings.comments ?? user.notificationSettings.comments ?? true,
        replies: notificationSettings.replies ?? user.notificationSettings.replies ?? true,
        system: notificationSettings.system ?? user.notificationSettings.system ?? true,
      };
    }

    await user.save();

    return res.json({
      ok: true,
      data: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        notificationSettings: user.notificationSettings,
        createdAt: user.createdAt,
        isDeleted: !!user.isDeleted,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/users/settings/password
 * Change password using currentPassword + newPassword
 */
export async function changePassword(req, res, next) {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ ok: false, error: 'currentPassword and newPassword are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ ok: false, error: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ ok: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/blocked
 * List users I have blocked
 */
export async function getBlockedUsers(req, res, next) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('blockedUsers', 'name email major department year').lean();

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const blockedUsers = Array.isArray(user.blockedUsers)
      ? user.blockedUsers.map(u => ({
          id: String(u._id),
          name: u.name,
          email: u.email,
          major: u.major || '',
          department: u.department || '',
          year: u.year || '',
        }))
      : [];

    return res.json({ ok: true, data: blockedUsers });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/discover
 * Find similar people: same major/department + overlapping interests.
 */
export async function discoverPeople(req, res, next) {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId).lean();

    if (!currentUser) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const blockedIds = Array.isArray(currentUser.blockedUsers)
      ? currentUser.blockedUsers.map(id => String(id))
      : [];

    const others = await User.find({
      _id: { $ne: currentUserId },
      isDeleted: { $ne: true },
    }).lean();

    const myMajor = (currentUser.major || '').toLowerCase();
    const myDept = (currentUser.department || '').toLowerCase();
    const myInterests = new Set(
      Array.isArray(currentUser.interests)
        ? currentUser.interests.map(i => i.toLowerCase().trim()).filter(Boolean)
        : []
    );

    const scored = [];

    for (const u of others) {
      const uid = String(u._id);
      if (blockedIds.includes(uid)) continue;

      let score = 0;

      if (myMajor && u.major && myMajor === String(u.major).toLowerCase()) {
        score += 3;
      }
      if (myDept && u.department && myDept === String(u.department).toLowerCase()) {
        score += 2;
      }

      let overlapCount = 0;
      if (Array.isArray(u.interests)) {
        for (const it of u.interests) {
          const normalized = String(it).toLowerCase().trim();
          if (normalized && myInterests.has(normalized)) {
            overlapCount += 1;
          }
        }
      }
      score += overlapCount;

      if (score === 0) continue;

      scored.push({
        id: uid,
        name: u.name,
        email: u.email,
        major: u.major || '',
        department: u.department || '',
        year: u.year || '',
        bio: u.bio || '',
        interests: Array.isArray(u.interests) ? u.interests : [],
        score,
      });
    }

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });

    const limited = scored.slice(0, 50);

    return res.json({ ok: true, data: limited });
  } catch (err) {
    next(err);
  }
}

/**
 * Block / unblock a user
 * POST /api/users/:id/block
 */
export async function toggleBlock(req, res, next) {
  try {
    const blockingUserId = req.user.id;
    const blockingUser = await User.findById(blockingUserId);
    const blockedUserId = req.params.id;

    if (String(blockingUserId) === String(blockedUserId))
      return res.status(400).json({
        ok: false,
        error: "A user may not block themself",
      });

    const blockedUser = await User.findById(blockedUserId);
    if (!blockedUser)
      return res.status(404).json({ ok: false, error: "user does not exist" });

    if (!Array.isArray(blockingUser.blockedUsers))
      blockingUser.blockedUsers = [];

    const alreadyIndex = blockingUser.blockedUsers.findIndex(
      (id) => String(id) === String(blockedUserId)
    );

    let blocked;
    if (alreadyIndex === -1) {
      blockingUser.blockedUsers.push(blockedUserId);
      blocked = true;
    } else {
      blockingUser.blockedUsers.splice(alreadyIndex, 1);
      blocked = false;
    }

    await blockingUser.save();

    return res.json({
      ok: true,
      data: {
        blocked,
        blockedUserId,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/users/me
 * Soft delete account (isDeleted = true)
 */
export async function deleteAccount(req, res, next) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    user.isDeleted = true;
    await user.save();

    // You can also later add cleanup: remove tokens, anonymize posts, etc.
    return res.json({ ok: true, message: 'Account has been deactivated.' });
  } catch (err) {
    next(err);
  }
}