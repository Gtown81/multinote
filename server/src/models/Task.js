import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignee: { type: String, trim: true, maxlength: 80 }
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
