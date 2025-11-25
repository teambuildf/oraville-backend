import { Request, Response } from 'express';

const FAQ_DATA = [
  {
    question: 'How do I earn Glow Points?',
    answer: 'You can earn Glow Points by completing daily tasks like morning check-ins, face scans, reading wellness tips, and inviting friends. Each task has a specific point value.',
  },
  {
    question: 'What can I do with my Glow Points?',
    answer: 'Glow Points accumulate in your wallet and can be converted to real-world rewards. More redemption options will be available soon!',
  },
  {
    question: 'How does the referral system work?',
    answer: 'Share your unique referral code with friends. When they sign up using your code, you both earn bonus points! The more friends you refer, the more you earn.',
  },
  {
    question: 'What is the streak system?',
    answer: 'Your streak tracks consecutive days of completing at least one task. Building a streak shows consistency and earns you recognition in the community.',
  },
  {
    question: 'How secure is my data?',
    answer: 'We take security seriously. Your data is encrypted, and we use Telegram\'s secure authentication system. We never share your personal information with third parties.',
  },
  {
    question: 'Can I update my profile?',
    answer: 'Yes! You can update your name, country, and profile picture anytime from the profile section.',
  },
];

/**
 * GET /api/content/faq
 * Get FAQ content
 */
export async function getFAQ(_req: Request, res: Response): Promise<void> {
  res.status(200).json(FAQ_DATA);
}
