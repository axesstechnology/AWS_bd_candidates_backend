import mongoose, { Document, Types } from 'mongoose';
import { IFileUpload } from '../utils/types';


export const FileUploadSchema = new mongoose.Schema<IFileUpload>({
    originalName: { 
      type: String, 
      // required: true 
    },
    documentType: {
        type: String,
    },

    fileName: { 
      type: String, 
      // required: true 
    },
    base64: { 
      type: String, 
      // required: true 
    },
    path: { 
      type: String, 
      // required: true 
    },
    // name: {
    //   type: String
    // },
    size: { 
      type: Number, 
      // required: true 
    },
    formType: { 
      type: String, 
      enum: ['1', '1A', '2', '2A', '3', '3A'],
      // required: true 
    }
  });