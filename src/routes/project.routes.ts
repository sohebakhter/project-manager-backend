import { Router } from 'express';
import { createProject, getProjects, updateProject, deleteProject } from '../controllers/project.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// All project routes need authentication
router.use(authenticateToken);

router.post('/', createProject);
router.get('/', getProjects);

// Admin only operations
router.patch('/:id', authorizeRole([UserRole.ADMIN]), updateProject);
router.delete('/:id', authorizeRole([UserRole.ADMIN]), deleteProject);

export default router;
