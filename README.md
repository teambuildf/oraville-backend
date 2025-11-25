# Oraville AI Backend

> **Glow. Earn. Connect. Repeat.** - A sophisticated lifestyle ecosystem delivered as a Telegram Mini App backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

## 🌟 Overview

Oraville AI is a Telegram Mini App backend that encourages users to build positive daily habits through curated tasks, earning "Glow Points" that can be converted into real-world value. The application features:

- **Daily Tasks**: Users complete wellness and lifestyle tasks
- **Face Verification**: Secure presence verification
- **Referral System**: Grow your network and earn bonuses
- **Leaderboards**: Compete with top earners and referrers
- **Point System**: Atomic transaction-based point tracking

## ✨ Features

- ✅ Telegram Web App authentication with initData validation
- ✅ JWT-based session management
- ✅ PostgreSQL database with Prisma ORM
- ✅ Atomic transaction system for points (audit trail)
- ✅ Backblaze B2 integration for avatar uploads with pre-signed URLs
- ✅ Automated daily task creation via cron jobs
- ✅ Real-time leaderboards (weekly referrals & total points)
- ✅ Referral bonus system
- ✅ User streak tracking

## 🛠 Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Telegram initData validation
- **Storage**: Backblaze B2
- **Scheduler**: node-cron

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- Backblaze B2 bucket (for avatar uploads)
- Telegram Bot Token

### Installation

1. **Clone the repository and install dependencies:**

```bash
cd oraville-backend
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/oraville?schema=public"
TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"
JWT_SECRET="your_very_strong_random_secret_string"
B2_APPLICATION_KEY_ID="your_b2_application_key_id"
B2_APPLICATION_KEY="your_b2_application_key"
B2_BUCKET_NAME="oraville-avatars"
B2_REGION="us-west-004"
```

3. **Set up the database:**

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial tasks
npm run prisma:seed
```

4. **Start the development server:**

```bash
npm run dev
```

The server will start on `http://localhost:3000`.

## 📚 API Documentation

### Authentication

#### `POST /api/auth/telegram`
Authenticate user via Telegram or create new account.

**Request:**
```json
{
  "initData": "query_id=...&user=...&hash=...",
  "referralCode": "optional_referral_code"
}
```

**Response:**
```json
{
  "token": "jwt_token"
}
```

### User Profile

#### `GET /api/user/profile`
Get authenticated user's profile (requires JWT).

**Response:**
```json
{
  "firstName": "David",
  "lastName": "Smith",
  "country": "United States",
  "avatarUrl": "https://...",
  "glowPointsTotal": 1250,
  "email": null,
  "phone": null
}
```

#### `PUT /api/user/profile`
Update user profile.

**Request:**
```json
{
  "firstName": "David",
  "lastName": "Smith",
  "country": "Canada"
}
```

#### `GET /api/user/avatar/upload-url?contentType=image/jpeg`
Get pre-signed B2 URL for avatar upload.

#### `POST /api/user/avatar/confirm`
Confirm successful avatar upload.

### Dashboard

#### `GET /api/dashboard`
Get aggregated dashboard data.

**Response:**
```json
{
  "greeting": "Good morning, David",
  "user": {
    "firstName": "David",
    "avatarUrl": "https://..."
  },
  "glowPoints": {
    "total": 1200,
    "nextRewardThreshold": 2000
  },
  "lastActivity": {
    "description": "Daily Check-in",
    "points": 10,
    "timestamp": "2025-11-25T12:00:00Z"
  },
  "topReferrerWeekly": {
    "name": "Jane D."
  }
}
```

### Tasks

#### `GET /api/tasks/daily`
Get daily tasks with completion status.

#### `POST /api/tasks/:taskId/complete`
Mark a task as complete and award points.

#### `POST /api/tasks/verify/facescan`
Verify face scan (MVP: honor system).

#### `GET /api/tasks/current-streak`
Get user's current streak.

### Wallet

#### `GET /api/wallet/transactions?page=1&limit=20`
Get paginated transaction history.

#### `GET /api/wallet/referrals`
Get referral statistics.

**Response:**
```json
{
  "referralCode": "ora.ville/ai/ref?id=abc123",
  "totalReferrals": 42,
  "totalReferralPoints": 2100
}
```

### Leaderboards

#### `GET /api/leaderboard/referrals/weekly`
Get top 5 weekly referrers.

#### `GET /api/leaderboard/ambassadors`
Get top 10 users by total points.

### Content

#### `GET /api/content/faq`
Get FAQ content (no auth required).

## 🗄 Database Schema

### Key Models

- **User**: Stores user profile, referral code, and relationships
- **Task**: Daily tasks with points and actions
- **UserTask**: Tracks task completion per user per day
- **Transaction**: Immutable audit trail for all point changes

See [prisma/schema.prisma](prisma/schema.prisma) for full schema.

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | Yes |
| `JWT_SECRET` | Secret for signing JWTs | Yes |
| `B2_APPLICATION_KEY_ID` | Backblaze B2 application key ID | Yes |
| `B2_APPLICATION_KEY` | Backblaze B2 application key | Yes |
| `B2_BUCKET_NAME` | B2 bucket for avatars | Yes |
| `B2_REGION` | B2 region | Yes |
| `PORT` | Server port (default: 3000) | No |
| `REFERRAL_SIGNUP_BONUS` | Points for new user (default: 25) | No |
| `REFERRAL_REFERRER_BONUS` | Points for referrer (default: 50) | No |

## 🚢 Deployment

### Heroku

1. Create a new Heroku app
2. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:mini`
3. Set environment variables: `heroku config:set TELEGRAM_BOT_TOKEN=...`
4. Deploy: `git push heroku main`

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Configure environment variables in Vercel dashboard
3. Deploy: `vercel --prod`

**Note**: You'll need to provision a PostgreSQL database separately (e.g., Neon, Supabase).

## 🧪 Development

### Useful Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database in Prisma Studio
npm run prisma:studio

# Create a new migration
npm run prisma:migrate
```

### Testing Locally

Use a tool like Postman or curl to test endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Get FAQ (no auth)
curl http://localhost:3000/api/content/faq
```

## 📝 Architecture Notes

### Atomic Transactions
The application **never** directly modifies a user's point balance. All point changes create a `Transaction` record. A user's total balance is calculated by summing their transactions. This provides:
- Complete audit trail
- Easy rollback capabilities
- Transaction history for users

### Cron Jobs
A daily cron job runs at 00:00 UTC to create `UserTask` entries for all users. This ensures every user has fresh tasks each day.

### Security
- Telegram initData is validated using HMAC-SHA256
- JWTs expire after 30 days
- Backblaze B2 pre-signed URLs expire after 1 hour
- Passwords are never stored (Telegram handles auth)

## 📄 License

MIT

---

**Built with ❤️ for Oraville AI**
# oraville-backend
