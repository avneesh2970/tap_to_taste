import mongoose from "mongoose"

const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    buttonText: {
      type: String,
      required: true,
      default: "Learn More",
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    gradient: {
      type: String,
      default: "from-blue-500 to-purple-600",
    },
    icon: {
      type: String,
      default: "🚀",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Ad", adSchema)
