import { Router } from 'express';
import { Todo } from '../models/Todo.js';
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
  const todos = await Todo.find({ $or: [{ owner: req.user.sub }, { team: { $in: teamIds } }] })
    .populate('statusUpdatedBy', 'username email')
    .populate('projectId', 'name')
    .populate('artistId', 'name')
    .sort({ done: 1, createdAt: -1 });
  res.json({ todos });
});

router.post('/', async (req, res) => {
  const { title, details = '', dueDate, team = null } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: 'Titel ist Pflicht' });

  if (team) {
    const t = await Team.findById(team);
    const member = t?.members.find((m) => String(m.user) === req.user.sub);
    if (!member || !['owner', 'editor'].includes(member.role)) {
      return res.status(403).json({ message: 'Keine Berechtigung für dieses Team' });
    }
  }

  const todo = await Todo.create({ owner: req.user.sub, title, details, dueDate, team, statusUpdatedBy: req.user.sub, statusUpdatedAt: new Date() });
  return res.status(201).json({ todo });
});

router.put('/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).json({ message: 'Todo nicht gefunden' });

  const isOwner = String(todo.owner) === req.user.sub;
  let canEdit = isOwner;
  if (!canEdit && todo.team) {
    const team = await Team.findById(todo.team);
    const member = team?.members.find((m) => String(m.user) === req.user.sub);
    canEdit = Boolean(member && ['owner', 'editor'].includes(member.role));
  }
  if (!canEdit) return res.status(403).json({ message: 'Keine Berechtigung' });

  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    req.body.statusUpdatedBy = req.user.sub;
    req.body.statusUpdatedAt = new Date();
  }

  Object.assign(todo, req.body);
  await todo.save();
  return res.json({ todo });
});

router.delete('/:id', async (req, res) => {
  const deleted = await Todo.findOneAndDelete({ _id: req.params.id, owner: req.user.sub });
  if (!deleted) return res.status(404).json({ message: 'Todo nicht gefunden' });
  return res.status(204).send();
});

export default router;
