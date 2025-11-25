import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { startDailyTasksJob } from './jobs/dailyTasks';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import dashboardRoutes from './routes/dashboard';
import tasksRoutes from './routes/tasks';
import walletRoutes from './routes/wallet';
import leaderboardRoutes from './routes/leaderboard';
import contentRoutes from './routes/content';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/content', contentRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🌟 Oraville AI Backend Server      ║
╚═══════════════════════════════════════╝

  Environment: ${process.env.NODE_ENV || 'development'}
  Port: ${PORT}
  
  API Endpoints:
  ├─ POST   /api/auth/telegram
  ├─ GET    /api/user/profile
  ├─ PUT    /api/user/profile
  ├─ GET    /api/user/avatar/upload-url
  ├─ POST   /api/user/avatar/confirm
  ├─ GET    /api/dashboard
  ├─ GET    /api/tasks/daily
  ├─ POST   /api/tasks/:taskId/complete
  ├─ POST   /api/tasks/verify/facescan
  ├─ GET    /api/tasks/current-streak
  ├─ GET    /api/wallet/transactions
  ├─ GET    /api/wallet/referrals
  ├─ GET    /api/leaderboard/referrals/weekly
  ├─ GET    /api/leaderboard/ambassadors
  └─ GET    /api/content/faq

  Health Check: GET /health
  
  Ready to glow! ✨
  `);
  
  // Start cron jobs
  startDailyTasksJob();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
