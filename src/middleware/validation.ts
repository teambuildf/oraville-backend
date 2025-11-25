import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const profileValidation = [
  body('firstName').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('country').optional().isString().trim().isLength({ min: 2, max: 100 }),
];

export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
}
