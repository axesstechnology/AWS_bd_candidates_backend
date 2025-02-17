import express from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import { createCandidate, getAllCandidates, getCandidateById, updateCandidate, deleteCandidate, getCandidatesByIds, getCandidatesByBDCategory } from '../controllers/bdController';
import { authenticateJWT } from '../middleware/authenticate';

const router = express.Router();

// Configure multer storage for file uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.'));
        }
    }
});

const candidateValidation = [
    body('Back Door ID')
        .notEmpty()
        .withMessage('Back Door ID is required')
        .trim(),

    body('Candidate Full Name')
        .notEmpty()
        .withMessage('Candidate Full Name is required')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('radio-button')
        .isIn(['software_engineering', 'software_testing'])
        .withMessage('Invalid class selection'),

    // body('switch')
    //     .isBoolean()
    //     .withMessage('Switch must be a boolean value'),

    // body('Need Job Type')
    //     .isIn(['Hybrid', 'Remote'])
    //     .withMessage('Invalid job type'),

    body('phone')
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^\+?[\d\s-]+$/)
        .withMessage('Invalid phone number format'),

    body('Candidate Mail ID')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),

    // body('Total Amount')
    //     .isNumeric()
    //     .withMessage('Total Amount must be a number')
    //     .isFloat({ min: 0 })
    //     .withMessage('Total Amount must be positive'),

    // body('Mode of Payment')
    //     .isIn(['cash', 'online','Not Applicable','loan'])
    //     .withMessage('Invalid mode of payment'),

    // body('Loan')
    //     .isIn(['yes', 'no'])
    //     .withMessage('Loan must be either yes or no'),

    // body('Loan Sanction Amount')
    //     .if(body('Loan').equals('yes'))
    //     .notEmpty()
    //     .withMessage('Loan Sanction Amount is required when loan is yes')
    //     .isNumeric()
    //     .withMessage('Loan Sanction Amount must be a number')
    //     .isFloat({ min: 0 })
    //     .withMessage('Loan Sanction Amount must be positive'),

    // body('Balance Amount')
    //     .if(body('Loan').equals('yes'))
    //     .notEmpty()
    //     .withMessage('Balance Amount is required when loan is yes')
    //     .isNumeric()
    //     .withMessage('Balance Amount must be a number')
    //     .isFloat({ min: 0 })
    //     .withMessage('Balance Amount must be positive'),

    // body('Did Offer Received')
    //     .isIn(['yes', 'no'])
    //     .withMessage('Did Offer Received must be either yes or no'),

    // Dynamic offer installments validation
    // body()
    //     .custom((value, { req }) => {
    //         const keys = Object.keys(req.body);
    //         const installmentKeys = keys.filter(key => key.startsWith('offer_installment_'));
    //         if (req.body['Did Offer Received'] === 'yes' && installmentKeys.length === 0) {
    //             // throw new Error('At least one offer installment is required when offer is received');
    //         }
    //         for (const key of installmentKeys) {
    //             if (isNaN(Number(req.body[key]))) {
    //                 throw new Error(`${key} must be a valid number`);
    //             }
    //             if (Number(req.body[key]) < 0) {
    //                 throw new Error(`${key} must be a positive number`);
    //             }
    //         }
    //         return true;
    //     }),

    // body('payment_for_interview')
    //     .if(body('Did Offer Received').equals('no'))
    //     .notEmpty()
    //     .withMessage('Payment for interview is required when no offer received'),

    // body('payment_for_documents')
    //     .if(body('Did Offer Received').equals('no'))
    //     .notEmpty()
    //     .withMessage('Payment for documents is required when no offer received'),

    // body()
    //     .custom((value, { req }) => {
    //         const keys = Object.keys(req.body);
    //         const processingFeeKeys = keys.filter(key => key.startsWith('processing_fee_'));
    //         if (req.body['Did Offer Received'] === 'no' && processingFeeKeys.length === 0) {
    //             // throw new Error('At least one processing fee is required when no offer received');
    //         }
    //         for (const key of processingFeeKeys) {
    //             if (isNaN(Number(req.body[key]))) {
    //                 throw new Error(`${key} must be a valid number`);
    //             }
    //             if (Number(req.body[key]) < 0) {
    //                 throw new Error(`${key} must be a positive number`);
    //             }
    //         }
    //         return true;
    //     }),

    // body('Date of Offer')
    //     .isISO8601()
    //     .withMessage('Invalid date format for Date of Offer'),

    // ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => 
    //     body(`EMI - ${num}`)
    //         .if(body('Is EMI').equals('yes'))
    //         .notEmpty()
    //         .withMessage(`EMI ${num} amount is required when EMI is yes`)
    //         .isNumeric()
    //         .withMessage(`EMI ${num} amount must be a number`)
    //         .isFloat({ min: 0 })
    //         .withMessage(`EMI ${num} amount must be positive`)
    // ),

    // body('Referred By')
    //     .notEmpty()
    //     .withMessage('Referred By is required')
    //     .trim(),

    // body('Documents Submitted')
    //     .isIn(['yes', 'no'])
    //     .withMessage('Documents Submitted must be either yes or no'),

    // body('Comments')
    //     .optional()
    //     .trim(),

];

// router.post('/candidates', upload.array('documents', 10), candidateValidation, createCandidate);
router.post('/candidates', upload.array('documents', 10), createCandidate);
router.get('/candidates', getAllCandidates);
router.get('/candidates/:id', getCandidateById);
router.post('/simplecandidates/ids', getCandidatesByIds);
router.post('/candidates/bdcategory/:category', getCandidatesByBDCategory);
router.put('/candidates/:id',authenticateJWT, upload.array('documents', 10), candidateValidation, updateCandidate);
router.delete('/candidates/:id', deleteCandidate);

router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (err instanceof multer.MulterError) {
        res.status(400).json({
            success: false,
            message: 'File upload error',
            error: err.message
        });
    } else if (err) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
    next();
});

export default router;