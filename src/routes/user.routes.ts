import { Router } from 'express';
import { getAllUsers, updateUserRole, updateUserStatus } from '../controllers/user.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes here require ADMIN role
router.use(authenticateToken, authorizeRole([UserRole.ADMIN]));

router.get('/', getAllUsers);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);

export default router;
