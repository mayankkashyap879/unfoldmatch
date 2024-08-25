// server/routes/auth.ts

import express from 'express';
import { registerUser, loginUser, resetPassword, verifyUser } from '../controllers/authController';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.get('/verify', auth, verifyUser);

export default router;