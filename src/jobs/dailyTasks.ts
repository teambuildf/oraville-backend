import cron from 'node-cron';
import { prisma } from '../config/database';
import { formatDateOnly, getTodayMidnight } from '../utils/dateHelpers';

/**
 * Daily task creation job - runs every day at 00:00 UTC
 * Creates UserTask entries for all active users for the current day
 */
export function startDailyTasksJob() {
  // Run once a day at 00:00 UTC
  cron.schedule('0 0 * * *', async () => {
    console.log('🕐 Running daily tasks creation job...');
    
    try {
      const today = getTodayMidnight();
      const dateStr = formatDateOnly(today);
      
      // Get all active daily tasks
      const tasks = await prisma.task.findMany({
        where: {
          type: 'DAILY',
          isActive: true,
        },
      });
      
      // Get all users
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      
      // Create user tasks for each user-task combination
      const userTasks = [];
      for (const user of users) {
        for (const task of tasks) {
          userTasks.push({
            userId: user.id,
            taskId: task.id,
            date: dateStr,
            status: 'PENDING',
          });
        }
      }
      
      // Use createMany with skipDuplicates to avoid conflicts
      const result = await prisma.userTask.createMany({
        data: userTasks,
        skipDuplicates: true,
      });
      
      console.log(`✅ Created ${result.count} user tasks for ${users.length} users`);
    } catch (error) {
      console.error('❌ Daily tasks job failed:', error);
    }
  });
  
  console.log('✨ Daily tasks cron job scheduled (00:00 UTC)');
}
