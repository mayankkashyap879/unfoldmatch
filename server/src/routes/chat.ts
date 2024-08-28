// server/routes/chat.ts
import express from 'express';
import { getMatches, getMessages, requestFriendship, respondToFriendship, getMatchData } from '../controllers/chatController';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/matches', auth, getMatches);
router.get('/messages/:matchId', auth, getMessages);
router.post('/request-friendship/:matchId', auth, requestFriendship);
router.post('/respond-friendship/:matchId', auth, respondToFriendship);
router.get('/matches/:matchId', auth, getMatchData);

export default router;