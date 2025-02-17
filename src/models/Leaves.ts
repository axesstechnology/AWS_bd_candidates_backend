// models/LeaveRequest.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILeaveRequest extends Document {
  employeeId: string;  // Changed to string to match EMP_XXXX format
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
  numberOfDays: number;
  applicationType: "full" | "half";
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema: Schema = new mongoose.Schema(
  {
    employeeId: {
      type: String,  // Changed to String type
      required: [true, "Employee ID is required"],
      match: [/^EMP_\d{4}$/, "Please enter a valid Employee ID (EMP_XXXX format)"]
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    numberOfDays: {
      type: Number,
      required: [true, "Number of days is required"],
    },
    applicationType: {
      type: String,
      enum: ["full", "half"],
      default: "full",
    },
    adminResponse: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);