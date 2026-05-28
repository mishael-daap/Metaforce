import type { Request, Response, NextFunction } from 'express';

export interface ProjectContext {
  projectId: string;
}

declare global {
  namespace Express {
    interface Request {
      projectContext?: ProjectContext;
    }
  }
}

export function extractProjectContext(req: Request, res:Response, next: NextFunction) {
  const projectId = req.headers['x-project-id'];

  if (!projectId) {
    res.status(400).json({
      success: false,
      error: 'Bad Request: x-project-id header is required',
      components: []
    });
    return;
  }

  req.projectContext = {
    projectId: String(projectId),
  };

  next();
}
