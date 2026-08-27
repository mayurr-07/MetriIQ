import mongoose, { Document, Schema, Types } from "mongoose";

export type InspectionStatus =
  | "draft"
  | "submitted"
  | "reviewed"
  | "closed";

export type ImageType = "front" | "back" | "side" | "extra";

export interface InspectionImage {
  fileKey: string;
  url: string;
  type: ImageType;
  qualityScore?: number;
  qualityWarning?: string;
}

export interface RuleResult {
  ruleCode: string;
  title: string;
  status: "pass" | "fail" | "warning" | "na";
  detail: string;
}

export interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  overallStatus: "compliant" | "non_compliant" | "partially_compliant";
  complianceScore: number;
  ruleResults: RuleResult[];
  failedRules: RuleResult[];
  warningRules: RuleResult[];
  passedRules: RuleResult[];
  summary: string;
  violationCategories: string[];
  riskLevel: "low" | "medium" | "high";
}

export interface IInspection extends Document {
  inspectionId: string;
  officerId: Types.ObjectId;
  complaintRef?: Types.ObjectId;
  productDescription: string;
  location?: string;
  status: InspectionStatus;
  images: InspectionImage[];
  extractedData?: Record<string, unknown>;
  complianceReport?: ComplianceReport;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RuleResultSchema = new Schema<RuleResult>(
  {
    ruleCode: String,
    title: String,
    status: { type: String, enum: ["pass", "fail", "warning", "na"] },
    detail: String,
  },
  { _id: false }
);

const InspectionSchema = new Schema<IInspection>(
  {
    inspectionId: { type: String, required: true, unique: true },
    officerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    complaintRef: { type: Schema.Types.ObjectId, ref: "Complaint" },
    productDescription: { type: String, required: true },
    location: { type: String },
    status: {
      type: String,
      enum: ["draft", "submitted", "reviewed", "closed"],
      default: "draft",
    },
    images: [
      {
        fileKey: { type: String, required: true },
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["front", "back", "side", "extra"],
          required: true,
        },
        qualityScore: Number,
        qualityWarning: String,
        _id: false,
      },
    ],
    extractedData: { type: Schema.Types.Mixed },
    complianceReport: {
      reportId: String,
      generatedAt: Date,
      overallStatus: {
        type: String,
        enum: ["compliant", "non_compliant", "partially_compliant"],
      },
      complianceScore: Number,
      ruleResults: [RuleResultSchema],
      failedRules: [RuleResultSchema],
      warningRules: [RuleResultSchema],
      passedRules: [RuleResultSchema],
      summary: String,
      violationCategories: [String],
      riskLevel: { type: String, enum: ["low", "medium", "high"] },
    },
    reviewNotes: String,
  },
  { timestamps: true }
);

export const Inspection = mongoose.model<IInspection>(
  "Inspection",
  InspectionSchema
);
