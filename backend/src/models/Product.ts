import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  fssaiNo?: string;
  barcode?: string;
  active: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    fssaiNo: { type: String, trim: true },
    barcode: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
