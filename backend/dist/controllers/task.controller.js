"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_js_1 = require("../services/task.service.js");
class TaskController {
    static getTasks = async (req, res) => {
        const { projectId, status, priority, assigneeId, labelId, search } = req.query;
        const tasks = await task_service_js_1.TaskService.getTasks({
            projectId: projectId,
            userId: req.user.userId,
            status: status,
            priority: priority,
            assigneeId: assigneeId,
            labelId: labelId,
            search: search,
        });
        return res.status(200).json({ tasks });
    };
    static getTask = async (req, res) => {
        const id = req.params.id;
        const task = await task_service_js_1.TaskService.getTaskById(id, req.user.userId);
        return res.status(200).json({ task });
    };
    static createTask = async (req, res) => {
        const task = await task_service_js_1.TaskService.createTask(req.user.userId, req.body);
        return res.status(201).json({ task });
    };
    static updateTask = async (req, res) => {
        const id = req.params.id;
        const task = await task_service_js_1.TaskService.updateTask(id, req.user.userId, req.body);
        return res.status(200).json({ task });
    };
    static updateTaskStatus = async (req, res) => {
        const id = req.params.id;
        const { status, position } = req.body;
        const task = await task_service_js_1.TaskService.updateTaskStatusAndPosition(id, req.user.userId, status, position);
        return res.status(200).json({ task });
    };
    static deleteTask = async (req, res) => {
        const id = req.params.id;
        const result = await task_service_js_1.TaskService.deleteTask(id, req.user.userId);
        return res.status(200).json(result);
    };
}
exports.TaskController = TaskController;
