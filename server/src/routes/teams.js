import { Router } from 'express';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const teams = await Team.find({ 'members.user': req.user.sub }).populate('members.user', 'username email');
  res.json({ teams });
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: 'Team-Name ist Pflicht' });
  }

  const team = await Team.create({
    name,
    createdBy: req.user.sub,
    members: [{ user: req.user.sub, role: 'owner' }]
  });

  res.status(201).json({ team });
});

router.post('/:id/members', async (req, res) => {
  const { email, role = 'viewer' } = req.body;
  const team = await Team.findById(req.params.id);
  if (!team) {
    return res.status(404).json({ message: 'Team nicht gefunden' });
  }

  const me = team.members.find((m) => String(m.user) === req.user.sub);
  if (!me || !['owner', 'editor'].includes(me.role)) {
    return res.status(403).json({ message: 'Keine Berechtigung' });
  }

  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: 'Benutzer nicht gefunden' });
  }

  const exists = team.members.some((m) => String(m.user) === String(user._id));
  if (!exists) {
    team.members.push({ user: user._id, role });
    await team.save();
  }

  const populated = await Team.findById(req.params.id).populate('members.user', 'username email');
  return res.json({ team: populated });
});

router.patch('/:id/members/:memberId', async (req, res) => {
  const { role } = req.body;
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team nicht gefunden' });

  const me = team.members.find((m) => String(m.user) === req.user.sub);
  if (!me || me.role !== 'owner') {
    return res.status(403).json({ message: 'Nur Owner darf Rollen ändern' });
  }

  const member = team.members.find((m) => String(m.user) === req.params.memberId);
  if (!member) return res.status(404).json({ message: 'Mitglied nicht gefunden' });

  member.role = role;
  await team.save();
  const populated = await Team.findById(req.params.id).populate('members.user', 'username email');
  return res.json({ team: populated });
});

export default router;
