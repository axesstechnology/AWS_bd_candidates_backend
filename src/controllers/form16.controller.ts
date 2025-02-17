import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import  Pdf  from '../models/form16.model';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${fileName}`);
  }
});


// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      // cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('pdfFile'); 

const pdfController = {
  // Upload a PDF file
  uploadPdf: async (req: Request, res: Response): Promise<void> => {
    // Handle file upload using multer
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json({
          message: err.code === 'LIMIT_FILE_SIZE' 
            ? 'File size is too large. Max limit is 5MB'
            : err.message
        });
        return;
      } else if (err) {
        res.status(400).json({ message: err.message });
        return;
      }

      try {
        if (!req.file) {
          res.status(400).json({ message: 'No file uploaded' });
          return;
        }

        const newPdf = new Pdf({
          title: req.body.title || req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        });

        const savedPdf = await newPdf.save();
        res.status(201).json({
          message: 'PDF uploaded successfully',
          pdf: savedPdf
        });
      } catch (error: any) {
        res.status(500).json({
          message: 'Error uploading PDF',
          error: error.message
        });
      }
    });
  },

  // Get all PDFs
  getAllPdfs: async (req: Request, res: Response): Promise<void> => {
    try {
      const pdfs = await Pdf.find();
      res.status(200).json(pdfs);
    } catch (error: any) {
      res.status(500).json({
        message: 'Error fetching PDFs',
        error: error.message
      });
    }
  },

  // Get PDF by ID
  getPdfById: async (req: Request, res: Response): Promise<void> => {
    try {
      const pdf = await Pdf.findById(req.params.id);
      if (!pdf) {
        res.status(404).json({ message: 'PDF not found' });
        return;
      }
      res.status(200).json(pdf);
    } catch (error: any) {
      res.status(500).json({
        message: 'Error fetching PDF',
        error: error.message
      });
    }
  },

  // Delete PDF
  deletePdf: async (req: Request, res: Response): Promise<void> => {
    try {
      const pdf = await Pdf.findById(req.params.id);
      if (!pdf) {
        res.status(404).json({ message: 'PDF not found' });
        return;
      }

      try {
        await fs.promises.unlink(pdf.path);
        await Pdf.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'PDF deleted successfully' });
      } catch (err: any) {
        res.status(500).json({
          message: 'Error deleting PDF file',
          error: err.message
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: 'Error deleting PDF',
        error: error.message
      });
    }
  }
};

export default pdfController;