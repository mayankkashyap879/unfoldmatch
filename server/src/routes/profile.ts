// server/routes/profile.ts

import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);

export default router;