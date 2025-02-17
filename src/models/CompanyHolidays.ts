import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
  title: string;
  date: string;
  type: string;
  description: string;
}


const HolidaySchema: Schema = new Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
  }, { timestamps: true });
  

export default mongoose.model<IHoliday>('CompanyHoliday', HolidaySchema);