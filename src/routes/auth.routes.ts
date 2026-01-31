import { Router } from 'express';
import { login, createInvite, validateInvite, register } from '../controllers/auth.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

router.post('/login', login);
router.post('/validate-invite', validateInvite);
router.post('/register', register);

// Protected Invite Creation
router.post('/invite', authenticateToken, authorizeRole([UserRole.ADMIN]), createInvite);

export default router;
