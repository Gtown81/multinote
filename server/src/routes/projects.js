import { Router } from 'express';
import { Project } from '../models/Project.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const projects = await Project.find({ owner: req.user.sub }).sort({ createdAt: -1 });
  res.json({ projects });
});

router.post('/', async (req, res) => {
  const { name, description = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name ist Pflicht' });
  const project = await Project.create({ owner: req.user.sub, name, description });
  res.status(201).json({ project });
});

router.put('/:id', async (req, res) => {
  const project = await Project.findOneAndUpdate({ _id: req.params.id, owner: req.user.sub }, { $set: req.body }, { new: true });
  if (!project) return res.status(404).json({ message: 'Projekt nicht gefunden' });
  res.json({ project });
});

export default router;
