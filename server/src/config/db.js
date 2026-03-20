import mongoose from 'mongoose';

export async function connectDb(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGODB_URI fehlt. Bitte in server/.env setzen.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB || 'atelier_notes'
  });

  console.log('✅ MongoDB Atlas verbunden');
}
