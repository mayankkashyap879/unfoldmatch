// server/routes/friends.ts

import express from 'express';
import { getFriends, getPendingFriendships, checkFriendshipStatus } from '../controllers/friendsController';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getFriends);
router.get('/pending', auth, getPendingFriendships);
router.get('/status/:matchId', auth, checkFriendshipStatus);

export default router;