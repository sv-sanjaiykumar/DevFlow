"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ai_service_js_1 = require("../services/ai.service.js");
class AIController {
    static generateTask = async (req, res) => {
        const { prompt, projectId } = req.body;
        const result = await ai_service_js_1.AIService.generateTask(prompt, projectId, req.user.userId);
        return res.status(200).json({ result });
    };
    static confirmTask = async (req, res) => {
        const task = await ai_service_js_1.AIService.confirmTask(req.user.userId, req.body);
        return res.status(201).json({ task });
    };
    static explainTask = async (req, res) => {
        const { taskId, title, description } = req.body;
        const result = await ai_service_js_1.AIService.explainTask(taskId, title, description);
        return res.status(200).json({ result });
    };
}
exports.AIController = AIController;
