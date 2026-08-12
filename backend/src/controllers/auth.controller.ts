import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static register = async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.register(req.body);
    return res.status(201).json(result);
  };

  static login = async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.login(req.body);
    return res.status(200).json(result);
  };

  static refresh = async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refresh(refreshToken);
    return res.status(200).json(result);
  };

  static logout = async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;
    await AuthService.logout(refreshToken);
    return res.status(200).json({ message: 'Logged out successfully' });
  };

  static me = async (req: AuthenticatedRequest, res: Response) => {
    const user = await AuthService.getCurrentUser(req.user!.userId);
    return res.status(200).json({ user });
  };
}
