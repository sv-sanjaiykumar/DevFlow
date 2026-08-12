import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AIService } from '../services/ai.service.js';

export class AIController {
  static generateTask = async (req: AuthenticatedRequest, res: Response) => {
    const { prompt, projectId } = req.body;
    const result = await AIService.generateTask(prompt, projectId, req.user!.userId);
    return res.status(200).json({ result });
  };

  static confirmTask = async (req: AuthenticatedRequest, res: Response) => {
    const task = await AIService.confirmTask(req.user!.userId, req.body);
    return res.status(201).json({ task });
  };

  static explainTask = async (req: AuthenticatedRequest, res: Response) => {
    const { taskId, title, description } = req.body;
    const result = await AIService.explainTask(taskId, title, description);
    return res.status(200).json({ result });
  };
}
