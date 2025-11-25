import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('❌ Error:', err);
  
  // Check if response already sent
  if (res.headersSent) {
    return next(err);
  }
  
  // Default to 500 server error
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
