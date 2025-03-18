import { Request, Response } from "express";
import { validationResult } from "express-validator";
import fs from "fs/promises";
import path from "path";
import Candidate from "../models/BdCanditates";
import { AuditLogController } from "./auditLogcontroller";
import {
  ICreateCandidateDTO,
  IApiResponse,
  ICandidateDocument,
  IFileUpload,
  FileUploadObject,
} from "../utils/types";

const removeUploadedFiles = async (
  files: Express.Multer.File[]
): Promise<void> => {
  for (const file of files) {
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error(`Error deleting file ${file.path}:`, error);
    }
  }
};


// create cnadidate
export const createCandidate = async (
  req: Request<{}, {}, ICreateCandidateDTO>,
  res: Response<IApiResponse<ICandidateDocument>>
): Promise<void> => {
  const files = (req.files as Express.Multer.File[]) || [];

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await removeUploadedFiles(files);
      res.status(400).json({
        success: false,
        error: "Validation failed",
        data: errors.array() as any,
      });
      return;
    }

    // exisiting backdoor Id
    const existingBackdoorId = await Candidate.findOne({
      backDoorId: req.body["Back Door ID"],
    });
    if (existingBackdoorId) {
      res
        .status(400)
        .json({
          success: false,
          message: "Backdoor ID already exists.",
        });
      return;
    }

    // exisiting email
    const existingEmail = await Candidate.findOne({
      email: req.body["Candidate Mail ID"],
    });
    if (existingEmail) {
      res
        .status(400)
        .json({
          success: false,
          message: " Email already exists.",
        });
      return;
    }

    const offerInstallments = [];
    if (req.body["Did Offer Received"] === "yes") {
      for (const [key, value] of Object.entries(req.body)) {
        if (key.startsWith("offer_installment_") && value) {
          const splitNumber = parseInt(key.replace("offer_installment_", ""));
          offerInstallments.push({
            splitNumber,
            amount: Number(value),
          });
        }
      }
    }

    const offerInstallmentsPaid = [];
    if (req.body["Did Offer Received"] === "yes") {
      for (const [key, value] of Object.entries(req.body)) {
        if (key.startsWith("pending_paid_") && value) {
          const splitNumber = parseInt(key.replace("pending_paid_", ""));
          offerInstallmentsPaid.push({
            splitNumber,
            amount: Number(value),
            date: new Date(),
          });
        }
      }
    }

    const processingFees = [];
    if (req.body["Did Offer Received"] === "no") {
      for (const [key, value] of Object.entries(req.body)) {
        if (key.startsWith("processing_fee_") && value) {
          const splitNumber = parseInt(key.replace("processing_fee_", ""));
          processingFees.push({
            splitNumber,
            amount: Number(value),
          });
        }
      }
    }

    const documents = files.map((file) => ({
      name: file.originalname,
      path: file.path,
      uploadDate: new Date(),
    }));

    const InitialAmount = req.body["Initial Amount"]
      ? Number(req.body["Initial Amount"])
      : 0;
    if (isNaN(InitialAmount)) {
      res.status(400).json({
        success: false,
        error: "Initial Amount is required and must be a valid number.",
      });
    }

    const initialSplits =
      req.body.initial_splits?.map((split) => ({
        amount: isNaN(Number(split.amount)) ? 0 : Number(split.amount), // Set amount to 0 if NaN
        date:
          split.date && !isNaN(new Date(split.date).getTime())
            ? new Date(split.date)
            : null, // Set date to null if invalid
      })) || [];

    // Then use in your create/update operation

    const amountReceivedSplitUp = req.body.amountReceivedSplitUp
      ? JSON.stringify(
          req.body.amountReceivedSplitUp.map((split) => ({
            amount: Number(split.amount),
            date: new Date(split.date),
          }))
        )
      : "";

    const requiredDocuments = req.body.requiredDocuments || [];

    const formUploads: IFileUpload[] = [];

    if (req.body["Forms"]) {
      const forms: string[] = req.body["Forms"];
      forms.forEach((form) => {
        const fileKey = `File Upload ${form}` as keyof ICreateCandidateDTO;
        const fileData = req.body[fileKey] as FileUploadObject;

        if (fileData) {
          const fileUpload: IFileUpload = {
            originalName:
              fileData.file?.name ||
              fileData.name ||
              `Form_${form}_${Date.now()}`,
            fileName:
              fileData.file?.name ||
              fileData.name ||
              `Form_${form}_${Date.now()}`,
            base64:
              fileData.file?.response?.base64 ||
              fileData.response?.base64 ||
              "",
            path: "",
            size: fileData.file?.size || fileData.size || 0,
            formType: form,
            documentType:
              fileData.file?.name ||
              fileData.name ||
              `Form_${form}_${Date.now()}`,
          };

          // Additional validation to ensure base64 is present
          if (fileUpload.base64) {
            formUploads.push(fileUpload);
          }
        }
      });
    }

    const candidateData = {
      backDoorId: req.body["Back Door ID"],
      fullName: req.body["Candidate Full Name"],
      class: req.body["radio-button"],
      other_domain:
        req.body["radio-button"] === "others"
          ? req.body["other_domain"] ?? null
          : null,
      agentName: req.body["agentName"],
      joiningMonth: req.body["joiningMonth"],
      isActive: req.body.switch,
      jobType: req.body["Need Job Type"],
      inactivereason: req.body["In Active Reason"],
      phoneNumber: req.body.phone,
      email: req.body["Candidate Mail ID"],
      stage: req.body["stage"] ?? null,
      // amountReceived: new Date(req.body['Amount Received']),
      totalAmount: isNaN(Number(req.body["Total Amount"]))
        ? 0
        : Number(req.body["Total Amount"]), // Updated line,
      amountReceivedSplitUp,
      InitialAmount,
      initialAmountReceived: req.body["Initial Amount Received"] === "yes",
      modeOfPayment: req.body["Mode of Payment"],
      // isEMI: req.body['Is EMI'] === 'yes',
      atTimeOfOffer: req.body["At Time of Offer"],
      // offerPaymentDate: new Date(req.body['At Time of Offer Payment Paid Date']),
      loan: req.body["Loan"] === "yes",
      profilecreated: req.body["Profile Created"] === "yes",
      // profileCreatedOn: req.body["Profile Created On"] ? new Date(req.body["Profile Created On"]) : undefined,
      profileCreatedOn: req.body["Profile Created On"]
        ? new Date(req.body["Profile Created On"])
        : null,
      profilecreatedBy: req.body["Profile Created By"],
      videoshooted: req.body["Video Shooted"] === "yes",
      modelready: req.body["Model Ready"] === "yes",
      onboarded: req.body.onboarded,
      initial_splits: initialSplits,
      // loanSanctionAmount:
      //   req.body["Loan"] === "yes"
      //     ? Number(req.body["Loan Sanction Amount"])
      //     : undefined,
      loanSanctionAmount:
        req.body["Loan"] === "yes"
          ? Number(req.body["Loan Sanction Amount"])
          : null,
      balanceAmount:
        req.body["Loan"] === "yes" ? Number(req.body["Balance Amount"]) : null,
      formUploads,
      didOfferReceived: req.body["Did Offer Received"] === "yes",
      offerInstallments,
      offerInstallmentsPaid,
      paymentForInterview: req.body["payment_for_interview"],
      paymentForDocuments: req.body["payment_for_documents"],
      paymentForOffer: req.body["payment_for_offer"],
      processingFees,
      requiredDocuments,
      dateOfOffer: req.body["Date of Offer"]
        ? new Date(req.body["Date of Offer"])
        : null,
      // emiDetails,
      referredBy: req.body["Referred By"],
      BDcategory: req.body["BD category"] ? req.body["BD category"] : "",
      nonSubmissionReason: req.body.nonSubmissionReason,
      documentsSubmitted: req.body["Documents Submitted"] === "yes",
      documents,
      comments: req.body["Comments"] || "",
      agreement: req.body["Agreement"] === "yes",
      agreementDate:
        req.body["Agreement"] === "yes"
          ? new Date(req.body["Agreement Date"] ?? "")
          : null,
      // agreementDate:
      //   req.body["Agreement"] === "yes"
      //     ? new Date(req.body["Agreement Date"] ?? "")
      //     : null,
      agreementDocument: req.body.agreementDocument,
      acknowledgementDocument: req.body.acknowledgementDocument,
      forms: req.body["Forms"] || [],
      paymentforofferdate: req.body["payment_for_offer_date"]
        ? new Date(req.body["payment_for_offer_date"])
        : null,
      paymentforinterviewdate: req.body["Payment_for_Interview_Date"]
        ? new Date(req.body["Payment_for_Interview_Date"])
        : null,
      paymentfordocumentsdate: req.body["Payment_for_Documents_Date"]
        ? new Date(req.body["Payment_for_Documents_Date"])
        : null,
      acknowledgement: req.body["Acknowledgement"] === "yes",
      acknowledgementDate:
        req.body["Acknowledgement"] === "yes"
          ? new Date(req.body["Acknowledgement Date"] ?? "")
          : null,
      // fileUploads,
      // createdby: req?.user?.id,
      updatedBy: req?.user?.id,
    };

    const candidate = new Candidate(candidateData); 
    await candidate.save();

    res.status(201).json({
      status: "success",
      success: true,
      message: "Candidate created successfully",
      data: candidate,
    });
  } catch (error) {
    await removeUploadedFiles(files);
    if (!res.headersSent) {
      // Check if headers have been sent already
      res.status(500).json({
        success: false,
        message: "Error creating candidate",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
};

export const updateCandidate = async (
  req: Request<{ id: string }, {}, Partial<ICreateCandidateDTO>>,
  res: Response<IApiResponse<ICandidateDocument>>
): Promise<void> => {
  const files = (req.files as Express.Multer.File[]) || [];

  try {
    // Find existing candidate
    const existingCandidate = await Candidate.findById(req.params.id);
    if (!existingCandidate) {
      await removeUploadedFiles(files);
      res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
      return;
    }

    // Process documents if new ones are uploaded
    if (files.length > 0) {
      try {
        // Remove old documents from filesystem
        for (const doc of existingCandidate.documents) {
          try {
            await fs.unlink(doc.path);
          } catch (error) {
            console.error(`Error deleting old file ${doc.path}:`, error);
          }
        }

        // Add new documents
        const newDocuments = files.map((file) => ({
          name: file.originalname,
          path: file.path,
          uploadDate: new Date(),
        }));
        req.body.documents = newDocuments;
      } catch (error) {
        await removeUploadedFiles(files);
        throw new Error("Error processing document files");
      }
    }

    // Process EMI details if present
    if (req.body["Is EMI"] === "yes") {
      const emiDetails = [];
      for (let i = 1; i <= 10; i++) {
        const emiAmount = req.body[`EMI - ${i}` as keyof ICreateCandidateDTO];
        if (emiAmount) {
          emiDetails.push({
            emiNumber: i,
            amount: Number(emiAmount),
            status: "pending",
          });
        }
      }
      req.body.emiDetails = emiDetails;
    }

    // Process offer installments if present
    if (req.body["Did Offer Received"] === "yes") {
      // Handle offer installments
      const offerInstallments = [];
      for (const [key, value] of Object.entries(req.body)) {
        if (key.startsWith("offer_installment_") && value) {
          const splitNumber = parseInt(key.replace("offer_installment_", ""));
          offerInstallments.push({
            splitNumber,
            amount: Number(value),
            status: "pending",
          });
        }
      }
      req.body.offerInstallments = offerInstallments;

      if (req.body["Did Offer Received"] === "yes") {
        const offerInstallmentsPaid = [];
        for (const [key, value] of Object.entries(req.body)) {
          if (key.startsWith("pending_paid_") && value) {
            const splitNumber = parseInt(key.replace("pending_paid_", ""));
            offerInstallmentsPaid.push({
              splitNumber,
              amount: Number(value),
              date: new Date().toISOString(),
            });
          }
        }
        req.body.offerInstallmentsPaid = offerInstallmentsPaid;
      }
    }

    // Process processing fees if offer not received
    if (req.body["Did Offer Received"] === "no") {
      const processingFees = [];
      for (const [key, value] of Object.entries(req.body)) {
        if (key.startsWith("processing_fee_") && value) {
          const splitNumber = parseInt(key.replace("processing_fee_", ""));
          processingFees.push({
            splitNumber,
            amount: Number(value),
            status: "pending",
          });
        }
      }
      req.body.processingFees = processingFees;
    }

    
    
    

    // Prepare update data
    const updatedData = {
      ...req.body,
      updatedBy: req?.user?.id,
      updatedAt: new Date(),
    };

    console.log(updatedData, "updatedData");
    // Track changes before updating
    const changes = AuditLogController.trackChanges(
      existingCandidate,
      updatedData
    );

    // Update candidate
    const updatedCandidate = await Candidate.findByIdAndUpdate (
      req.params.id,
      { $set: updatedData, },
      { new: true, runValidators: true }
    ).populate("updatedBy", "name email");

    if (!updatedCandidate) {
      throw new Error("Failed to update candidate");
    }

    // Create audit log if there are changes
    if (changes.length > 0) {
      await AuditLogController.createAuditLog(
        req.params.id,
        "Candidate",
        "UPDATE",
        changes,
        req?.user?.id ?? ""
      );
    }

    // Send successful response
    res.status(200).json({
      success: true,
      message: "Candidate updated successfully",
      data: updatedCandidate,
    });
  } catch (error) {
    // Clean up any uploaded files in case of error
    await removeUploadedFiles(files);

    // Send error response
    res.status(500).json({
      success: false,
      message: "Error updating candidate",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
export const getAllCandidates = async (
  req: Request,
  res: Response<IApiResponse<ICandidateDocument[]>>
): Promise<void> => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: candidates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving candidates",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const getCandidateById = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse<ICandidateDocument>>
): Promise<void> => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate(
      "updatedBy",
      "email"
    );
    if (!candidate) {
      res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Candidate retrieved successfully",
      data: candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving candidate",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const getCandidatesByIds = async (
  req: Request,
  res: Response<IApiResponse<ICandidateDocument[]>>
): Promise<void> => {
  try {
    const { ids } = req.body; // Extract 'ids' from the request body

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        success: false,
        message: "Invalid input. Please provide an array of candidate IDs.",
      });
      return;
    }

    // Fetch candidates by IDs
    const candidates = await Candidate.find({ _id: { $in: ids } });

    // Check if any candidates are found
    if (candidates.length === 0) {
      res.status(404).json({
        success: false,
        message: "No candidates found for the provided IDs.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: candidates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving candidates",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const getCandidatesByBDCategory = async (
  req: Request<{ category: string }>, // Category parameter in URL
  res: Response<IApiResponse<ICandidateDocument[]>>
): Promise<void> => {
  try {
    const { category } = req.params; // Extract the category from URL parameter

    // Find all candidates where the BDcategory matches the provided category
    const candidates = await Candidate.find({ BDcategory: category }) // Assuming BDcategory is a string
      .populate("updatedBy", "email") // Optionally populate other fields
      .exec();

    if (candidates.length === 0) {
      res.status(404).json({
        success: false,
        message: `No candidates found for BD category: ${category}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: candidates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving candidates by BD category",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const deleteCandidate = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse<null>>
): Promise<void> => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
      return;
    }

    // Remove document files from filesystem
    for (const doc of candidate.documents) {
      try {
        await fs.unlink(doc.path);
      } catch (error) {
        console.error(`Error deleting file ${doc.path}:`, error);
      }
    }

    await Candidate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Candidate deleted successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting candidate",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
