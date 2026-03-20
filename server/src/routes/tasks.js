import { Router } from 'express';
import { Task } from '../models/Task.js';
import { Team } from '../models/Team.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

async function teamIdsForUser(userId) {
  const teams = await Team.find({ 'members.user': userId }).select('_id');
  return teams.map((t) => t._id);
}

router.get('/', async (req, res) => {
  const teamIds = await teamIdsForUser(req.user.sub);
  const tasks = await Task.find({ $or: [{ owner: req.user.sub }, { team: { $in: teamIds } }] })
    .populate('statusUpdatedBy', 'username email')
    .populate('projectId', 'name')
    .populate('artistId', 'name')
    .sort({ completed: 1, createdAt: -1 });
  res.json({ tasks });
});

router.post('/', async (req, res) => {
  const { title, dueDate, priority, assignee, team = null, description = '' } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ message: 'Titel ist Pflicht' });
  }

  if (team) {
    const t = await Team.findById(team);
    const member = t?.members.find((m) => String(m.user) === req.user.sub);
    if (!member || !['owner', 'editor'].includes(member.role)) {
      return res.status(403).json({ message: 'Keine Berechtigung für dieses Team' });
    }
  }

  const task = await Task.create({ owner: req.user.sub, title, dueDate, priority, assignee, team, description, statusUpdatedBy: req.user.sub, statusUpdatedAt: new Date() });
  return res.status(201).json({ task });
});

router.put('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task nicht gefunden' });
  }

  const isOwner = String(task.owner) === req.user.sub;
  let canEdit = isOwner;
  if (!canEdit && task.team) {
    const team = await Team.findById(task.team);
    const member = team?.members.find((m) => String(m.user) === req.user.sub);
    canEdit = Boolean(member && ['owner', 'editor'].includes(member.role));
  }

  if (!canEdit) return res.status(403).json({ message: 'Keine Berechtigung' });

  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    req.body.statusUpdatedBy = req.user.sub;
    req.body.statusUpdatedAt = new Date();
  }

  Object.assign(task, req.body);
  await task.save();
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
