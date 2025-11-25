import { Request, Response } from 'express';
import { getUserDailyTasks, completeTask, calculateUserStreak } from '../services/taskService';

/**
 * GET /api/tasks/daily
 * Get daily tasks for the authenticated user
 */
export async function getDailyTasks(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const result = await getUserDailyTasks(userId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Get daily tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

/**
 * POST /api/tasks/:taskId/complete
 * Mark a task as complete
 */
export async function completeTaskEndpoint(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { taskId } = req.params;
    
    const result = await completeTask(userId, taskId);
    
    res.status(200).json({
      message: 'Task completed',
      pointsAwarded: result.pointsAwarded,
    });
  } catch (error: any) {
    console.error('Complete task error:', error);
    
    if (error.message === 'Task already completed today') {
      res.status(409).json({ error: error.message });
      return;
    }
    
    res.status(500).json({ error: 'Failed to complete task' });
  }
}

/**
 * POST /api/tasks/verify/facescan
 * Verify face scan (simplified for MVP - honor system)
 */
export async function verifyFaceScan(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    
    // Find the face scan task
    const { prisma } = await import('../config/database');
    const faceScanTask = await prisma.task.findUnique({
      where: { action: 'FACE_SCAN' },
    });
    
    if (!faceScanTask) {
      res.status(404).json({ error: 'Face scan task not found' });
      return;
    }
    
    // Complete the task (MVP: honor system)
    const result = await completeTask(userId, faceScanTask.id);
    
    res.status(200).json({
      message: 'Face scan verified',
      pointsAwarded: result.pointsAwarded,
    });
  } catch (error: any) {
    console.error('Verify face scan error:', error);
    
    if (error.message === 'Task already completed today') {
      res.status(409).json({ error: error.message });
      return;
    }
    
    res.status(500).json({ error: 'Face scan verification failed' });
  }
}

/**
 * GET /api/tasks/current-streak
 * Get user's current streak
 */
export async function getCurrentStreak(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const streakInDays = await calculateUserStreak(userId);
    
    res.status(200).json({ streakInDays });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to calculate streak' });
  }
}
