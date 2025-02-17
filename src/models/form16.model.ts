import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the document
interface IPdf extends Document {
  title: string;
  filename: string;
  path: string;
  size: number;
  uploadDate?: Date;
}

// Define the schema
const pdfSchema = new Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'form16' // Explicitly specify the collection name
});
// Export the model with the correct typing
export default mongoose.model<IPdf>('Pdf', pdfSchema);