import { Router } from 'express';
import { Task } from '../models/Task.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const tasks = await Task.find({ owner: req.user.sub }).sort({ completed: 1, createdAt: -1 });
  res.json({ tasks });
});

router.post('/', async (req, res) => {
  const { title, dueDate, priority, assignee } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ message: 'Titel ist Pflicht' });
  }

  const task = await Task.create({ owner: req.user.sub, title, dueDate, priority, assignee });
  return res.status(201).json({ task });
});

router.put('/:id', async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.sub },
    { $set: req.body },
    { new: true }
  );
  if (!task) {
    return res.status(404).json({ message: 'Task nicht gefunden' });
  }
  return res.json({ task });
});

router.delete('/:id', async (req, res) => {
  const deleted = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.sub });
  if (!deleted) {
    return res.status(404).json({ message: 'Task nicht gefunden' });
  }
  return res.status(204).send();
});

export default router;
