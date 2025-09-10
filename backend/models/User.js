import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "superadmin", "staff"],
      default: "admin",
    },
    isBlocked: { type: Boolean, default: false },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean },
    subscription: {
      plan: { type: String, enum: ["free", "premium"], default: "free" },
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled"],
        default: "active",
      },
      startDate: { type: Date, default: Date.now },
      endDate: {
        type: Date,
        default: function () {
          return this.subscription?.plan === "premium"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days for premium
            : new Date("2099-12-31"); // Free never expires
        },
      },
      razorpaySubscriptionId: String,
      transactions: [
        {
          paymentId: { type: String }, // Razorpay payment ID
          orderId: { type: String }, // Razorpay order ID
          amount: { type: Number }, // Payment amount
          currency: { type: String, default: "INR" },
          status: {
            type: String,
            enum: ["success", "failed", "pending", "cancelled"],
            default: "success",
          },
          date: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true }
);

// -------------------
// 🔹 Password Hashing
// -------------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// -------------------
// 🔹 Compare Password
// -------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// -------------------
// 🔹 Expiry Auto-Downgrade Logic
// -------------------
async function checkAndDowngradeSubscription(doc) {
  if (!doc) return;
  if (
    doc.subscription?.plan === "premium" &&
    doc.subscription.endDate < new Date()
  ) {
    doc.subscription.plan = "free";
    doc.subscription.status = "active"; // free stays active
    doc.subscription.endDate = new Date("2099-12-31");
    await doc.save();
  }
}

// Apply auto-downgrade after single-document queries
userSchema.post(
  ["findOne", "findOneAndUpdate", "findById", "findByIdAndUpdate"],
  async function (doc) {
    await checkAndDowngradeSubscription(doc);
  }
);

// Apply auto-downgrade after multi-document queries
userSchema.post("find", async function (docs) {
  if (!docs) return;
  for (let doc of docs) {
    await checkAndDowngradeSubscription(doc);
  }
});

// -------------------
// 🔹 Utility for lean queries
// -------------------
userSchema.statics.refreshSubscription = async function (user) {
  if (!user) return user;
  if (
    user.subscription?.plan === "premium" &&
    user.subscription.endDate < new Date()
  ) {
    return {
      ...user,
      subscription: {
        ...user.subscription,
        plan: "free",
        status: "active", // free stays active
        endDate: new Date("2099-12-31"),
      },
    };
  }
  return user;
};

// -------------------
// 🔹 Check if user has premium
// -------------------
userSchema.methods.hasPremiumSubscription = function () {
  if (
    this.subscription.plan === "premium" &&
    this.subscription.endDate < new Date()
  ) {
    // expired premium should be treated as free
    return false;
  }
  return (
    this.subscription.plan === "premium" &&
    this.subscription.status === "active" &&
    this.subscription.endDate > new Date()
  );
};

export default mongoose.model("User", userSchema);
