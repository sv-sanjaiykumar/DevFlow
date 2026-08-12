"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
const index_js_1 = require("../config/index.js");
const client_js_1 = __importDefault(require("../prisma/client.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const client_1 = require("@prisma/client");
class AIService {
    static getOpenAIClient() {
        if (!index_js_1.config.openaiApiKey || index_js_1.config.openaiApiKey.trim() === '' || index_js_1.config.openaiApiKey.startsWith('sk-proj-your')) {
            return null;
        }
        return new openai_1.default({ apiKey: index_js_1.config.openaiApiKey });
    }
    static async generateTask(prompt, projectId, userId) {
        // Verify membership
        const member = await client_js_1.default.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!member) {
            throw new errorHandler_js_1.AppError('Access denied: You are not a member of this project', 403, 'FORBIDDEN');
        }
        const openai = this.getOpenAIClient();
        if (!openai) {
            // Intelligently parse prompt offline if OpenAI key is not provided
            const titleLower = prompt.toLowerCase();
            let priority = client_1.TaskPriority.MEDIUM;
            if (titleLower.includes('urgent') || titleLower.includes('crash') || titleLower.includes('500') || titleLower.includes('security')) {
                priority = client_1.TaskPriority.URGENT;
            }
            else if (titleLower.includes('slow') || titleLower.includes('bug') || titleLower.includes('401') || titleLower.includes('fail')) {
                priority = client_1.TaskPriority.HIGH;
            }
            else if (titleLower.includes('minor') || titleLower.includes('color') || titleLower.includes('text')) {
                priority = client_1.TaskPriority.LOW;
            }
            const suggestedLabels = ['ai-generated'];
            if (titleLower.includes('auth') || titleLower.includes('login') || titleLower.includes('token') || titleLower.includes('401')) {
                suggestedLabels.push('backend', 'security');
            }
            else if (titleLower.includes('ui') || titleLower.includes('button') || titleLower.includes('css') || titleLower.includes('kanban')) {
                suggestedLabels.push('frontend', 'ui/ux');
            }
            else {
                suggestedLabels.push('feature');
            }
            return {
                title: prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt,
                description: `Analysis based on user prompt: "${prompt}".\n\nIdentified task scope and implementation steps for DevFlow engineering team.`,
                priority,
                suggestedLabels,
                possibleCauses: [
                    'Uncaught exceptions in edge condition state handlers',
                    'Asynchronous token invalidation or race condition during request execution',
                    'Missing validation schema checks on backend input parameters',
                ],
                nextSteps: [
                    'Reproduce issue with test cases and inspect server output logs',
                    'Implement targeted code fix and add unit test verification',
                    'Deploy fix to target environment and verify status in Kanban board',
                ],
            };
        }
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert AI engineering project manager and tech lead.
Given a developer's problem statement or requirement prompt, generate a strict JSON object with:
- "title": concise, professional action title (max 70 chars)
- "description": detailed technical summary including bug context or feature spec
- "priority": exact string, one of ["LOW", "MEDIUM", "HIGH", "URGENT"]
- "suggestedLabels": string array of 2-4 tags (e.g. ["bug", "backend", "security"])
- "possibleCauses": string array of 2-3 root causes or technical considerations
- "nextSteps": string array of 3-4 actionable step-by-step developer instructions

OUTPUT ONLY VALID JSON WITH NO MARKDOWN OR WRAPPERS.`,
                    },
                    { role: 'user', content: prompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new errorHandler_js_1.AppError('AI returned empty response', 500, 'AI_ERROR');
            }
            const parsed = JSON.parse(content);
            return {
                title: parsed.title || 'Generated Developer Task',
                description: parsed.description || prompt,
                priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(parsed.priority) ? parsed.priority : 'MEDIUM',
                suggestedLabels: Array.isArray(parsed.suggestedLabels) ? parsed.suggestedLabels : ['ai-generated'],
                possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : [],
                nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
            };
        }
        catch (err) {
            console.error('[OpenAI Generate Task Error]:', err);
            throw new errorHandler_js_1.AppError(`AI task generation failed: ${err.message || 'Error communicating with AI service'}`, 500, 'AI_ERROR');
        }
    }
    static async confirmTask(userId, data) {
        const member = await client_js_1.default.projectMember.findUnique({
            where: { projectId_userId: { projectId: data.projectId, userId } },
        });
        if (!member) {
            throw new errorHandler_js_1.AppError('Access denied: You are not a member of this project', 403, 'FORBIDDEN');
        }
        // Attach or create labels
        const labelIds = [];
        if (data.suggestedLabels && data.suggestedLabels.length > 0) {
            for (const name of data.suggestedLabels) {
                const cleanName = name.toLowerCase().trim();
                let label = await client_js_1.default.label.findUnique({
                    where: { projectId_name: { projectId: data.projectId, name: cleanName } },
                });
                if (!label) {
                    const colors = ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    label = await client_js_1.default.label.create({
                        data: { projectId: data.projectId, name: cleanName, color: randomColor },
                    });
                }
                labelIds.push(label.id);
            }
        }
        // Get max position in BACKLOG
        const maxPosTask = await client_js_1.default.task.findFirst({
            where: { projectId: data.projectId, status: client_1.TaskStatus.BACKLOG },
            orderBy: { position: 'desc' },
        });
        const position = maxPosTask ? maxPosTask.position + 1 : 0;
        const task = await client_js_1.default.task.create({
            data: {
                projectId: data.projectId,
                title: data.title,
                description: data.description || '',
                status: client_1.TaskStatus.BACKLOG,
                priority: data.priority,
                creatorId: userId,
                position,
                taskLabels: {
                    create: labelIds.map((labelId) => ({ labelId })),
                },
            },
            include: {
                creator: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                taskLabels: { include: { label: true } },
            },
        });
        return {
            ...task,
            labels: task.taskLabels.map((tl) => tl.label),
        };
    }
    static async explainTask(taskId, title, description) {
        let taskTitle = title || '';
        let taskDesc = description || '';
        if (taskId) {
            const task = await client_js_1.default.task.findUnique({ where: { id: taskId } });
            if (task) {
                taskTitle = task.title;
                taskDesc = task.description || '';
            }
        }
        const openai = this.getOpenAIClient();
        if (!openai) {
            return {
                summary: `Explanation for: "${taskTitle}"`,
                overview: `This task focuses on resolving "${taskTitle}". ${taskDesc}`,
                keyObjectives: [
                    'Understand the core cause of the issue or requirement',
                    'Implement necessary backend or frontend modifications',
                    'Verify functionality with integration tests',
                ],
                recommendedApproach: 'Inspect recent code changes in relevant handlers, check network requests and logs, and apply unit test assertions.',
            };
        }
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an approachable senior developer guiding a junior team member.
Explain the following software task in plain, beginner-friendly language.
Return JSON with:
- "summary": 1 sentence high-level summary
- "overview": 2-3 paragraph plain-English explanation of why this task matters and what it solves
- "keyObjectives": array of 3 bullet points
- "recommendedApproach": guidance on how a developer should approach solving it`,
                    },
                    {
                        role: 'user',
                        content: `Task Title: ${taskTitle}\nDescription: ${taskDesc}`,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            });
            const content = response.choices[0]?.message?.content;
            if (!content)
                throw new errorHandler_js_1.AppError('AI explanation failed', 500, 'AI_ERROR');
            return JSON.parse(content);
        }
        catch (err) {
            console.error('[OpenAI Explain Task Error]:', err);
            throw new errorHandler_js_1.AppError(`AI explanation failed: ${err.message}`, 500, 'AI_ERROR');
        }
    }
}
exports.AIService = AIService;
