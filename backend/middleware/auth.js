import jwt from "jsonwebtoken"
import User from "../models/User.js"

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).populate("restaurant")

    if (!user) {
      return res.status(401).json({ message: "Invalid token" })
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}

const superadminAuth = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Superadmin access required" })
  }
  next()
}

const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

const superadminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== "superadmin" || decoded.id !== "superadmin") {
      return res.status(401).json({ message: "Invalid superadmin token" })
    }

    // Set superadmin user object
    req.user = {
      _id: "superadmin",
      id: "superadmin",
      role: "superadmin",
      name: "Super Administrator",
    }

    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}

export { auth, superadminAuth, adminAuth, superadminAuthMiddleware }
