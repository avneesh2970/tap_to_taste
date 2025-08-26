import express from "express"
import Order from "../models/Order.js"
import Dish from "../models/Dish.js"
import Restaurant from "../models/Restaurant.js"
import { auth, adminAuth, superadminAuthMiddleware } from "../middleware/auth.js"
import Razorpay from "razorpay"

const router = express.Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create order (public)
router.post("/", async (req, res) => {
  try {
    const { restaurantId, items, customerName, customerPhone, tableNumber, paymentMethod, specialInstructions } =
      req.body

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    // Calculate total amount and validate dishes
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const dish = await Dish.findById(item.dishId)
      if (!dish || !dish.isAvailable) {
        return res.status(400).json({ message: `Dish ${item.dishId} not available` })
      }

      const itemTotal = dish.price * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        dish: dish._id,
        quantity: item.quantity,
        price: dish.price,
      })

      // Update dish order count
      dish.orderCount += item.quantity
      await dish.save()
    }

    const order = new Order({
      restaurant: restaurantId,
      items: orderItems,
      customerName,
      customerPhone,
      tableNumber,
      totalAmount,
      paymentMethod,
      specialInstructions,
    })

    await order.save()

    // Update restaurant stats
    restaurant.totalOrders += 1
    restaurant.totalRevenue += totalAmount
    await restaurant.save()

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate("items.dish", "name price image")
      .populate("restaurant", "name")

    // Emit real-time update to restaurant
    const io = req.app.get("io")
    io.to(`restaurant-${restaurantId}`).emit("new-order", populatedOrder)

    res.status(201).json({
      message: "Order placed successfully",
      order: populatedOrder,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get order by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.dish", "name price image")
      .populate("restaurant", "name address phone")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({ order })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get restaurant orders (admin)
router.get("/restaurant/my-orders", auth, adminAuth, async (req, res) => {
  try {
    if (!req.user.restaurant) {
      return res.status(400).json({ message: "No restaurant found" })
    }

    const { status, search, page = 1, limit = 20 } = req.query
    const query = { restaurant: req.user.restaurant._id }

    if (status) {
      query.orderStatus = status
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ]
    }

    const orders = await Order.find(query)
      .populate("items.dish", "name price image")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments(query)

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalOrders: total,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update order status (admin)
router.put("/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.restaurant.toString() !== req.user.restaurant._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    order.orderStatus = status
    await order.save()

    const updatedOrder = await Order.findById(order._id)
      .populate("items.dish", "name price image")
      .populate("restaurant", "name")

    // Emit real-time update
    const io = req.app.get("io")
    io.to(`order-${order._id}`).emit("order-status-updated", updatedOrder)
    io.to(`restaurant-${order.restaurant}`).emit("order-status-updated", updatedOrder)

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.put("/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Only allow cancellation for pending or accepted orders
    if (!["pending", "accepted"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" })
    }

    order.orderStatus = "cancelled"
    await order.save()

    const updatedOrder = await Order.findById(order._id)
      .populate("items.dish", "name price image")
      .populate("restaurant", "name")

    // Emit real-time update
    const io = req.app.get("io")
    io.to(`order-${order._id}`).emit("order-status-updated", updatedOrder)
    io.to(`restaurant-${order.restaurant}`).emit("order-status-updated", updatedOrder)

    res.json({
      message: "Order cancelled successfully",
      order: updatedOrder,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.post("/create-restaurant-payment", async (req, res) => {
  try {
    const { amount, restaurantId } = req.body

    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant || !restaurant.razorpayDetails?.isRazorpayEnabled) {
      return res.status(400).json({ message: "Restaurant payment not configured" })
    }

    // Create Razorpay instance with restaurant's keys
    const razorpayInstance = new Razorpay({
      key_id: restaurant.razorpayDetails.keyId,
      key_secret: restaurant.razorpayDetails.keySecret,
    })

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    }

    const order = await razorpayInstance.orders.create(options)

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: restaurant.razorpayDetails.keyId,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.post("/verify-restaurant-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData, restaurantId } = req.body

    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant || !restaurant.razorpayDetails?.isRazorpayEnabled) {
      return res.status(400).json({ message: "Restaurant payment not configured" })
    }

    const crypto = await import("crypto")
    const hmac = crypto.createHmac("sha256", restaurant.razorpayDetails.keySecret)
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id)
    const generated_signature = hmac.digest("hex")

    if (generated_signature === razorpay_signature) {
      // Payment verified, create order with completed payment status
      const {
        restaurantId: restId,
        items,
        customerName,
        customerPhone,
        tableNumber,
        paymentMethod,
        specialInstructions,
      } = orderData

      // Calculate total amount and validate dishes
      let totalAmount = 0
      const orderItems = []

      for (const item of items) {
        const dish = await Dish.findById(item.dishId)
        if (!dish || !dish.isAvailable) {
          return res.status(400).json({ message: `Dish ${item.dishId} not available` })
        }

        const itemTotal = dish.price * item.quantity
        totalAmount += itemTotal

        orderItems.push({
          dish: dish._id,
          quantity: item.quantity,
          price: dish.price,
        })

        // Update dish order count
        dish.orderCount += item.quantity
        await dish.save()
      }

      const order = new Order({
        restaurant: restId,
        items: orderItems,
        customerName,
        customerPhone,
        tableNumber,
        totalAmount,
        paymentMethod: "online",
        paymentStatus: "completed",
        specialInstructions,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      })

      await order.save()

      // Update restaurant stats
      restaurant.totalOrders += 1
      restaurant.totalRevenue += totalAmount
      await restaurant.save()

      // Populate order details
      const populatedOrder = await Order.findById(order._id)
        .populate("items.dish", "name price image")
        .populate("restaurant", "name")

      // Emit real-time update to restaurant
      const io = req.app.get("io")
      io.to(`restaurant-${restId}`).emit("new-order", populatedOrder)

      res.json({
        message: "Payment verified and order created successfully",
        order: populatedOrder,
      })
    } else {
      res.status(400).json({ message: "Payment verification failed" })
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create Razorpay order
router.post("/create-payment", async (req, res) => {
  try {
    const { amount } = req.body

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)
    res.json({ order })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Verify Razorpay payment
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body

    const crypto = await import("crypto")
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id)
    const generated_signature = hmac.digest("hex")

    if (generated_signature === razorpay_signature) {
      // Payment verified, update order
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "completed" })
      res.json({ message: "Payment verified successfully" })
    } else {
      res.status(400).json({ message: "Payment verification failed" })
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update payment status (admin)
router.put("/:id/payment-status", auth, adminAuth, async (req, res) => {
  try {
    const { paymentStatus } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.restaurant.toString() !== req.user.restaurant._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    order.paymentStatus = paymentStatus
    await order.save()

    const updatedOrder = await Order.findById(order._id)
      .populate("items.dish", "name price image")
      .populate("restaurant", "name")

    const io = req.app.get("io")
    io.to(`order-${order._id}`).emit("payment-status-updated", updatedOrder)
    io.to(`restaurant-${order.restaurant}`).emit("payment-status-updated", updatedOrder)

    res.json({
      message: "Payment status updated successfully",
      order: updatedOrder,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all orders (superadmin)
router.get("/", superadminAuthMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const orders = await Order.find()
      .populate("items.dish", "name price")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments()

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
