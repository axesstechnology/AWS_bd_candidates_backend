import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

// Define the IUser interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the User schema
const userSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    role:{
      type: String,
      enum: ["superAdmin", "admin"],
      default: "admin"
    }
  },
  { timestamps: true }
);


// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt); // Use this.password
  next();
});

// Compare password method to validate password during login
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.generateAuthToken = function(): string {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role,
      employeeId: this.employeeId 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
};

// Export the User model
export default mongoose.model<IUser>("User", userSchema);
