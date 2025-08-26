import mongoose from "mongoose"

const dishSchema = new mongoose.Schema(
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String, // Cloudinary URL
      default: "",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    spiceLevel: {
      type: String,
      enum: ["mild", "medium", "spicy"],
      default: "mild",
    },
    preparationTime: {
      type: Number, // in minutes
      default: 15,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Dish", dishSchema)
