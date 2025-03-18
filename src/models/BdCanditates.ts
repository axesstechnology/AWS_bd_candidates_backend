import mongoose, { Schema } from 'mongoose';
import {  ICandidateDocument, IFileUpload } from '../utils/types';
import { FileUploadSchema } from './FileUploadModel';


const transformFileUpload = (fileUploadData: any, form: string): IFileUpload => {
  // Check if response exists, otherwise use the file object
  const fileData = fileUploadData.response || fileUploadData.file;
  
  return {
    originalName: fileData.name,
    fileName: fileData.name, // You might want to generate a unique filename
    base64: fileData.base64, // Base64 string from the response
    path: '', // Generate a path if needed
    size: fileData.size,
    formType: form, // Form identifier
    documentType: fileData.name
  };
};

const candidateSchema = new Schema<ICandidateDocument>({
  backDoorId: {
    type: String,
     // required: true,
    unique: true
  },
  fullName: {
    type: String,
     // required: true
  },
  class: {
    type: String,
    enum: ['software_engineering', 'software_testing','Others'],
     // required: true
  },
  other_domain:{
    type: String,  
  },
  agentName:{
    type: String,
  }, 
  joiningMonth:{
    type: Date,
  },
stage :{
    type:String,
    enum: ['Subject Matter Training', 'Real-Time Training', 'Scheduling Interviews' , 'Received Offer'],
  },
  isActive: {
    type: Boolean,
    default: true
  },
  jobType: {
    type: String,
    enum: ['Hybrid', 'Remote' ,'Office'],
     // required: true
  },
  phoneNumber: {
    type: String,
     // required: true
  },
  email: {
    type: String,
     // required: true,
    unique: true
  },
  // amountReceived: {
  //   type: Date,
  //    // required: true
  // },
  requiredDocuments: [{
    type: String,
    enum: ['passport_size_photo', 'pan_card', 'hsc', 'e_aadhar', 'passport','pg_certificates','sslc','ug_consolidated_marksheet','ug_degree_certificate','ug_degree_certificate','ug_provisional_certificate'],
     // required: true
  }],
  totalAmount: {
    type: Number,
     // required: true
  },
  amountReceivedSplitUp: {
    type: String,
    //  // required: true
  },
  InitialAmount: {
    type: Number,
    //  // required: true
  },
  initialAmountReceived: {
    type: Boolean,
    //  // required: true
  },
  modeOfPayment: {
    type: String,
    enum: ['cash', 'online','loan','Not Applicable'],
     // required: true
  },
  isEMI: {
    type: Boolean,
    //  // required: true
  },
  loan: {
    type: Boolean,
     // required: true
  },
  profilecreated: {
    type: Boolean,
    default: false
    //  // required: true
  },
  videoshooted: {
    type: Boolean,
     // required: true
  },
  videoShootedDate:{
    type: Date,
  },
  modelready: {
    type: Boolean,
     // required: true
  },
  modelCreatedDate:{
    type: Date,
  },
  profileCreatedOn: {
    type: Date,
    // required:false
  },
  onboarded: {
    type: Boolean,
  },
  loanSanctionAmount: {
    type: Number,
    required: function(this: ICandidateDocument) {
      return this.loan === true;
    }
  },
  balanceAmount: {
    type: Number,
    required: function(this: ICandidateDocument) {
      return this.loan === true;
    }
  },
  didOfferReceived: {
    type: Boolean,
    //  // required: true
  },
  offerInstallments: [{
    splitNumber: {
      type: Number,
      //  // required: true
    },
    amount: {
      type: Number,
      //  // required: true
    }
  }],
  offerInstallmentsPaid: [{
    splitNumber: {
      type: Number,
      //  // required: true
    },
    amount: {
      type: Number,
      //  // required: true
    },
    date: {
      type: Date,
       // required: true
    }
  }],
  paymentForInterview: {
    type: String,
    // required: function(this: ICandidateDocument) {
    //   return !this.didOfferReceived;
    // }
  },
  profilecreatedBy:{
    type: String,
  },
  paymentForOffer:{
    type: String,
  },
  paymentForDocuments: {
    type: String,
    // required: function(this: ICandidateDocument) {
    //   return !this.didOfferReceived;
    // }
  },
  processingFees: [{
    splitNumber: {
      type: Number,
      //  // required: true
    },
    amount: {
      type: Number,
      //  // required: true
    }
  }],
  dateOfOffer: {
    type: Date,
     // required: true
  },
  emiDetails: [{
    emiNumber: {
      type: Number,
      // required: true
    },
    amount: {
      type: Number,
      //  // required: true
    }
  }],
  referredBy: {
    type: String,
    //  // required: true
  },
  BDcategory: {
    type: String,
     // required: true
  },
  nonSubmissionReason: {
    type: String,
  },
  inactivereason:{
    type: String,
  },
  documentsSubmitted: {
    type: Boolean,
     // required: true
  },
  initial_splits: [{
    amount: {
      type: Number,
       // required: true
    },
    date: {
      type: Date,
       // required: true
    }
  }],
  documents: [{
    name: {
      type: String,
       // required: true
    },
    path: {
      type: String,
       // required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  agreement: {
    type: Boolean,
     // required: true
  },
  agreementDate: {
    type: Date,
    required: function(this: ICandidateDocument) {
      return this.agreement === true;
    }
  },
  paymentforinterviewdate: {
    type:Date,
  },
  paymentforofferdate: {
    type:Date,
  },
  paymentfordocumentsdate: {
    type:Date,
  },
  acknowledgementDate: {
    type: Date,
    required: function(this: ICandidateDocument) {
      return this.acknowledgement === true;
    }
  },
  forms: [{ 
    type: String, 
    enum: ['1', '1A', '2', '2A', '3', '3A'] 
  }],
  agreementDocument:{
    type: String,
  },
  acknowledgementDocument:{
    type: String,
  },
  formUploads: [FileUploadSchema],
  acknowledgement: {
    type: Boolean,
     // required: true
  },
  comments: {
    type: String,
     // required: true
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<ICandidateDocument>('Candidate', candidateSchema);