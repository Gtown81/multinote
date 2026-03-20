import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    content: { type: String, default: '' },
    shared: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, maxlength: 40 }]
  },
  { timestamps: true }
);

export const Note = mongoose.model('Note', noteSchema);
