import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { auth } from "../middleware/auth.js"

const router = express.Router()

// Admin signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: "admin",
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email }).populate("restaurant")
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: user.restaurant,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Superadmin login
router.post("/superadmin/login", async (req, res) => {
  try {
    const { password } = req.body

    // Check superadmin password
    if (password !== process.env.SUPERADMIN_PASSWORD) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token for superadmin
    const token = jwt.sign({ id: "superadmin", role: "superadmin" }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      message: "Superadmin login successful",
      token,
      user: {
        id: "superadmin",
        role: "superadmin",
        name: "Super Administrator",
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.get("/superadmin/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({
      user: {
        id: "superadmin",
        role: "superadmin",
        name: "Super Administrator",
      },
    })
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
})

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        restaurant: req.user.restaurant,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
