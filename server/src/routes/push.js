import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { PushToken } from '../models/PushToken.js';

const router = Router();
router.use(authMiddleware);

router.post('/subscribe', async (req, res) => {
  const { endpoint, keys = {}, platform = 'web' } = req.body;
  if (!endpoint) return res.status(400).json({ message: 'endpoint ist Pflicht' });

  const token = await PushToken.findOneAndUpdate(
    { user: req.user.sub, endpoint },
    { $set: { keys, platform } },
    { upsert: true, new: true }
  );

  res.status(201).json({ subscription: token, message: 'Push-Subscription gespeichert' });
});

router.get('/subscriptions', async (req, res) => {
  const subscriptions = await PushToken.find({ user: req.user.sub });
  res.json({ subscriptions });
});

export default router;
