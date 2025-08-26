import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    business: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Quote", quoteSchema);
