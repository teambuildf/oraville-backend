import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { validateTelegramInitData, parseTelegramUser } from '../utils/telegram';
import { generateToken } from '../utils/jwt';
import { createTransaction } from '../services/transactionService';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const REFERRAL_SIGNUP_BONUS = parseInt(process.env.REFERRAL_SIGNUP_BONUS || '25');
const REFERRAL_REFERRER_BONUS = parseInt(process.env.REFERRAL_REFERRER_BONUS || '50');

/**
 * POST /api/auth/telegram
 * Authenticate user via Telegram initData or create new user
 */
export async function authenticateTelegram(req: Request, res: Response): Promise<void> {
  try {
    const { initData, referralCode } = req.body;
    
    if (!initData) {
      res.status(400).json({ error: 'initData is required' });
      return;
    }
    
    // Validate Telegram data
    const isValid = validateTelegramInitData(initData, TELEGRAM_BOT_TOKEN);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid Telegram data' });
      return;
    }
    
    // Parse user information
    const telegramUser = parseTelegramUser(initData);
    if (!telegramUser) {
      res.status(400).json({ error: 'Could not parse user data' });
      return;
    }
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramUser.id) },
    });
    
    if (!user) {
      // Create new user
      const userData: any = {
        telegramId: BigInt(telegramUser.id),
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
      };
      
      // Process referral code if provided
      if (referralCode) {
        const referrer = await prisma.user.findUnique({
          where: { referralCode },
        });
        
        if (referrer) {
          userData.referredById = referrer.id;
        }
      }
      
      user = await prisma.user.create({
        data: userData,
      });
      
      // Award signup bonus to new user
      await createTransaction({
        userId: user.id,
        points: REFERRAL_SIGNUP_BONUS,
        type: 'REFERRAL_SIGNUP',
        description: 'Welcome bonus!',
        metadata: {},
      });
      
      // Award referral bonus to referrer if applicable
      if (userData.referredById) {
        await createTransaction({
          userId: userData.referredById,
          points: REFERRAL_REFERRER_BONUS,
          type: 'REFERRAL_BONUS',
          description: `Referral Bonus from ${user.firstName}`,
          metadata: { referredUserId: user.id },
        });
      }
    }
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    res.status(200).json({ token });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
