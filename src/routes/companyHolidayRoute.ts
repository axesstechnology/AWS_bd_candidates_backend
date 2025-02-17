import express from 'express';
import { addCompanyHoliday, deleteCompanyHoliday, getAllCompanyHolidays, updateCompanyHoliday } from '../controllers/companyHolidayController';
import { authenticateJWT } from '../middleware/authenticate';
// import { authenticateJWT } from '../middleware/authenticate';


const router = express.Router();

// Company holiday routes
router.post('/holiday/add' ,addCompanyHoliday);
router.get('/holiday', getAllCompanyHolidays);
router.put('/holiday/update/:id', updateCompanyHoliday);
router.delete('/holiday/delete/:id',deleteCompanyHoliday);

export default router;
