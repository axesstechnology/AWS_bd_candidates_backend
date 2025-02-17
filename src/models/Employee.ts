import mongoose, { Schema, Document } from "mongoose";

// Define the ILeaves interface
export interface ILeaves extends Document {
  totalLeaves: number;
  usedLeaves: number;
  remainingLeaves: number;
  lastUpdated: Date;
}

export interface IEmployee extends Document {
  employeeId:string;
  name: string;
  designation: string;
  contact: string;
  email: string;
  bloodGroup: string;
  joiningDate: Date;
  fatherName: string;
  motherName: string;
  address: string;
  state: string;
  images: Array<{ image: string }>;
  leaves: ILeaves;
}

// Define the Profile schema
const employeeSchema: Schema = new mongoose.Schema(
  {
    employeeId:{
      type: String,
      required: [true, "Employee ID is required"],
      unique:true
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
      trim: true
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true
    },
    contact: {
      type: String,
      required: [true, "Contact is required"],
      match: [/^\d{10}$/, "Please enter a valid 10-digit contact number"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      trim: true
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"]
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      minlength: [3, "Father's name must be at least 3 characters"],
      trim: true
    },
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      minlength: [3, "Mother's name must be at least 3 characters"],
      trim: true
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true
    },
    images: [{
      image: {
        type: String,
        required: [true, "Image URL is required"]
      }
    }],
    leaves:{
      totalLeaves: {
        type: Number,
        default: 12 // Default annual leaves
      },
      usedLeaves: {
        type: Number,
        default: 0
      },
      remainingLeaves: {
        type: Number,
        default: 12
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IEmployee>("Employee", employeeSchema);