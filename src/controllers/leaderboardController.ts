import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { getCurrentWeekBounds } from '../utils/dateHelpers';

/**
 * GET /api/leaderboard/referrals/weekly
 * Get top referrers for the current week
 */
export async function getWeeklyReferralLeaderboard(_req: Request, res: Response): Promise<void> {
  try {
    const { start: weekStart, end: weekEnd } = getCurrentWeekBounds();
    
    const topReferrers = await prisma.user.findMany({
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
        avatarUrl: true,
        referrals: {
          where: {
            createdAt: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
          select: { id: true },
        },
      },
      take: 5,
      orderBy: {
        referrals: {
          _count: 'desc',
        },
      },
    });
    
    const leaderboard = topReferrers.map((user, index) => ({
      rank: index + 1,
      name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
      referrals: user.referrals.length,
      avatarUrl: user.avatarUrl,
    }));
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Weekly leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

/**
 * GET /api/leaderboard/ambassadors
 * Get top users by total Glow Points
 */
export async function getAmbassadorsLeaderboard(_req: Request, res: Response): Promise<void> {
  try {
    // Get users with highest total points
    const userPoints = await prisma.transaction.groupBy({
      by: ['userId'],
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
      take: 10,
    });
    
    // Fetch user details
    const userIds = userPoints.map(up => up.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });
    
    // Create lookup map
    const userMap = new Map(users.map(u => [u.id, u]));
    
    // Build leaderboard
    const leaderboard = userPoints.map((up, index) => {
      const user = userMap.get(up.userId);
      return {
        rank: index + 1,
        name: user ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'Unknown',
        totalPoints: up._sum.points || 0,
        avatarUrl: user?.avatarUrl,
      };
    });
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Ambassadors leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
