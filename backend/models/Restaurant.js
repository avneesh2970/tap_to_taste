import mongoose from "mongoose"

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String, // Cloudinary URL
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrCode: {
      type: String, // Base64 encoded QR code
      default: "",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openingHours: {
      monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    razorpayDetails: {
      keyId: {
        type: String,
        trim: true,
        default: "",
      },
      keySecret: {
        type: String,
        trim: true,
        default: "",
      },
      isRazorpayEnabled: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Restaurant", restaurantSchema)
