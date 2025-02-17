
// controllers/leaveController.ts
import { Request, Response } from "express";
import Employee from "../models/Employee";
import LeaveRequest from "../models/Leaves";

// Apply for leave
export const applyForLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, startDate, endDate, reason, applicationType } = req.body;

    // Validate the employee exists using employeeId string
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const numberOfDays = applicationType === "half" ? diffDays / 2 : diffDays;

    // Check if employee has enough leaves
    if (employee.leaves.remainingLeaves < numberOfDays) {
      res.status(400).json({ 
        message: "Insufficient leave balance",
        remainingLeaves: employee.leaves.remainingLeaves 
      });
      return;
    }

    // Create new leave request
    const leaveRequest = new LeaveRequest({
      employeeId,
      startDate,
      endDate,
      reason,
      numberOfDays,
      applicationType
    });

    await leaveRequest.save();

    res.status(201).json({
      message: "Leave request submitted successfully",
      data: leaveRequest,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};

// Get all leave requests (for admin)
export const getAllLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaveRequests = await LeaveRequest.find().sort({ createdAt: -1 });

    // Get employee details for each leave request
    const leaveRequestsWithEmployeeDetails = await Promise.all(
      leaveRequests.map(async (request) => {
        const employee = await Employee.findOne(
          { employeeId: request.employeeId },
          'name email'
        );
        return {
          ...request.toObject(),
          employeeDetails: employee
        };
      })
    );

    res.status(200).json({
      message: "success",
      data: leaveRequestsWithEmployeeDetails,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};

// Get leave requests for a specific employee
export const getEmployeeLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const leaveRequests = await LeaveRequest.find({ employeeId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "success",
      data: leaveRequests,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};

// Admin approve/reject leave request
export const updateLeaveStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaveId } = req.params;
    const { status, adminResponse } = req.body;

    const leaveRequest = await LeaveRequest.findById(leaveId);
    if (!leaveRequest) {
      res.status(404).json({ message: "Leave request not found" });
      return;
    }

    // Only process if the status is changing
    if (leaveRequest.status === "pending" && (status === "approved" || status === "rejected")) {
      const employee = await Employee.findOne({ employeeId: leaveRequest.employeeId });
      if (!employee) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }

      if (status === "approved") {
        // Update employee's leave balance
        const newUsedLeaves = employee.leaves.usedLeaves + leaveRequest.numberOfDays;
        const newRemainingLeaves = employee.leaves.totalLeaves - newUsedLeaves;

        // Update employee leave details
        await Employee.findOneAndUpdate(
          { employeeId: leaveRequest.employeeId },
          {
            'leaves.usedLeaves': newUsedLeaves,
            'leaves.remainingLeaves': newRemainingLeaves,
            'leaves.lastUpdated': new Date()
          }
        );
      }

      // Update leave request status
      leaveRequest.status = status;
      leaveRequest.adminResponse = adminResponse;
      await leaveRequest.save();

      res.status(200).json({
        message: `Leave request ${status}`,
        data: leaveRequest,
      });
    } else {
      res.status(400).json({ 
        message: "Invalid status update request" 
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};

// Get leave balance for an employee
export const getLeaveBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId });
    
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    res.status(200).json({
      message: "success",
      data: {
        totalLeaves: employee.leaves.totalLeaves,
        usedLeaves: employee.leaves.usedLeaves,
        remainingLeaves: employee.leaves.remainingLeaves,
        lastUpdated: employee.leaves.lastUpdated
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown server error" });
    }
  }
};