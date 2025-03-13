import { Document } from 'mongoose';

/**
 * Interface representing an upload request in the system
 * This defines the structure for storing upload requests in the database
 */
export interface IUploadRequest extends Document {
  /**
   * Original filename uploaded by the user
   */
  originalFilename: string;
  
  /**
   * System-generated filename (to prevent collisions)
   */
  systemFilename: string;
  
  /**
   * File size in bytes
   */
  fileSize: number;
  
  /**
   * MIME type of the uploaded file
   */
  mimeType: string;
  
  /**
   * Period ID that links to the Daysperiod table
   * This replaces the separate year and period fields
   */
  periodId: string;
  
  /**
   * Main category of the data (environmental, social, governance)
   */
  mainCategory: string;
  
  /**
   * Sub-category of the data
   */
  subCategory: string;
  
  /**
   * Status of the upload request
   * - pending: Awaiting approval
   * - approved: Approved and processed
   * - rejected: Rejected by admin
   */
  status: 'pending' | 'approved' | 'rejected';
  
  /**
   * Optional reason for rejection
   */
  rejectionReason?: string;
  
  /**
   * User ID of the uploader
   */
  uploadedBy: string;
  
  /**
   * User ID of the admin who processed the request
   */
  processedBy?: string;
  
  /**
   * Timestamp when the request was created
   */
  createdAt: Date;
  
  /**
   * Timestamp when the request was last updated
   */
  updatedAt: Date;
}

/**
 * Mongoose schema for upload requests
 */
import mongoose from 'mongoose';

const uploadRequestSchema = new mongoose.Schema<IUploadRequest>(
  {
    originalFilename: { type: String, required: true },
    systemFilename: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    periodId: { type: String, required: true },
    mainCategory: { type: String, required: true },
    subCategory: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending',
      required: true 
    },
    rejectionReason: { type: String },
    uploadedBy: { type: String, required: true },
    processedBy: { type: String },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create and export the model
const UploadRequest = mongoose.model<IUploadRequest>('UploadRequest', uploadRequestSchema);
export default UploadRequest;