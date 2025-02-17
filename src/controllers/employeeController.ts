// controllers/candidateController.ts

import { Request, Response } from "express";
import Employee, { IEmployee } from "../models/Employee";
import fs from "fs";
import path from "path";
import IDGenerator from "../models/IDGenerator ";



// Function to generate a unique employee ID
const generateEmployeeId = async (): Promise<string> => {
  const counter = await IDGenerator.findByIdAndUpdate(
    { _id: "employeeId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // Create a new counter if it doesn't exist
  );

  const prefix = "EMP";
  const idNumber = counter ? counter.seq : 1; // Defaults to 1 if no counter found
  return `${prefix}_${idNumber.toString().padStart(4, "0")}`; // e.g., EMP-0001
};

// Create - Add new candidate
export const addEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      designation,
      contact,
      email,
      bloodGroup,
      joiningDate,
      fatherName,
      motherName,
      address,
      state
    } = req.body;

    const images: Array<{ image: string }> = [];
    const BASE_URL = process.env.BACKEND_URL;

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file: Express.Multer.File) => {
        const url = `${BASE_URL}/uploads/candidates/${file.filename}`;
        images.push({ image: url });
      });
    }

    if (!name || !designation || !contact || !email || !bloodGroup || !joiningDate || !fatherName || !motherName || !address || !state) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    const existingProfile = await Employee.findOne({ email });
    if (existingProfile) {
      res.status(400).json({ message: "Employee with this email already exists." });
      return;
    }

    const employeeId = await generateEmployeeId();

    const newEmployee: IEmployee = new Employee({
      employeeId,
      name,
      designation,
      contact,
      email,
      bloodGroup,
      joiningDate,
      fatherName,
      motherName,
      address,
      state,
      images,
      leaves: {
        totalLeaves: 12,
        usedLeaves: 0,
        remainingLeaves: 12
      }
    });

    await newEmployee.save();

    res.status(201).json({
      message: "success",
      data: newEmployee,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};



// Read - Get all candidates
export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "success",
      data: employees,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};

// Read - Get single employee by ID
export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404).json({ message: "Candidate not found" });
      return;
    }
    res.status(200).json({
      message: "success",
      data: employee,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};

// Update - Update candidate
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = req.params.id;
    const updateData = req.body;
    const images: Array<{ image: string }> = [];
    const BASE_URL = process.env.BACKEND_URL;

    // Handle new image uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file: Express.Multer.File) => {
        const url = `${BASE_URL}/uploads/candidates/${file.filename}`;
        images.push({ image: url });
      });
      updateData.images = images;
    }

    // If updating email, check if it already exists for another candidate
    if (updateData.email) {
      const existingProfile = await Employee.findOne({ 
        email: updateData.email,
        _id: { $ne: employeeId }
      });
      if (existingProfile) {
        res.status(400).json({ message: "Email already exists for another employee" });
        return;
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    res.status(200).json({
      message: "success",
      data: updatedEmployee,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};

// Delete - Delete candidate
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    // Delete associated images from the filesystem
    employee.images.forEach(img => {
      const imagePath = img.image.replace(`${process.env.BACKEND_URL}/uploads/candidates/`, '');
      const fullPath = path.join(__dirname, '../uploads/candidates', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};

// Search candidates
export const searchEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    if (!query) {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    const searchRegex = new RegExp(String(query), 'i');

    const candidates = await Employee.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { designation: searchRegex },
        { bloodGroup: searchRegex },
        { state: searchRegex }
      ]
    });

    res.status(200).json({
      message: "success",
      data: candidates,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};


// Read - Get all employee IDs
export const getAllEmployeeIds = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find({}, { employeeId: 1, _id: 0 }); // Fetch only employeeId
    const employeeIds = employees.map(employee => employee.employeeId);
    
    res.status(200).json({
      message: "success",
      data: employeeIds,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};