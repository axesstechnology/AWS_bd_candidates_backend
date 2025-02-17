// routes/userSessionRoutes.ts
import express from 'express';
import { checkIn, checkOut } from '../controllers/userSessionController';

const router = express.Router();

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);

export default router;
