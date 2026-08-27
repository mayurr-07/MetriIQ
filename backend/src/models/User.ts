import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "officer" | "admin" | "senior" | "consumer";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  district?: string;
  phone?: string;
  active: boolean;
  createdAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["officer", "admin", "senior", "consumer"],
      required: true,
    },
    district: { type: String, trim: true },
    phone: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Never return passwordHash in JSON responses
UserSchema.set("toJSON", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model<IUser>("User", UserSchema);
