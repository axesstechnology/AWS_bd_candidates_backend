// models/UserSession.ts
import mongoose, { Document, Schema } from 'mongoose';

interface Session {
  checkInTime: Date;
  checkOutTime?: Date;
  totalLoginHours?: number;
}

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  userRole: string;
  email:string;
  sessions: Session[];
}

const sessionSchema = new Schema<Session>({
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date },
    totalLoginHours: { type: Number } // Track each session duration individually
  });
  
  const userSessionSchema = new Schema<IUserSession>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    userRole: { type: String, required: true },
    email: { type: String, required: false },
    sessions: [sessionSchema] // Each check-in/check-out gets a separate entry here
  });
  

export default mongoose.model<IUserSession>('UserSession', userSessionSchema);
