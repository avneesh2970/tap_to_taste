import mongoose from "mongoose"

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
    },
    customerEmail: {
      type: String,
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online", "card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    billType: {
      type: String,
      enum: ["auto", "manual"],
      default: "auto",
    },
    notes: {
      type: String,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Generate bill number before saving
billSchema.pre("save", async function (next) {
  if (!this.billNumber) {
    const count = await mongoose.model("Bill").countDocuments({
      restaurant: this.restaurant,
    })
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    this.billNumber = `BILL-${year}${month}-${(count + 1).toString().padStart(4, "0")}`
  }
  next()
})

export default mongoose.model("Bill", billSchema)
