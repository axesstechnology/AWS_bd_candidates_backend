import mongoose, { Schema, Document } from "mongoose";

interface ICounter extends Document {
  _id: string; // e.g., 'employeeId'
  seq: number;
}

const IDGeneratorSchema : Schema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const IDGenerator  = mongoose.model<ICounter>("IDGenerator", IDGeneratorSchema);
export default IDGenerator ;