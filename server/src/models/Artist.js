import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    profile: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Artist = mongoose.model('Artist', artistSchema);
