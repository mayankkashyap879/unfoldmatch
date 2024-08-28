// server/routes/matches.ts

import express from 'express';
import { 
  getMatches, 
  requestFriendship, 
  respondToFriendship, 
  getFriendshipStatus,
  getMatchStatus,
  getMessages,
  getMatchData
} from '../controllers/matchController';
import auth from '../middleware/auth';


const router = express.Router();

router.get('/', auth, getMatches);
router.post('/request-friendship/:matchId', auth, requestFriendship);
router.post('/respond-friendship/:matchId', auth, respondToFriendship);
router.get('/friendship-status/:matchId', auth, getFriendshipStatus);
router.get('/:matchId/status', auth, getMatchStatus);
router.get('/matches', auth, getMatches);
router.get('/messages/:matchId', auth, getMessages);
router.get('/:matchId', auth, getMatchData);

export default router;