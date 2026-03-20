import { Router } from 'express';
import { Artist } from '../models/Artist.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const artists = await Artist.find({ owner: req.user.sub }).sort({ createdAt: -1 });
  res.json({ artists });
});

router.post('/', async (req, res) => {
  const { name, profile = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name ist Pflicht' });
  const artist = await Artist.create({ owner: req.user.sub, name, profile });
  res.status(201).json({ artist });
});

router.put('/:id', async (req, res) => {
  const artist = await Artist.findOneAndUpdate({ _id: req.params.id, owner: req.user.sub }, { $set: req.body }, { new: true });
  if (!artist) return res.status(404).json({ message: 'Künstler nicht gefunden' });
  res.json({ artist });
});

export default router;
