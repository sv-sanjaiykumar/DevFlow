import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticate, authorizeProject } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  createLabelSchema,
} from '../validators/project.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(ProjectController.getProjects));
router.post('/', validateRequest(createProjectSchema), asyncHandler(ProjectController.createProject));
router.get('/:id', authorizeProject(), asyncHandler(ProjectController.getProject));
router.patch('/:id', authorizeProject(['OWNER', 'ADMIN']), validateRequest(updateProjectSchema), asyncHandler(ProjectController.updateProject));
router.delete('/:id', authorizeProject(['OWNER']), asyncHandler(ProjectController.deleteProject));

// Members management
router.post('/:id/members', authorizeProject(['OWNER', 'ADMIN']), validateRequest(addMemberSchema), asyncHandler(ProjectController.addMember));
router.patch('/:id/members/:memberId', authorizeProject(['OWNER', 'ADMIN']), validateRequest(updateMemberRoleSchema), asyncHandler(ProjectController.updateMemberRole));
router.delete('/:id/members/:memberId', authorizeProject(['OWNER', 'ADMIN']), asyncHandler(ProjectController.removeMember));

// Labels management
router.get('/:id/labels', authorizeProject(), asyncHandler(ProjectController.getLabels));
router.post('/:id/labels', authorizeProject(['OWNER', 'ADMIN']), validateRequest(createLabelSchema), asyncHandler(ProjectController.createLabel));

export default router;
