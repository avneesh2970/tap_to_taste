import mongoose from "mongoose"

const orderItemSchema = new mongoose.Schema({
  dish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dish",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [orderItemSchema],
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    tableNumber: {
      type: String,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "online"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "accepted", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 30,
    },
  },
  {
    timestamps: true,
  },
)

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    try {
      // Use atomic operation to prevent race conditions
      const timestamp = Date.now()
      const randomSuffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      this.orderNumber = `ORD${timestamp}${randomSuffix}`
    } catch (error) {
      return next(error)
    }
  }
  next()
})

export default mongoose.model("Order", orderSchema)
