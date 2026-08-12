"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_js_1 = require("../services/comment.service.js");
class CommentController {
    static getComments = async (req, res) => {
        const taskId = req.params.taskId;
        const comments = await comment_service_js_1.CommentService.getTaskComments(taskId, req.user.userId);
        return res.status(200).json({ comments });
    };
    static addComment = async (req, res) => {
        const taskId = req.params.taskId;
        const comment = await comment_service_js_1.CommentService.addComment(taskId, req.user.userId, req.body.content);
        return res.status(201).json({ comment });
    };
    static deleteComment = async (req, res) => {
        const commentId = req.params.id;
        const result = await comment_service_js_1.CommentService.deleteComment(commentId, req.user.userId);
        return res.status(200).json(result);
    };
}
exports.CommentController = CommentController;
