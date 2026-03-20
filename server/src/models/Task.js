import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    category: { type: String, default: '', trim: true, maxlength: 80 },
    project: { type: String, default: '', trim: true, maxlength: 120 },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignee: { type: String, trim: true, maxlength: 80 }
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
