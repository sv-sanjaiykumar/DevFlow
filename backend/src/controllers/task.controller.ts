import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { TaskService } from '../services/task.service.js';

export class TaskController {
  static getTasks = async (req: AuthenticatedRequest, res: Response) => {
    const { projectId, status, priority, assigneeId, labelId, search } = req.query;
    const tasks = await TaskService.getTasks({
      projectId: projectId as string,
      userId: req.user!.userId,
      status: status as any,
      priority: priority as any,
      assigneeId: assigneeId as string,
      labelId: labelId as string,
      search: search as string,
    });

    return res.status(200).json({ tasks });
  };

  static getTask = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const task = await TaskService.getTaskById(id, req.user!.userId);
    return res.status(200).json({ task });
  };

  static createTask = async (req: AuthenticatedRequest, res: Response) => {
    const task = await TaskService.createTask(req.user!.userId, req.body);
    return res.status(201).json({ task });
  };

  static updateTask = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const task = await TaskService.updateTask(id, req.user!.userId, req.body);
    return res.status(200).json({ task });
  };

  static updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const { status, position } = req.body;
    const task = await TaskService.updateTaskStatusAndPosition(id, req.user!.userId, status, position);
    return res.status(200).json({ task });
  };

  static deleteTask = async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const result = await TaskService.deleteTask(id, req.user!.userId);
    return res.status(200).json(result);
  };
}
