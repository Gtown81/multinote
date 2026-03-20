import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', projectSchema);
