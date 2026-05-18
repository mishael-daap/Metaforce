import type { Request, Response, NextFunction } from 'express';
import { access } from 'fs';

export interface ProjectContext {
  projectId: string;
  accessToken: string;
  orgUrl: string;
}

declare global {
  namespace Express {
    interface Request {
      projectContext?: ProjectContext;
    }
  }
}

export function extractProjectContext(req: Request, res: Response, next: NextFunction) {
  const projectId = req.headers['x-project-id'];
  const accessToken = req.headers['x-access-token'];
  const orgUrl = req.headers['x-org-url'];

  console.log("details from extract project context", projectId, accessToken, orgUrl)

  if (!projectId) {
    res.status(400).json({
      status: false,
      error: 'Bad Request: x-project-id header is required',
      createdItems: []
    });
    return;
  }

  if (!accessToken) {
    res.status(400).json({
      status: false,
      error: 'Bad Request: x-access-token header is required',
      createdItems: []
    });
    return;
  }

  if (!orgUrl) {
    res.status(400).json({
      status: false,
      error: 'Bad Request: x-org-url header is required',
      createdItems: []
    });
    return;
  }

  req.projectContext = {
    projectId: String(projectId),
    accessToken: String(accessToken),
    orgUrl: String(orgUrl)
  };

  next();
}
