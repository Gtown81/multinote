import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function sign(user) {
  return jwt.sign({ sub: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email und password sind Pflichtfelder' });
  }

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (existing) {
    return res.status(409).json({ message: 'User existiert bereits' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, passwordHash });
  const token = sign(user);
  return res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: 'Ungültige Zugangsdaten' });
  }

  const ok = await bcrypt.compare(password || '', user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Ungültige Zugangsdaten' });
  }

  const token = sign(user);
  return res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.sub).select('_id username email createdAt');
  return res.json({ user });
});

export default router;
