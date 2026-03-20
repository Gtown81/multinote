import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' }
  },
  { _id: false }
);

const memberKeySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    encryptedKey: { type: String, default: '' }
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [teamMemberSchema], default: [] },
    security: {
      enabled: { type: Boolean, default: false },
      ownerEncryptedTeamPassword: { type: String, default: '' },
      memberEncryptedKeys: { type: [memberKeySchema], default: [] }
    }
  },
  { timestamps: true }
);

teamSchema.index({ 'members.user': 1 });

export const Team = mongoose.model('Team', teamSchema);
