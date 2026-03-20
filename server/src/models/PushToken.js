import mongoose from 'mongoose';

const pushTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, default: '' },
      auth: { type: String, default: '' }
    },
    platform: { type: String, enum: ['web', 'android', 'ios'], default: 'web' }
  },
  { timestamps: true }
);

pushTokenSchema.index({ user: 1, endpoint: 1 }, { unique: true });

export const PushToken = mongoose.model('PushToken', pushTokenSchema);
