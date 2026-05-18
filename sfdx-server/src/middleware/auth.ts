import type { Request, Response, NextFunction } from 'express';

const API_KEY = process.env.API_KEY || 'dev-api-key';

export function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: x-api-key header is required',
      components: []
    });
    return;
  }

  if (apiKey !== API_KEY) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid API key',
      components: []
    });
    return;
  }

  next();
}
