# Oraville AI Backend - Setup Guide

This guide will help you set up the Oraville AI backend from scratch.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL database server running
- [ ] AWS account with S3 bucket created
- [ ] Telegram Bot Token from [@BotFather](https://t.me/botfather)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages (~273 packages).

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and fill in your actual values:

```env
# Required Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/oraville"

# Required Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"

# Required JWT Secret (generate a random 32+ character string)
JWT_SECRET="your_random_secret_at_least_32_characters_long"

# Required AWS S3 Configuration
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="oraville-avatars"
AWS_REGION="us-east-1"

# Optional Configurations
PORT=3000
NODE_ENV=development
REFERRAL_SIGNUP_BONUS=25
REFERRAL_REFERRER_BONUS=50
```

### 3. Set Up Database

Generate Prisma Client:
```bash
npm run prisma:generate
```

Create database migrations:
```bash
npm run prisma:migrate
```

You'll be asked to name your migration - use something like "init" for the first one.

Seed initial tasks:
```bash
npm run prisma:seed
```

### 4. Verify Setup

Build the TypeScript code:
```bash
npm run build
```

If successful, you'll see compiled JavaScript in the `dist/` folder.

### 5. Start Development Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════╗
║   🌟 Oraville AI Backend Server      ║
╚═══════════════════════════════════════╝

  Environment: development
  Port: 3000
  ...
  Ready to glow! ✨
```

### 6. Test the API

Open another terminal and test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-25T12:00:00.000Z"}
```

Test the FAQ endpoint (no auth required):
```bash
curl http://localhost:3000/api/content/faq
```

## Database Management

### View Data with Prisma Studio
```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` to browse your database.

### Create New Migrations
After modifying `prisma/schema.prisma`:
```bash
npm run prisma:migrate
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
- Verify user has CREATE permissions

### Prisma Errors
- Run `npm run prisma:generate` after any schema changes
- Delete `node_modules/.prisma` and regenerate if corrupted

### AWS S3 Issues
- Verify IAM user has `s3:PutObject` and `s3:GetObject` permissions
- Ensure bucket exists and region is correct
- For testing, you can skip avatar uploads initially

## Next Steps

Once the server is running:

1. **Test Authentication**: You'll need a Telegram Mini App to generate valid `initData`
2. **Deploy to Staging**: Follow deployment guide in main README
3. **Integrate Frontend**: Connect your Telegram Mini App frontend

## Production Considerations

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Use connection pooling for database (e.g., PgBouncer)
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure CORS for your domain
- [ ] Set up regular database backups

## Support

If you encounter issues:
1. Check server logs for error messages
2. Review environment variables
3. Ensure all prerequisites are met
4. Check database connection and migrations
