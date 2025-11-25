import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { getUserTotalPoints } from '../services/transactionService';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { storageClient, STORAGE_BUCKET } from '../config/storage';

/**
 * GET /api/user/profile
 * Get authenticated user's profile
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        country: true,
        avatarUrl: true,
        username: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const glowPointsTotal = await getUserTotalPoints(userId);

    res.status(200).json({
      ...user,
      glowPointsTotal,
      email: null, // Future feature
      phone: null, // Future feature
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

/**
 * PUT /api/user/profile
 * Update authenticated user's profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { firstName, lastName, country } = req.body;
    
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (country !== undefined) updateData.country = country;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        firstName: true,
        lastName: true,
        country: true,
        avatarUrl: true,
        username: true,
      },
    });
    
    const glowPointsTotal = await getUserTotalPoints(userId);
    
    res.status(200).json({
      ...user,
      glowPointsTotal,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * GET /api/user/avatar/upload-url
 * Generate a pre-signed URL for avatar upload
 */
export async function getAvatarUploadUrl(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const contentType = (req.query.contentType as string) || 'image/jpeg';
    
    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      res.status(400).json({ error: 'Invalid content type' });
      return;
    }
    
    const timestamp = Date.now();
    const extension = contentType.split('/')[1];
    const key = `avatars/${userId}/${timestamp}.${extension}`;
    
    const command = new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    
    const uploadUrl = await getSignedUrl(storageClient, command, { expiresIn: 3600 });
    
    res.status(200).json({
      uploadUrl,
      key,
    });
  } catch (error) {
    console.error('Generate upload URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

/**
 * POST /api/user/avatar/confirm
 * Confirm avatar upload and update user profile
 */
export async function confirmAvatar(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { key } = req.body;
    
    if (!key) {
      res.status(400).json({ error: 'Key is required' });
      return;
    }
    
    // Construct public URL
    const avatarUrl = `https://${STORAGE_BUCKET}.s3.${process.env.B2_REGION || 'us-west-004'}.backblazeb2.com/${key}`;
    
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
    
    res.status(200).json({ message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('Confirm avatar error:', error);
    res.status(500).json({ error: 'Failed to confirm avatar' });
  }
}
