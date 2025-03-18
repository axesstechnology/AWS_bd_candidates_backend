import mongoose, { Document, Types } from 'mongoose';
import { FileUploadSchema } from '../models/FileUploadModel';

export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?:string
}

export interface IFileUpload {
  originalName: string;
  fileName: string;
  base64: string;
  path?: string;
  size?: number;
  formType?: string;
  documentType: string;
  // name: string;
}

export interface FileUploadObject {
  file?: {
    uid: string;
    name: string;
    type: string;
    size: number;
    lastModified?: number;
    lastModifiedDate?: string;
    originFileObj?: { uid: string };
    status?: string;
    response?: {
      base64?: string;
      name?: string;
    };
  };
  response?: {
    base64?: string;
  };
  name?: string;
  type?: string;
  size?: number;
}

export interface ICandidate {
  backDoorId: string;
  fullName: string;
  class: 'software_engineering' | 'software_testing' | 'others';
  other_domain :string;
  stage: string;
  isActive: boolean;
  jobType: 'Hybrid' | 'Remote' | 'Office';
  agentName: string;
  joiningMonth: Date;
  phoneNumber: string;
  email: string;
  profilecreated: boolean;
  profileCreatedOn: Date;
  profilecreatedBy: string;
  amountReceived: Date;
  totalAmount: number;
  amountReceivedSplitUp: string;
  InitialAmount: number;
  initialAmountReceived: boolean;
  modeOfPayment: 'cash' | 'online' | 'Not Applicable' | 'loan';
  isEMI: boolean;
  atTimeOfOffer: string;
  videoshooted: boolean;
  videoShootedDate:Date;
  modelready: boolean;
  modelCreatedDate:Date;
  // offerPaymentDate: Date;
  loan: boolean;
  onboarded: boolean;
  loanSanctionAmount?: number;
  balanceAmount?: number;
  didOfferReceived: boolean;
  offerInstallments?: Array<{
    splitNumber: number;
    amount: number;
  }>;
  offerInstallmentsPaid?: Array<{
    splitNumber: number;
    amount: number;
  }>;
  initial_splits: Array<{
    amount: number;
    date: Date;
  }>;
  paymentForInterview?: string;
  paymentForDocuments?: string;
  paymentForOffer?: string;
  processingFees?: Array<{
    splitNumber: number;
    amount: number;
  }>;
  dateOfOffer: Date;
  emiDetails: Array<{
    emiNumber: number;
    amount: number;
  }>;
  referredBy: string;
  BDcategory: string;
  nonSubmissionReason: string;
  inactivereason: string;
  documentsSubmitted: boolean;
  documents: Array<{
    name: string;
    path: string;
    uploadDate: Date;
  }>;
  requiredDocuments: string[]; 
  comments: string;
  agreement: boolean;
  agreementDate?: Date;
  paymentforinterviewdate: Date;
  paymentforofferdate: Date;
  paymentfordocumentsdate: Date;
  forms?: string[];
  formUploads: [typeof FileUploadSchema];
  acknowledgement: boolean;
  acknowledgementDate: Date;
  createdAt?: Date;
  updatedby?:string;
  createdBy?: string;
  updatedDate?: Date;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  message:string
}

export interface ICandidateDocument extends ICandidate, Document {}

export interface ICreateCandidateDTO {
  'Back Door ID': string;
  'Candidate Full Name': string;
  'In Active Reason': string;
  'radio-button': 'software_engineering' | 'software_testing' | 'others';
  'other_domain': string;
  'stage':string;
  'switch': boolean;
  'Need Job Type': 'Hybrid' | 'Remote' | 'Office';
  'agentName': string;
  'joiningMonth': Date;
  'phone': string;
  'Candidate Mail ID': string;
  "Profile Created": 'yes' | 'no';
  'Model Ready': 'yes' | 'no';
  'Video Shooted': 'yes' | 'no';
  // 'Amount Received': string;
  'Total Amount': number;
  // 'Initial Amount Received by Split Up': string;
  'Initial Amount': number;
  'Initial Amount Received': 'yes' | 'no';
  "amountReceivedSplitUp"?: Array<{ amount: number; date: string }>;
  "InitialAmount":number,
  'Mode of Payment': 'cash' | 'online' | 'Not Applicable';
  'Is EMI': 'yes' | 'no';
  'At Time of Offer': string;
  'payment_for_offer': string;
  "Profile Created On": Date;
  // 'At Time of Offer Payment Paid Date': string;
  'Loan': 'yes' | 'no';
  'Loan Sanction Amount'?: number;
  "onboarded": 'yes' | 'no';
  requiredDocuments: string[];
  'Balance Amount'?: number;
  'Profile Created By': string;
  'Did Offer Received': 'yes' | 'no';
  [key: `offer_installment_${number}`]: number;
  'payment_for_interview'?: string;
  'payment_for_documents'?: string;
  [key: `processing_fee_${number}`]: number;
  'Date of Offer': string;
  'EMI - 1'?: number;
  'EMI - 2'?: number;
  'EMI - 3'?: number;
  'EMI - 4'?: number;
  'EMI - 5'?: number;
  'EMI - 6'?: number;
  'EMI - 7'?: number;
  'EMI - 8'?: number;
  'EMI - 9'?: number;
  'EMI - 10'?: number;
  'Referred By': string;
  "BD category": string;
  nonSubmissionReason: string;
  "initial_splits": Array<{ amount: number; date: Date }>;
  'Documents Submitted': 'yes' | 'no';
  "documents"?: Array<{ name: string; path: string; uploadDate: Date }>;
  "emiDetails"?: Array<{ emiNumber: number; amount: number }>;
  "offerInstallments"?: Array<{ splitNumber: number; amount: number }>;
  "offerInstallmentsPaid"?: Array<{ splitNumber: number; amount: number,date: string }>;
  "processingFees"?: Array<{ splitNumber: number; amount: number }>;
  'Comments': string;
  'Agreement': 'yes' | 'no';
  'Agreement Date'?: string;
  'Acknowledgement Date'?: string;
  'payment_for_offer_date'?: string;
  'Payment_for_Interview_Date'?: string;
  'Payment_for_Documents_Date'?: string;
  'Forms'?: string[];
  'Acknowledgement': 'yes' | 'no';
  [key: `File Upload ${string}`]: {
    file?: {
      uid: string;
      name: string;
      type: string;
      size: number;
      lastModified?: number;
      lastModifiedDate?: string;
      originFileObj?: {
        uid: string;
      };
      status?: string;
    };
    fileList?: Array<{
      uid: string;
      name: string;
      type: string;
      size: number;
      lastModified?: number;
      lastModifiedDate?: string;
      originFileObj?: {
        uid: string;
      };
      status?: string;
    }>;
  };
}

export interface IFieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface IAuditLog extends Document {
  entityId: Types.ObjectId;
  entityType: string;
  changeType: 'UPDATE' | 'CREATE' | 'DELETE';
  changes: IFieldChange[];
  updatedBy: Types.ObjectId;
  updatedAt: Date;
}