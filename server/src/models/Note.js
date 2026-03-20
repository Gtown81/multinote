import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 180 },
    mimeType: { type: String, required: true, maxlength: 80 },
    size: { type: Number, required: true, max: 5 * 1024 * 1024 },
    dataBase64: { type: String, required: true }
  },
  { _id: true, timestamps: true }
);

const noteSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    category: { type: String, default: '', trim: true, maxlength: 80 },
    project: { type: String, default: '', trim: true, maxlength: 120 },
    publicInfo: { type: String, default: '', maxlength: 220 },
    encryptedContent: {
      cipherText: { type: String, default: '' },
      iv: { type: String, default: '' },
      salt: { type: String, default: '' },
      algo: { type: String, default: 'AES-GCM' }
    },
    shared: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    attachments: { type: [attachmentSchema], default: [] }
  },
  { timestamps: true }
);

export const Note = mongoose.model('Note', noteSchema);
