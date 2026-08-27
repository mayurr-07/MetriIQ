import mongoose, { Document, Schema, Types } from "mongoose";

export type ComplaintStatus =
  | "open"
  | "assigned"
  | "under_inspection"
  | "resolved"
  | "closed";

export interface IComplaint extends Document {
  complaintId: string;
  consumerId: Types.ObjectId;
  productDescription: string;
  issueType: string;
  description: string;
  location?: string;
  images: string[];
  status: ComplaintStatus;
  assignedOfficerId?: Types.ObjectId;
  inspectionRef?: Types.ObjectId;
  resolutionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    complaintId: { type: String, required: true, unique: true },
    consumerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productDescription: { type: String, required: true },
    issueType: {
      type: String,
      required: true,
      enum: [
        "missing_declaration",
        "incorrect_mrp",
        "expired_product",
        "misleading_label",
        "foreign_object",
        "counterfeit",
        "other",
      ],
    },
    description: { type: String, required: true },
    location: String,
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["open", "assigned", "under_inspection", "resolved", "closed"],
      default: "open",
    },
    assignedOfficerId: { type: Schema.Types.ObjectId, ref: "User" },
    inspectionRef: { type: Schema.Types.ObjectId, ref: "Inspection" },
    resolutionNote: String,
  },
  { timestamps: true }
);

export const Complaint = mongoose.model<IComplaint>(
  "Complaint",
  ComplaintSchema
);
