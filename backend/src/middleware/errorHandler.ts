import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled server error:', err);
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : (err.message || 'Internal Server Error');

  res.status(status).json({
    success: false,
    error: message,
    code: err.code || 'SERVER_ERROR',
  });
}
