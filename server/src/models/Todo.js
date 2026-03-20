import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    category: { type: String, default: '', trim: true, maxlength: 80 },
    project: { type: String, default: '', trim: true, maxlength: 120 },
    details: { type: String, default: '' },
    done: { type: Boolean, default: false },
    dueDate: { type: Date }
  },
  { timestamps: true }
);

export const Todo = mongoose.model('Todo', todoSchema);
