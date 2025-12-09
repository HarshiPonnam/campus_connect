// server/models/User.js
import mongoose from 'mongoose';

const NotificationSettingsSchema = new mongoose.Schema(
  {
    likes: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    replies: { type: Boolean, default: true },
    system: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },

    // Token-based reset (kept in case you want both)
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },

    // Code (OTP) based reset
    resetCodeHash: { type: String, default: null },
    resetCodeExpiresAt: { type: Date, default: null },

    // Rich profile fields
    major: { type: String, default: '', trim: true },
    department: { type: String, default: '', trim: true },
    year: { type: String, default: '', trim: true }, // e.g. "Freshman", "Senior"
    bio: { type: String, default: '', trim: true },
    interests: [{ type: String, trim: true }],

    // Settings for account / notifications
    notificationSettings: {
      type: NotificationSettingsSchema,
      default: () => ({}),
    },

    // For "delete account" (soft delete)
    isDeleted: { type: Boolean, default: false },

    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);