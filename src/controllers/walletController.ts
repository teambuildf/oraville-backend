import { Request, Response } from 'express';
import { getUserTransactions } from '../services/transactionService';
import { prisma } from '../config/database';

/**
 * GET /api/wallet/transactions
 * Get paginated transaction history
 */
export async function getTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await getUserTransactions(userId, page, limit);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

/**
 * GET /api/wallet/referrals
 * Get user's referral statistics
 */
export async function getReferrals(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        _count: {
          select: { referrals: true },
        },
      },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Calculate total points from referrals
    const referralTransactions = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'REFERRAL_BONUS',
      },
      _sum: { points: true },
    });
    
    const baseUrl = process.env.REFERRAL_BASE_URL || 'ora.ville/ai/ref';
    
    res.status(200).json({
      referralCode: `${baseUrl}?id=${user.referralCode}`,
      totalReferrals: user._count.referrals,
      totalReferralPoints: referralTransactions._sum.points || 0,
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ error: 'Failed to fetch referral data' });
  }
}
