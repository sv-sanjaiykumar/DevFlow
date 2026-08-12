import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ProjectService } from '../services/project.service.js';

export class ProjectController {
  static getProjects = async (req: AuthenticatedRequest, res: Response) => {
    const projects = await ProjectService.getUserProjects(req.user!.userId);
    return res.status(200).json({ projects });
  };

  static getProject = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const project = await ProjectService.getProjectById(id, req.user!.userId);
    return res.status(200).json({ project });
  };

  static createProject = async (req: AuthenticatedRequest, res: Response) => {
    const project = await ProjectService.createProject(req.user!.userId, req.body);
    return res.status(201).json({ project });
  };

  static updateProject = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const project = await ProjectService.updateProject(id, req.user!.userId, req.body);
    return res.status(200).json({ project });
  };

  static deleteProject = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const result = await ProjectService.deleteProject(id, req.user!.userId);
    return res.status(200).json(result);
  };

  static addMember = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const member = await ProjectService.addMember(id, req.body.usernameOrEmail, req.body.role);
    return res.status(201).json({ member });
  };

  static updateMemberRole = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const memberId = req.params.memberId as string;
    const member = await ProjectService.updateMemberRole(id, memberId, req.body.role);
    return res.status(200).json({ member });
  };

  static removeMember = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const memberId = req.params.memberId as string;
    const result = await ProjectService.removeMember(id, memberId);
    return res.status(200).json(result);
  };

  static getLabels = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const labels = await ProjectService.getLabels(id);
    return res.status(200).json({ labels });
  };

  static createLabel = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const label = await ProjectService.createLabel(id, req.body.name, req.body.color);
    return res.status(201).json({ label });
  };
}
