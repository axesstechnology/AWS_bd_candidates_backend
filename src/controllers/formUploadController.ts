// import { Request, Response } from "express";
// import fs from "fs/promises";
// import path from "path";
// import multer from "multer";
// import Candidate from "../models/BdCanditates";
// import { IApiResponse, IFileUpload } from "../utils/types";

// // Configure multer storage for PDF files
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, "../uploads/pdfs");
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     const ext = path.extname(file.originalname);
//     cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//   },
// });

// // PDF file filter
// const pdfFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//   if (file.mimetype === "application/pdf") {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF files are allowed"));
//   }
// };

// // Create multer upload instance
// export const upload = multer({
//   storage,
//   fileFilter: pdfFileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
// });

// // Helper function to remove uploaded files in case of error
// const removeUploadedFiles = async (files: Express.Multer.File[]): Promise<void> => {
//   for (const file of files) {
//     try {
//       await fs.unlink(file.path);
//     } catch (error) {
//       console.error(`Error deleting file ${file.path}:`, error);
//     }
//   }
// };

// // Upload multiple PDFs for a candidate
// export const uploadMultiplePdfs = async (
//   req: Request,
//   res: Response<IApiResponse<IFileUpload[]>>
// ): Promise<void> => {
//   const files = req.files as Express.Multer.File[];
//   const { candidateId } = req.body;
  
//   // Check if files were uploaded
//   if (!files || files.length === 0) {
//     res.status(400).json({
//       success: false,
//       message: "No files uploaded",
//     });
//     return;
//   }

//   try {
//     // Find the candidate
//     const candidate = await Candidate.findById(candidateId);
//     if (!candidate) {
//       await removeUploadedFiles(files);
//       res.status(404).json({
//         success: false,
//         message: "Candidate not found",
//       });
//       return;
//     }

//     // Process each file
//     const uploadedFiles: IFileUpload[] = [];
    
//     for (const file of files) {
//       // Get metadata for this specific file
//       const fileIndex = files.indexOf(file);
//       const formType = req.body[`formType_${fileIndex}`] || "";
//       const documentType = req.body[`documentType_${fileIndex}`] || "pdf";
      
//       // Create file upload object
//       const fileUpload: IFileUpload = {
//         originalName: file.originalname,
//         fileName: file.filename,
//         base64: "", // File is stored on disk, not as base64
//         path: file.path,
//         size: file.size,
//         formType: formType,
//         documentType: documentType,
//       };

//       // Add to candidate's appropriate array
//       if (formType) {
//         // If it's a form, add to formUploads
//         candidate.formUploads.push(fileUpload);
//       } else {
//         // Otherwise add to documents
//         candidate.documents.push({
//           name: file.originalname,
//           path: file.path,
//           uploadDate: new Date(),
//         });
//       }

//       uploadedFiles.push(fileUpload);
//     }

//     // Save changes to candidate
//     await candidate.save();

//     res.status(200).json({
//       success: true,
//       message: `${files.length} PDFs uploaded successfully`,
//       data: uploadedFiles,
//     });
//   } catch (error) {
//     await removeUploadedFiles(files);
//     res.status(500).json({
//       success: false,
//       message: "Error uploading PDFs",
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     });
//   }
// };

// // Upload a single PDF (keeping the original method for backward compatibility)
// export const uploadPdf = async (
//   req: Request,
//   res: Response<IApiResponse<IFileUpload>>
// ): Promise<void> => {
//   const file = req.file;
//   const { candidateId, formType, documentType } = req.body;

//   if (!file) {
//     res.status(400).json({
//       success: false,
//       message: "No file uploaded",
//     });
//     return;
//   }

//   try {
//     // Find the candidate
//     const candidate = await Candidate.findById(candidateId);
//     if (!candidate) {
//       await fs.unlink(file.path);
//       res.status(404).json({
//         success: false,
//         message: "Candidate not found",
//       });
//       return;
//     }

//     // Create file upload object
//     const fileUpload: IFileUpload = {
//       originalName: file.originalname,
//       fileName: file.filename,
//       base64: "", // File is stored on disk, not as base64
//       path: file.path,
//       size: file.size,
//       formType: formType || "",
//       documentType: documentType || "pdf",
//     };

//     // Add to candidate's formUploads array
//     if (formType) {
//       // If it's a form, add to formUploads
//       candidate.formUploads.push(fileUpload);
//     } else {
//       // Otherwise add to documents
//       candidate.documents.push({
//         name: file.originalname,
//         path: file.path,
//         uploadDate: new Date(),
//       });
//     }

//     await candidate.save();

//     res.status(200).json({
//       success: true,
//       message: "PDF uploaded successfully",
//       data: fileUpload,
//     });
//   } catch (error) {
//     await fs.unlink(file.path);
//     res.status(500).json({
//       success: false,
//       message: "Error uploading PDF",
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     });
//   }
// };

// // Get PDF by ID
// export const getPdfById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { candidateId, fileId } = req.params;

//   try {
//     const candidate = await Candidate.findById(candidateId);
//     if (!candidate) {
//       res.status(404).json({
//         success: false,
//         message: "Candidate not found",
//       });
//       return;
//     }

//     // Search in formUploads
//     const formUpload = candidate.formUploads.find(
//       (upload) => upload._id.toString() === fileId
//     );

//     // Search in documents if not found in formUploads
//     const document = !formUpload 
//       ? candidate.documents.find((doc) => doc._id.toString() === fileId)
//       : null;

//     if (!formUpload && !document) {
//       res.status(404).json({
//         success: false,
//         message: "PDF not found",
//       });
//       return;
//     }

//     const filePath = formUpload ? formUpload.path : document!.path;

//     // Check if file exists
//     try {
//       await fs.access(filePath);
//     } catch (error) {
//       res.status(404).json({
//         success: false,
//         message: "PDF file not found on server",
//       });
//       return;
//     }

//     // Set appropriate headers
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `inline; filename="${formUpload ? formUpload.originalName : document!.name}"`
//     );

//     // Stream the file
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error retrieving PDF",
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     });
//   }
// };

// // Delete PDF
// export const deletePdf = async (
//   req: Request,
//   res: Response<IApiResponse<null>>
// ): Promise<void> => {
//   const { candidateId, fileId } = req.params;

//   try {
//     const candidate = await Candidate.findById(candidateId);
//     if (!candidate) {
//       res.status(404).json({
//         success: false,
//         message: "Candidate not found",
//       });
//       return;
//     }

//     // Search in formUploads
//     const formUploadIndex = candidate.formUploads.findIndex(
//       (upload) => upload._id.toString() === fileId
//     );

//     if (formUploadIndex !== -1) {
//       // Found in formUploads
//       const filePath = candidate.formUploads[formUploadIndex].path;
      
//       // Remove from filesystem
//       await fs.unlink(filePath);
      
//       // Remove from array
//       candidate.formUploads.splice(formUploadIndex, 1);
//       await candidate.save();
      
//       res.status(200).json({
//         success: true,
//         message: "PDF deleted successfully",
//         data: null,
//       });
//       return;
//     }

//     // Search in documents if not found in formUploads
//     const documentIndex = candidate.documents.findIndex(
//       (doc) => doc._id.toString() === fileId
//     );

//     if (documentIndex !== -1) {
//       // Found in documents
//       const filePath = candidate.documents[documentIndex].path;
      
//       // Remove from filesystem
//       await fs.unlink(filePath);
      
//       // Remove from array
//       candidate.documents.splice(documentIndex, 1);
//       await candidate.save();
      
//       res.status(200).json({
//         success: true,
//         message: "PDF deleted successfully",
//         data: null,
//       });
//       return;
//     }

//     // Not found in either array
//     res.status(404).json({
//       success: false,
//       message: "PDF not found",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error deleting PDF",
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     });
//   }
// };

// // Delete multiple PDFs
// export const deleteMultiplePdfs = async (
//   req: Request,
//   res: Response<IApiResponse<null>>
// ): Promise<void> => {
//   const { candidateId } = req.params;
//   const { fileIds } = req.body;

//   if (!Array.isArray(fileIds) || fileIds.length === 0) {
//     res.status(400).json({
//       success: false,
//       message: "No file IDs provided",
//     });
//     return;
//   }

//   try {
//     const candidate = await Candidate.findById(candidateId);
//     if (!candidate) {
//       res.status(404).json({
//         success: false,
//         message: "Candidate not found",
//       });
//       return;
//     }

//     const deletedFiles = [];
//     const errors = [];

//     for (const fileId of fileIds) {
//       // Search in formUploads
//       const formUploadIndex = candidate.formUploads.findIndex(
//         (upload) => upload._id.toString() === fileId
//       );

//       if (formUploadIndex !== -1) {
//         // Found in formUploads
//         try {
//           const filePath = candidate.formUploads[formUploadIndex].path;
//           await fs.unlink(filePath);
//           candidate.formUploads.splice(formUploadIndex, 1);
//           deletedFiles.push(fileId);
//         } catch (error) {
//           errors.push({ fileId, error: "Error deleting form upload" });
//         }
//         continue;
//       }

//       // Search in documents
//       const documentIndex = candidate.documents.findIndex(
//         (doc) => doc._id.toString() === fileId
//       );

//       if (documentIndex !== -1) {
//         // Found in documents
//         try {
//           const filePath = candidate.documents[documentIndex].path;
//           await fs.unlink(filePath);
//           candidate.documents.splice(documentIndex, 1);
//           deletedFiles.push(fileId);
//         } catch (error) {
//           errors.push({ fileId, error: "Error deleting document" });
//         }
//       } else {
//         errors.push({ fileId, error: "File not found" });
//       }
//     }

//     // Save changes to candidate
//     await candidate.save();

//     res.status(200).json({
//       success: true,
//       message: `${deletedFiles.length} PDFs deleted successfully${errors.length > 0 ? `, ${errors.length} errors occurred` : ''}`,
//       data: null,
//       errors: errors.length > 0 ? errors : undefined,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error deleting PDFs",
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     });
//   }
// };

// // Get all PDFs for a candidate
// export const getCandidatePdfs = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { candidateId } = req.params;

//   try {
//     const candidate = await Candidate.findById(candidateId);
//     if (!candidate) {
//       res.status(404).json({
//         success: false,
//         message: "Candidate not found",
//       });
//       return;
//     }

//     // Combine formUploads and documents
//     const pdfs = [
//       ...candidate.formUploads.map(upload => ({
//         id: upload._id,
//         name: upload.originalName,
//         type: "form",
//         formType: upload.formType,
//         documentType: upload.documentType,
//         size: upload.size,
//         uploadDate: upload.createdAt || new Date()
//       })),
//       ...candidate.documents.map(doc => ({
//         id: doc._id,
//         name: doc.name,
//         type: "document",
//         uploadDate: doc.uploadDate
//       }))
//     ];

//     res.status(200).json({
//       success: true,
//       message: "PDFs retrieved successfully",
//       data: pdfs
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error retrieving PDFs",
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     });
//   }
// };