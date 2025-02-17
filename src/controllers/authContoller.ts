import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, confirmPassword,role } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    res.status(400).json({ message: "Passwords do not match" });
    return; // Ensure to return to prevent further execution
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return; // Ensure to return to prevent further execution
    }

    // Create a new user
    const newUser: IUser = new User({
      name,
      email,
      password,
      confirmPassword,
      role
    });

    await newUser.save();
    res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// const COOKIE_OPTIONS = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production',
//   sameSite: 'none' as const, 
//   maxAge: 24 * 60 * 60 * 1000 
// };
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
  maxAge: 24 * 60 * 60 * 1000,
};


export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid Email ID" });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid Password" });
      return;
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role },JWT_SECRET, {
      expiresIn: "7d", // Token expiration time
    });

   

   
    res.cookie("token", token);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logoutUser = (req: Request, res: Response): void => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,    // Set to true in production if using HTTPS
    sameSite: "none", // Helps prevent CSRF attacks
  });

  // Respond with a success message
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};



