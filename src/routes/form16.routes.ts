import express, { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback, MulterError } from 'multer';
import path from 'path';
import pdfController from '../controllers/form16.controller';

const router = express.Router();

// Configure multer for PDF storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to accept only PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware for handling Multer errors
const multerErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
  return new Promise<void>((resolve) => {
    if (err instanceof MulterError) {
      res.status(400).json({ message: err.message });
    } else if (err) {
      res.status(400).json({ message: err.message });
    } else {
      next();
    }
    resolve();
  });
};

// Routes

router.post('/upload', pdfController.uploadPdf);
router.get('/', pdfController.getAllPdfs);
router.get('/:id', pdfController.getPdfById);
router.delete('/:id', pdfController.deletePdf);

export default router;