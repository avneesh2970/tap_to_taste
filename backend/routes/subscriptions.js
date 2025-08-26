import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import { auth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get current subscription
router.get("/current", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      subscription: user.subscription,
      hasPremium: user.hasPremiumSubscription(),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create premium subscription payment
router.post("/create-premium", auth, adminAuth, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        message: "Razorpay configuration missing",
        error: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not configured",
      });
    }

    // Create a one-time payment order for premium subscription (₹199)
    const options = {
      amount: 19900, // ₹199 in paise
      currency: "INR",
      receipt: `premium_${Date.now()}`,
      notes: {
        plan_type: "premium",
        user_id: req.user.id,
        description: "Premium Restaurant Plan - Monthly Subscription",
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: "Premium Plan",
      description:
        "Ad-free experience for your restaurant - Monthly subscription",
      prefill: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error("Create premium payment error:", error);
    res.status(500).json({
      message: "Failed to create premium payment",
      error: error.message,
    });
  }
});

// Verify premium subscription payment
router.post("/verify-premium", auth, adminAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update user subscription to premium for 30 days
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.subscription.plan = "premium";
    user.subscription.status = "active";
    user.subscription.startDate = new Date();
    user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    user.subscription.razorpaySubscriptionId = razorpay_order_id; // keep ref

    user.subscription.transactions.push({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: amount, // take from req.body (or Razorpay API confirm)
      currency: "INR",
      status: "success",
      date: new Date(),
    });
    await user.save();

    res.json({
      message: "Premium subscription activated successfully",
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Verify premium payment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Cancel subscription
router.post("/cancel", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.subscription.plan = "free";
    user.subscription.status = "cancelled";
    user.subscription.startDate = new Date();
    user.subscription.endDate = new Date("2099-12-31");
    user.subscription.razorpaySubscriptionId = null;

    user.subscription.transactions.push({
      paymentId: null,
      orderId: null,
      amount: 0,
      currency: "INR",
      status: "cancelled",
      date: new Date(),
    });

    await user.save();

    res.json({
      message: "Subscription cancelled successfully",
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
