"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const project_service_js_1 = require("../services/project.service.js");
class ProjectController {
    static getProjects = async (req, res) => {
        const projects = await project_service_js_1.ProjectService.getUserProjects(req.user.userId);
        return res.status(200).json({ projects });
    };
    static getProject = async (req, res) => {
        const id = req.params.id;
        const project = await project_service_js_1.ProjectService.getProjectById(id, req.user.userId);
        return res.status(200).json({ project });
    };
    static createProject = async (req, res) => {
        const project = await project_service_js_1.ProjectService.createProject(req.user.userId, req.body);
        return res.status(201).json({ project });
    };
    static updateProject = async (req, res) => {
        const id = req.params.id;
        const project = await project_service_js_1.ProjectService.updateProject(id, req.user.userId, req.body);
        return res.status(200).json({ project });
    };
    static deleteProject = async (req, res) => {
        const id = req.params.id;
        const result = await project_service_js_1.ProjectService.deleteProject(id, req.user.userId);
        return res.status(200).json(result);
    };
    static addMember = async (req, res) => {
        const id = req.params.id;
        const member = await project_service_js_1.ProjectService.addMember(id, req.body.usernameOrEmail, req.body.role);
        return res.status(201).json({ member });
    };
    static updateMemberRole = async (req, res) => {
        const id = req.params.id;
        const memberId = req.params.memberId;
        const member = await project_service_js_1.ProjectService.updateMemberRole(id, memberId, req.body.role);
        return res.status(200).json({ member });
    };
    static removeMember = async (req, res) => {
        const id = req.params.id;
        const memberId = req.params.memberId;
        const result = await project_service_js_1.ProjectService.removeMember(id, memberId);
        return res.status(200).json(result);
    };
    static getLabels = async (req, res) => {
        const id = req.params.id;
        const labels = await project_service_js_1.ProjectService.getLabels(id);
        return res.status(200).json({ labels });
    };
    static createLabel = async (req, res) => {
        const id = req.params.id;
        const label = await project_service_js_1.ProjectService.createLabel(id, req.body.name, req.body.color);
        return res.status(201).json({ label });
    };
}
exports.ProjectController = ProjectController;
