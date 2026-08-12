import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { DashboardService } from '../services/dashboard.service.js';

export class DashboardController {
  static getStats = async (req: AuthenticatedRequest, res: Response) => {
    const stats = await DashboardService.getDashboardStats(req.user!.userId);
    return res.status(200).json(stats);
  };
}
