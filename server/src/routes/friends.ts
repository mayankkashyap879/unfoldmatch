// server/routes/friends.ts

import express from 'express';
import { getFriends, getPendingFriendships } from '../controllers/friendsController';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getFriends);
router.get('/pending', auth, getPendingFriendships);

export default router;