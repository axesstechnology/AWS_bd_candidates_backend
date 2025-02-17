import express from 'express';
import { checkLocationPermission } from '../controllers/locationController';

const router = express.Router();

// Endpoint to check location permission
router.post('/permission', checkLocationPermission);

export default router;
