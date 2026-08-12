"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_js_1 = require("../controllers/project.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
const project_validator_js_1 = require("../validators/project.validator.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
router.get('/', (0, asyncHandler_js_1.asyncHandler)(project_controller_js_1.ProjectController.getProjects));
router.post('/', (0, validate_js_1.validateRequest)(project_validator_js_1.createProjectSchema), (0, asyncHandler_js_1.asyncHandler)(project_controller_js_1.ProjectController.createProject));
router.get('/:id', (0, auth_js_1.authorizeProject)(), (0, asyncHandler_js_1.asyncHandler)(project_controller_js_1.ProjectController.getProject));
router.patch('/:id', (0, auth_js_1.authorizeProject)(['OWNER', 'ADMIN']), (0, validate_js_1.validateRequest)(project_validator_js_1.updateProjectSchema), (0, asyncHandler_js_1.asyncHandler)(project_controller_js_1.ProjectController.updateProject));
router.delete('/:id', (0, auth_js_1.authorizeProject)(['OWNER']), (0, asyncHandler_js_1.asyncHandler)(project_controller_js_1.ProjectController.deleteProject));
// Members management
router.post('/:id/members', (0, auth_js_1.authorizeProject)(['OWNER', 'ADMIN']), (0, validate_js_1.validateRequest)(project_validator_js_1.addMemberSchema), (0, asyncHandler_js_1.asyncHandler)(project_controller_js_1.ProjectController.addMember));
router.patch('/:id/members/:memberId', (0, auth_js_1.authorizeProject)(['OWNER', 'ADMIN']), (0, validate_js_1.validateRequest)(project_validator_js_1.updateMemberRoleSchema), (0, asyncHandler_js_1.asyncHandler)(project_controller_js_1.ProjectController.updateMemberRole));
router.delete('/:id/members/:memberId', (0, auth_js_1.authorizeProject)(['OWNER', 'ADMIN']), (0, asyncHandler_js_1.asyncHandler)(project_controller_js_1.ProjectController.removeMember));
// Labels management
router.get('/:id/labels', (0, auth_js_1.authorizeProject)(), (0, asyncHandler_js_1.asyncHandler)(project_controller_js_1.ProjectController.getLabels));
router.post('/:id/labels', (0, auth_js_1.authorizeProject)(['OWNER', 'ADMIN']), (0, validate_js_1.validateRequest)(project_validator_js_1.createLabelSchema), (0, asyncHandler_js_1.asyncHandler)(project_controller_js_1.ProjectController.createLabel));
exports.default = router;
