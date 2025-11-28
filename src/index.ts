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

// Homepage
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Oraville AI Backend</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 60px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          max-width: 600px;
          width: 100%;
        }
        h1 {
          font-size: 2.5em;
          color: #333;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .emoji { font-size: 4em; margin-bottom: 20px; }
        p {
          color: #666;
          font-size: 1.2em;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 600;
          margin-bottom: 20px;
        }
        a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 2px solid transparent;
          transition: border-color 0.3s;
        }
        a:hover { border-bottom-color: #667eea; }
        .endpoints {
          margin-top: 30px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 10px;
          text-align: left;
        }
        .endpoints h3 {
          color: #333;
          margin-bottom: 10px;
          font-size: 1.1em;
        }
        .endpoints code {
          display: block;
          background: #e2e8f0;
          padding: 8px 12px;
          border-radius: 5px;
          margin: 5px 0;
          font-size: 0.9em;
          color: #2d3748;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🌟</div>
        <h1>Welcome to Oraville</h1>
        <div class="badge">API Online</div>
        <p>
          Backend server for the Oraville AI Telegram Mini App.<br>
          See <a href="https://github.com/teambuildf/oraville-backend/blob/main/README.md" target="_blank">README</a> for complete API documentation.
        </p>
        <div class="endpoints">
          <h3>Quick Links:</h3>
          <code>GET /health - Health check</code>
          <code>GET /api/content/faq - Public FAQ</code>
          <code>POST /api/auth/telegram - Authentication</code>
        </div>
      </div>
    </body>
    </html>
  `);
});

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
