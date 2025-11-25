import { prisma } from '../config/database';
import { createTransaction } from './transactionService';
import { formatDateOnly, getTodayMidnight } from '../utils/dateHelpers';

/**
 * Get all daily tasks for a user with their completion status
 */
export async function getUserDailyTasks(userId: string, date: Date = new Date()) {
  const dateStr = formatDateOnly(date);
  
  // Get all active daily tasks
  const tasks = await prisma.task.findMany({
    where: {
      type: 'DAILY',
      isActive: true,
    },
    orderBy: { points: 'desc' },
  });
  
  // Get user's task completion status for today
  const userTasks = await prisma.userTask.findMany({
    where: {
      userId,
      date: dateStr,
    },
  });
  
  const userTaskMap = new Map(
    userTasks.map(ut => [ut.taskId, ut])
  );
  
  const tasksWithStatus = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    points: task.points,
    action: task.action,
    status: userTaskMap.get(task.id)?.status || 'PENDING',
    completedAt: userTaskMap.get(task.id)?.completedAt,
  }));
  
  const completed = tasksWithStatus.filter(t => t.status === 'COMPLETED').length;
  const total = tasksWithStatus.length;
  
  return {
    tasks: tasksWithStatus,
    progress: {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
  };
}

/**
 * Mark a task as complete for the user today
 */
export async function completeTask(userId: string, taskId: string) {
  const today = getTodayMidnight();
  const dateStr = formatDateOnly(today);
  
  // Get the task details
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  
  if (!task) {
    throw new Error('Task not found');
  }
  
  if (!task.isActive) {
    throw new Error('Task is not active');
  }
  
  // Check if already completed
  const existingUserTask = await prisma.userTask.findUnique({
    where: {
      userId_taskId_date: {
        userId,
        taskId,
        date: dateStr,
      },
    },
  });
  
  if (existingUserTask?.status === 'COMPLETED') {
    throw new Error('Task already completed today');
  }
  
  // Mark as completed
  const userTask = await prisma.userTask.upsert({
    where: {
      userId_taskId_date: {
        userId,
        taskId,
        date: dateStr,
      },
    },
    update: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
    create: {
      userId,
      taskId,
      date: dateStr,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });
  
  // Award points via transaction
  await createTransaction({
    userId,
    points: task.points,
    type: 'TASK_COMPLETION',
    description: `Completed: ${task.title}`,
    metadata: { taskId: task.id, taskAction: task.action },
  });
  
  return {
    userTask,
    pointsAwarded: task.points,
  };
}

/**
 * Calculate user's current streak (consecutive days with at least 1 task completed)
 */
export async function calculateUserStreak(userId: string): Promise<number> {
  let streak = 0;
  let currentDate = getTodayMidnight();
  
  while (true) {
    const dateStr = formatDateOnly(currentDate);
    
    const completedCount = await prisma.userTask.count({
      where: {
        userId,
        date: dateStr,
        status: 'COMPLETED',
      },
    });
    
    if (completedCount === 0) {
      break;
    }
    
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
    
    // Limit to prevent infinite loops (max 365 days)
    if (streak >= 365) break;
  }
  
  return streak;
}
