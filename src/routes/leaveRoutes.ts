
import express from "express";
import {
  applyForLeave,
  getAllLeaveRequests,
  getEmployeeLeaveRequests,
  getLeaveBalance,
  updateLeaveStatus,
} from "../controllers/leavesController";


const router = express.Router()

// routes/leaveRoutes.ts
router.post("/apply", applyForLeave);
router.get("/requests", getAllLeaveRequests);
router.get("/requests/:employeeId", getEmployeeLeaveRequests);
router.put("/requests/:leaveId", updateLeaveStatus);
router.get("/balance/:employeeId", getLeaveBalance);


export default router;