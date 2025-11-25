import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { getUserTotalPoints } from '../services/transactionService';
import { getGreeting } from '../utils/dateHelpers';
import { getCurrentWeekBounds } from '../utils/dateHelpers';

/**
 * GET /api/dashboard
 * Get aggregated dashboard data
 */
export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        avatarUrl: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Get total glow points
    const glowPointsTotal = await getUserTotalPoints(userId);
    
    // Get last activity (most recent transaction)
    const lastTransaction = await prisma.transaction.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        description: true,
        points: true,
        createdAt: true,
      },
    });
    
    // Get top weekly referrer
    const { start: weekStart, end: weekEnd } = getCurrentWeekBounds();
    
    const topReferrerData = await prisma.user.findFirst({
      where: {
        referrals: {
          some: {
            createdAt: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
        },
      },
      select: {
        firstName: true,
        lastName: true,
        _count: {
          select: {
            referrals: {
              where: {
                createdAt: {
                  gte: weekStart,
                  lte: weekEnd,
                },
              },
            },
          },
        },
      },
      orderBy: {
        referrals: {
          _count: 'desc',
        },
      },
    });
    
    res.status(200).json({
      greeting: getGreeting(user.firstName),
      user: {
        firstName: user.firstName,
        avatarUrl: user.avatarUrl,
      },
      glowPoints: {
        total: glowPointsTotal,
        nextRewardThreshold: 2000, // This could be dynamic based on business logic
      },
      lastActivity: lastTransaction ? {
        description: lastTransaction.description,
        points: lastTransaction.points,
        timestamp: lastTransaction.createdAt.toISOString(),
      } : null,
      topReferrerWeekly: topReferrerData ? {
        name: `${topReferrerData.firstName}${topReferrerData.lastName ? ' ' + topReferrerData.lastName.charAt(0) + '.' : ''}`,
      } : null,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
