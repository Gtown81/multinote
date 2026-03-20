import { Router } from 'express';
import { Note } from '../models/Note.js';
import { Team } from '../models/Team.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

async function resolveAccessibleTeamIds(userId) {
  const teams = await Team.find({ 'members.user': userId }).select('_id');
  return teams.map((t) => t._id);
}

async function canEditTeam(userId, teamId) {
  if (!teamId) return true;
  const t = await Team.findById(teamId);
  const member = t?.members.find((m) => String(m.user) === userId);
  return Boolean(member && ['owner', 'editor'].includes(member.role));
}

router.get('/', async (req, res) => {
  const teamIds = await resolveAccessibleTeamIds(req.user.sub);
  const notes = await Note.find({
    $or: [{ owner: req.user.sub }, { team: { $in: teamIds } }]
  })
    .populate('statusUpdatedBy', 'username email')
    .populate('projectId', 'name')
    .populate('artistId', 'name')
    .sort({ updatedAt: -1 });
  res.json({ notes });
});

router.post('/', async (req, res) => {
  const { title, publicInfo = '', encryptedContent, shared = false, tags = [], team = null } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ message: 'Titel ist Pflicht' });
  }

  if (!(await canEditTeam(req.user.sub, team))) {
    return res.status(403).json({ message: 'Keine Berechtigung für dieses Team' });
  }

  const effectiveShared = team ? true : shared;
  const note = await Note.create({ owner: req.user.sub, title, publicInfo, encryptedContent, shared: effectiveShared, tags, team, statusUpdatedBy: req.user.sub, statusUpdatedAt: new Date() });
  return res.status(201).json({ note });
});

router.put('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    return res.status(404).json({ message: 'Notiz nicht gefunden' });
  }

  const isOwner = String(note.owner) === req.user.sub;
  let canEdit = isOwner;
  if (!canEdit && note.team) {
    const team = await Team.findById(note.team);
    const member = team?.members.find((m) => String(m.user) === req.user.sub);
    canEdit = Boolean(member && ['owner', 'editor'].includes(member.role));
  }

  if (!canEdit) {
    return res.status(403).json({ message: 'Keine Berechtigung' });
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'team')) {
    if (!(await canEditTeam(req.user.sub, req.body.team))) {
      return res.status(403).json({ message: 'Kein Recht auf Ziel-Team' });
    }
  }


  if (Object.prototype.hasOwnProperty.call(req.body, 'team')) {
    req.body.shared = !!req.body.team;
  }


  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    req.body.statusUpdatedBy = req.user.sub;
    req.body.statusUpdatedAt = new Date();
  }

  Object.assign(note, req.body);
  await note.save();
  return res.json({ note });
});

router.post('/:id/attachments', async (req, res) => {
  const { name, mimeType, dataBase64, size } = req.body;
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: 'Notiz nicht gefunden' });

  if (String(note.owner) !== req.user.sub) {
    return res.status(403).json({ message: 'Nur Owner kann Dateianhänge hinzufügen' });
  }

  if (!name || !mimeType || !dataBase64 || !size) {
    return res.status(400).json({ message: 'Ungültiger Datei-Upload' });
  }

  if (size > 5 * 1024 * 1024) {
    return res.status(400).json({ message: 'Datei zu groß (max 5MB)' });
  }

  note.attachments.push({ name, mimeType, dataBase64, size });
  await note.save();
  return res.status(201).json({ note });
});

router.delete('/:id/attachments/:attachmentId', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: 'Notiz nicht gefunden' });
  if (String(note.owner) !== req.user.sub) {
    return res.status(403).json({ message: 'Nur Owner kann Dateianhänge löschen' });
  }

  note.attachments = note.attachments.filter((a) => String(a._id) !== req.params.attachmentId);
  await note.save();
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
