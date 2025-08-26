import express from "express"
import Dish from "../models/Dish.js"
import Restaurant from "../models/Restaurant.js"
import { auth, adminAuth } from "../middleware/auth.js"
import { uploadDishImage } from "../config/multerConfig.js"

const router = express.Router()

// Create dish
router.post("/", auth, adminAuth, uploadDishImage.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, isVeg, spiceLevel, preparationTime } = req.body

    if (!req.user.restaurant) {
      return res.status(400).json({ message: "Please create a restaurant first" })
    }

    let imageUrl = ""
    if (req.file) {
      imageUrl = req.file.path // Cloudinary URL is available in req.file.path
    }

    const dish = new Dish({
      name,
      description,
      price: Number.parseFloat(price),
      category,
      image: imageUrl,
      restaurant: req.user.restaurant._id,
      isVeg: isVeg === "true",
      spiceLevel,
      preparationTime: Number.parseInt(preparationTime) || 15,
    })

    await dish.save()

    // Add category to restaurant if not exists
    const restaurant = await Restaurant.findById(req.user.restaurant._id)
    if (!restaurant.categories.includes(category)) {
      restaurant.categories.push(category)
      await restaurant.save()
    }

    res.status(201).json({
      message: "Dish created successfully",
      dish,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get dishes by restaurant (public)
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    // First check if restaurant exists and owner is not blocked
    const restaurant = await Restaurant.findById(req.params.restaurantId).populate("owner", "isBlocked")

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    // Check if restaurant owner is blocked
    if (restaurant.owner && restaurant.owner.isBlocked) {
      return res.status(403).json({ message: "Restaurant is temporarily unavailable" })
    }

    const dishes = await Dish.find({
      restaurant: req.params.restaurantId,
      isAvailable: true,
    }).sort({ category: 1, name: 1 })

    res.json({ dishes })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get admin's dishes
router.get("/my-dishes", auth, adminAuth, async (req, res) => {
  try {
    if (!req.user.restaurant) {
      return res.status(400).json({ message: "No restaurant found" })
    }

    const dishes = await Dish.find({ restaurant: req.user.restaurant._id }).sort({ category: 1, name: 1 })

    res.json({ dishes })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update dish
router.put("/:id", auth, adminAuth, uploadDishImage.single("image"), async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id)

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" })
    }

    if (dish.restaurant.toString() !== req.user.restaurant._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const updateData = { ...req.body }

    if (req.file) {
      updateData.image = req.file.path
    }

    if (updateData.price) {
      updateData.price = Number.parseFloat(updateData.price)
    }

    if (updateData.preparationTime) {
      updateData.preparationTime = Number.parseInt(updateData.preparationTime)
    }

    if (updateData.isVeg !== undefined) {
      updateData.isVeg = updateData.isVeg === "true"
    }

    const updatedDish = await Dish.findByIdAndUpdate(req.params.id, updateData, { new: true })

    res.json({
      message: "Dish updated successfully",
      dish: updatedDish,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete dish
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id)

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" })
    }

    if (dish.restaurant.toString() !== req.user.restaurant._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await Dish.findByIdAndDelete(req.params.id)

    res.json({ message: "Dish deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
