// server/routes/messages.ts

import express from 'express';
import { getMessages } from '../controllers/messageController';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/:matchId', auth, getMessages);

export default router;