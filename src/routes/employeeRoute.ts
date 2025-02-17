// routes/candidateRoutes.ts

import express from "express";

import multer from "multer";
import path from "path";
import fs from "fs";
import { addEmployees, deleteEmployee, getAllEmployeeIds, getAllEmployees, getEmployeeById, searchEmployees, updateEmployee } from "../controllers/employeeController";

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, "../uploads/candidates");
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."));
    }
  }
});

// Routes
router.post("/add", upload.array("images"), addEmployees);
router.get("/", getAllEmployees);
router.get("/search", searchEmployees);
router.get("/:id", getEmployeeById);
router.put("/update/:id", upload.array("images"), updateEmployee);
router.delete("/delete/:id", deleteEmployee);
router.get('/employee_ids',getAllEmployeeIds)
export default router;