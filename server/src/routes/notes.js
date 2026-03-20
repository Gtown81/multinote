import { Router } from 'express';
import { Note } from '../models/Note.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const notes = await Note.find({ owner: req.user.sub }).sort({ updatedAt: -1 });
  res.json({ notes });
});

router.post('/', async (req, res) => {
  const { title, content = '', shared = false, tags = [] } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ message: 'Titel ist Pflicht' });
  }

  const note = await Note.create({ owner: req.user.sub, title, content, shared, tags });
  return res.status(201).json({ note });
});

router.put('/:id', async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.sub },
    { $set: req.body },
    { new: true }
  );

  if (!note) {
    return res.status(404).json({ message: 'Notiz nicht gefunden' });
  }

  return res.json({ note });
});

router.delete('/:id', async (req, res) => {
  const deleted = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.sub });
  if (!deleted) {
    return res.status(404).json({ message: 'Notiz nicht gefunden' });
  }
  return res.status(204).send();
});

export default router;
