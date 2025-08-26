import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "./cloudinary.js"

// Restaurant images storage
const restaurantStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurant-platform/restaurants",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }],
  },
})

// Dish images storage
const dishStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurant-platform/dishes",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }],
  },
})

// Multer middleware configurations
export const uploadRestaurantImage = multer({
  storage: restaurantStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

export const uploadDishImage = multer({
  storage: dishStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})
