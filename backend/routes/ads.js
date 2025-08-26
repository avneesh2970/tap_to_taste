import express from "express"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import Ad from "../models/Ad.js"
// import { superadminAuth } from "../middleware/auth.js"
import { superadminAuthMiddleware } from "../middleware/auth.js"

const router = express.Router()

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurant-ads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 400, crop: "fill", quality: "auto" }],
  },
})

const upload = multer({ storage })

router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true }).sort({ priority: -1, createdAt: -1 })

    res.json({ ads })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.get("/manage", superadminAuthMiddleware, async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 })

    res.json({ ads })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.post("/", superadminAuthMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, buttonText, link, features, gradient, icon, priority } = req.body

    if (!req.file) {
      return res.status(400).json({ message: "Ad image is required" })
    }

    const featuresArray = features ? features.split(",").map((f) => f.trim()) : []

    const ad = new Ad({
      title,
      description,
      buttonText: buttonText || "Learn More",
      link,
      image: req.file.path,
      features: featuresArray,
      gradient: gradient || "from-blue-500 to-purple-600",
      icon: icon || "🚀",
      priority: Number.parseInt(priority) || 0,
    })

    await ad.save()
    res.status(201).json({ message: "Ad created successfully", ad })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.put("/:id", superadminAuthMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, buttonText, link, features, gradient, icon, priority, isActive } = req.body

    const updateData = {
      title,
      description,
      buttonText,
      link,
      features: features ? features.split(",").map((f) => f.trim()) : [],
      gradient,
      icon,
      priority: Number.parseInt(priority) || 0,
      isActive: isActive === "true",
    }

    if (req.file) {
      updateData.image = req.file.path
    }

    const ad = await Ad.findByIdAndUpdate(req.params.id, updateData, { new: true })

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" })
    }

    res.json({ message: "Ad updated successfully", ad })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.delete("/:id", superadminAuthMiddleware, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id)

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" })
    }

    res.json({ message: "Ad deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
