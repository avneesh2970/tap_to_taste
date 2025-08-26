import express from "express"
import QRCode from "qrcode"
import Restaurant from "../models/Restaurant.js"
import { auth, adminAuth, superadminAuthMiddleware } from "../middleware/auth.js"
import { uploadRestaurantImage } from "../config/multerConfig.js"

const router = express.Router()

// Create restaurant
router.post("/", auth, adminAuth, uploadRestaurantImage.single("image"), async (req, res) => {
  try {
    const { name, description, address, phone, email, razorpayDetails } = req.body

    // Check if user already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ owner: req.user._id })
    if (existingRestaurant) {
      return res.status(400).json({ message: "You already have a restaurant" })
    }

    let imageUrl = ""
    if (req.file) {
      imageUrl = req.file.path // Cloudinary URL is available in req.file.path
    }

    let parsedRazorpayDetails = {}
    if (razorpayDetails && typeof razorpayDetails === "string") {
      try {
        parsedRazorpayDetails = JSON.parse(razorpayDetails)
      } catch (error) {
        parsedRazorpayDetails = {}
      }
    } else if (razorpayDetails && typeof razorpayDetails === "object") {
      parsedRazorpayDetails = razorpayDetails
    }

    const restaurant = new Restaurant({
      name,
      description,
      address,
      phone,
      email,
      image: imageUrl,
      owner: req.user._id,
      razorpayDetails: parsedRazorpayDetails,
    })

    await restaurant.save()

    // Generate QR code
    const qrCodeData = `${process.env.USER_FRONTEND_URL}/menu/${restaurant._id}`
    const qrCode = await QRCode.toDataURL(qrCodeData)
    restaurant.qrCode = qrCode
    await restaurant.save()

    // Update user's restaurant reference
    req.user.restaurant = restaurant._id
    await req.user.save()

    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get restaurant by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate("owner", "name email isBlocked")

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    // Check if restaurant owner is blocked
    if (restaurant.owner && restaurant.owner.isBlocked) {
      return res.status(403).json({ message: "Restaurant is temporarily unavailable" })
    }

    res.json({ restaurant })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.get("/:id/ad-status", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate("owner")

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    const hasPremium = restaurant.owner?.hasPremiumSubscription() || false

    res.json({ hasPremium })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update restaurant
router.put("/:id", auth, adminAuth, uploadRestaurantImage.single("image"), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const updateData = { ...req.body }

    if (updateData.openingHours && typeof updateData.openingHours === "string") {
      try {
        updateData.openingHours = JSON.parse(updateData.openingHours)
      } catch (error) {
        return res.status(400).json({ message: "Invalid opening hours format" })
      }
    }

    if (updateData.razorpayDetails && typeof updateData.razorpayDetails === "string") {
      try {
        updateData.razorpayDetails = JSON.parse(updateData.razorpayDetails)
      } catch (error) {
        return res.status(400).json({ message: "Invalid Razorpay details format" })
      }
    }

    if (req.file) {
      updateData.image = req.file.path
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, { new: true })

    res.json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all restaurants (for superadmin)
router.get("/", superadminAuthMiddleware, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate("owner", "name email").sort({ createdAt: -1 })

    res.json({ restaurants })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
