import { prisma } from '../config/database';

export interface CreateTransactionParams {
  userId: string;
  points: number;
  type: 'TASK_COMPLETION' | 'REFERRAL_BONUS' | 'REFERRAL_SIGNUP';
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Creates an atomic transaction record for points
 * Never directly modify user balance - always create transactions
 */
export async function createTransaction(params: CreateTransactionParams) {
  return await prisma.transaction.create({
    data: {
      userId: params.userId,
      points: params.points,
      type: params.type,
      description: params.description,
      metadata: params.metadata || {},
    },
  });
}

/**
 * Calculate total Glow Points for a user
 */
export async function getUserTotalPoints(userId: string): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: { userId },
    _sum: { points: true },
  });
  
  return result._sum.points || 0;
}

/**
 * Get paginated transaction history for a user
 */
export async function getUserTransactions(userId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        description: true,
        points: true,
        createdAt: true,
        type: true,
      },
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);
  
  return {
    transactions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  };
}
