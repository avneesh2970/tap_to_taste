import mongoose from "mongoose"

const userAccessSchema = new mongoose.Schema(
  {
    // The staff user who is being given access
    staffUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The admin/owner who is granting access
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The restaurant this access is for
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    // Array of tab/page permissions
    permissions: [
      {
        tabName: {
          type: String,
          required: true,
          enum: ["Dashboard", "Orders", "Dishes", "Analytics", "Restaurant", "Plans", "Billing"],
        },
        hasAccess: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Status of the access
    status: {
      type: String,
      enum: ["active", "suspended", "revoked"],
      default: "active",
    },
    // Email of the staff member (for invitation purposes)
    staffEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure one access record per staff-restaurant combination
userAccessSchema.index({ staffUser: 1, restaurant: 1 }, { unique: true })
userAccessSchema.index({ staffEmail: 1, restaurant: 1 })

export default mongoose.model("UserAccess", userAccessSchema)
