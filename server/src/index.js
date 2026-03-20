import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.js';
import noteRoutes from './routes/notes.js';
import taskRoutes from './routes/tasks.js';
import todoRoutes from './routes/todos.js';
import teamRoutes from './routes/teams.js';
import pushRoutes from './routes/push.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*'
  })
);
app.use(express.json({ limit: '8mb' }));
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ ok: true, service: 'atelier-notes-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/push', pushRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Serverfehler' });
});

connectDb(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 API läuft auf http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('DB Verbindungsfehler:', error.message);
    process.exit(1);
  });
