import express from "express"
import User from "../models/User.js"
import Restaurant from "../models/Restaurant.js"
import Order from "../models/Order.js"
import Dish from "../models/Dish.js"
import { superadminAuthMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Get comprehensive dashboard data
router.get("/dashboard", superadminAuthMiddleware, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Basic stats
    const totalAdmins = await User.countDocuments({ role: "admin" })
    const totalRestaurants = await Restaurant.countDocuments()
    const totalOrders = await Order.countDocuments()
    const premiumUsers = await User.countDocuments({
      role: "admin",
      "subscription.plan": "premium",
      "subscription.status": "active",
    })
    const blockedUsers = await User.countDocuments({ role: "admin", isBlocked: true })

    // Today's stats
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    })

    // Revenue calculations
    const totalRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    const todayRevenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    // Recent orders with populated data
    const recentOrders = await Order.find().populate("restaurant", "name").sort({ createdAt: -1 }).limit(10)

    // System alerts (mock data for now - can be enhanced later)
    const systemAlerts = [
      {
        type: "info",
        title: "System Update",
        message: "Platform running smoothly with latest updates",
        timestamp: new Date(),
      },
    ]

    // Check for any blocked users in last 24 hours
    const recentlyBlockedUsers = await User.countDocuments({
      role: "admin",
      isBlocked: true,
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })

    if (recentlyBlockedUsers > 0) {
      systemAlerts.unshift({
        type: "warning",
        title: "User Management Alert",
        message: `${recentlyBlockedUsers} admin(s) blocked in the last 24 hours`,
        timestamp: new Date(),
      })
    }

    const stats = {
      totalAdmins,
      totalRestaurants,
      totalOrders,
      totalRevenue: totalRevenueResult[0]?.total || 0,
      premiumUsers,
      blockedUsers,
      todayOrders,
      todayRevenue: todayRevenueResult[0]?.total || 0,
    }

    res.json({
      stats,
      recentOrders,
      systemAlerts,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get dashboard stats
router.get("/stats", superadminAuthMiddleware, async (req, res) => {
  try {
    const totalAdmins = await User.countDocuments({ role: "admin" })
    const totalRestaurants = await Restaurant.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalDishes = await Dish.countDocuments()

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    const recentOrders = await Order.find().populate("restaurant", "name").sort({ createdAt: -1 }).limit(10)

    res.json({
      stats: {
        totalAdmins,
        totalRestaurants,
        totalOrders,
        totalDishes,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentOrders,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all admins
router.get("/admins", superadminAuthMiddleware, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).populate("restaurant", "name").sort({ createdAt: -1 })

    res.json({ admins })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Block/Unblock admin
router.put("/admins/:id/toggle-block", superadminAuthMiddleware, async (req, res) => {
  try {
    const admin = await User.findById(req.params.id)
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" })
    }

    admin.isBlocked = !admin.isBlocked
    await admin.save()

    res.json({
      message: `Admin ${admin.isBlocked ? "blocked" : "unblocked"} successfully`,
      admin,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get analytics data
router.get("/analytics", superadminAuthMiddleware, async (req, res) => {
  try {
    // Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    // Top restaurants
    const topRestaurants = await Restaurant.find()
      .sort({ totalRevenue: -1 })
      .limit(10)
      .select("name totalRevenue totalOrders")

    // Order status distribution
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ])

    res.json({
      monthlyRevenue,
      topRestaurants,
      orderStatusStats,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
