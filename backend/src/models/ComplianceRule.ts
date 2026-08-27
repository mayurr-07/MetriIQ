import mongoose, { Document, Schema } from "mongoose";

export type DetectionMethod = "ocr_llm" | "vision" | "ocr_vision";
export type RuleCategory = "LM" | "FSSAI";

export interface IComplianceRule extends Document {
  ruleCode: string;
  category: RuleCategory;
  title: string;
  description: string;
  detectionMethod: DetectionMethod;
  active: boolean;
  version: string;
}

const ComplianceRuleSchema = new Schema<IComplianceRule>(
  {
    ruleCode: { type: String, required: true, unique: true },
    category: { type: String, enum: ["LM", "FSSAI"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    detectionMethod: {
      type: String,
      enum: ["ocr_llm", "vision", "ocr_vision"],
      required: true,
    },
    active: { type: Boolean, default: true },
    version: { type: String, default: "1.0" },
  },
  { timestamps: true }
);

export const ComplianceRule = mongoose.model<IComplianceRule>(
  "ComplianceRule",
  ComplianceRuleSchema
);
