// server/routes/messages.ts

import express from 'express';
import { getMessagesByMatchId, getMessagesBetweenUsers } from '../controllers/messageController';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/match/:matchId', auth, getMessagesByMatchId);
router.get('/friend/:friendId/:userId', auth, getMessagesBetweenUsers);

export default router;