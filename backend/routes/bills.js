import express from "express";
import Bill from "../models/Bill.js";
import Order from "../models/Order.js";
import { auth, adminAuth, checkTabPermission } from "../middleware/auth.js";
import PDFDocument from "pdfkit";
import mongoose from "mongoose";

const router = express.Router();

// utils.js (or inside your component file)
export function generateBillNumber() {
  const prefix = "BILL";
  const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  const timestamp = Date.now().toString().slice(-4); // last 4 digits of timestamp
  return `${prefix}-${randomNum}-${timestamp}`;
}

// Get all bills for a restaurant with filtering
router.get("/", auth, adminAuth, async (req, res) => {
  try {
    const {
      date,
      paymentMethod,
      paymentStatus,
      page = 1,
      limit = 10,
    } = req.query;
    const restaurantId = req.user.restaurant;

    const filter = { restaurant: restaurantId };

    // Date filtering
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    // Payment method filtering
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    // Payment status filtering
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const bills = await Bill.find(filter)
      .populate("order")
      .populate("issuedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bill.countDocuments(filter);

    res.json({
      bills,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get today's transactions summary
router.get("/today-summary", auth, adminAuth, async (req, res) => {
  try {
    console.log("today-summery controller running");
    const restaurantId = req.user.restaurant;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const summary = await Bill.aggregate([
      {
        $match: {
          //   restaurant: restaurantId,
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalBills: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          cashPayments: {
            $sum: {
              $cond: [{ $eq: ["$paymentMethod", "cash"] }, "$totalAmount", 0],
            },
          },
          onlinePayments: {
            $sum: {
              $cond: [{ $eq: ["$paymentMethod", "online"] }, "$totalAmount", 0],
            },
          },
          completedPayments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "completed"] }, 1, 0] },
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json(
      summary[0] || {
        totalBills: 0,
        totalRevenue: 0,
        cashPayments: 0,
        onlinePayments: 0,
        completedPayments: 0,
        pendingPayments: 0,
      }
    );
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create manual bill
router.post("/manual", auth, adminAuth, async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      paymentMethod,
      tax = 0,
      discount = 0,
      notes,
    } = req.body;
    const restaurantId = req.user.restaurant;
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subtotal + tax - discount;
    const bill = new Bill({
      billNumber: generateBillNumber(),
      restaurant: restaurantId,
      customerName,
      customerPhone,
      customerEmail,
      items,
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      //   paymentStatus: paymentMethod === "cash" ? "completed" : "pending",
      paymentStatus: paymentMethod === "cash" ? "completed" : "completed",
      billType: "manual",
      notes,
      issuedBy: req.user.id,
    });
    await bill.save();
    await bill.populate("issuedBy", "name email");

    res.status(201).json({ message: "Manual bill created successfully", bill });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Auto-generate bill from order
router.post("/auto/:orderId", auth, adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.user.restaurant;

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurantId,
    }).populate("items.dish");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if bill already exists for this order
    const existingBill = await Bill.findOne({ order: orderId });
    if (existingBill) {
      return res
        .status(400)
        .json({ message: "Bill already exists for this order" });
    }

    const items = order.items.map((item) => ({
      name: item.dish.name,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
    }));

    const subtotal = order.totalAmount;
    const tax = 0; // Can be calculated based on restaurant settings
    const discount = 0;

    const bill = new Bill({
      restaurant: restaurantId,
      order: orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      items,
      subtotal,
      tax,
      discount,
      totalAmount: subtotal + tax - discount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId,
      billType: "auto",
      issuedBy: req.user.id,
    });

    await bill.save();
    await bill.populate("issuedBy", "name email");

    res.status(201).json({ message: "Bill generated successfully", bill });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Download bill as PDF
router.get("/download/:billId", auth, adminAuth, async (req, res) => {
  try {
    const { billId } = req.params;
    const restaurantId = req.user.restaurant;

    const bill = await Bill.findOne({
      _id: billId,
      restaurant: restaurantId,
    })
      .populate("restaurant")
      .populate("issuedBy", "name");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bill-${bill.billNumber}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text(bill.restaurant.name, { align: "center" });
    doc.fontSize(12).text(bill.restaurant.address, { align: "center" });
    doc.text(`Phone: ${bill.restaurant.phone}`, { align: "center" });
    doc.moveDown();

    // Bill details
    doc.fontSize(16).text("BILL", { align: "center" });
    doc.fontSize(10);
    doc.text(`Bill No: ${bill.billNumber}`, 50, doc.y);
    doc.text(`Date: ${bill.createdAt.toLocaleDateString()}`, 400, doc.y - 12);
    doc.moveDown();

    // Customer details
    doc.text(`Customer: ${bill.customerName}`);
    if (bill.customerPhone) doc.text(`Phone: ${bill.customerPhone}`);
    if (bill.customerEmail) doc.text(`Email: ${bill.customerEmail}`);
    doc.moveDown();

    // Items table header
    const tableTop = doc.y;
    doc.text("Item", 50, tableTop);
    doc.text("Qty", 250, tableTop);
    doc.text("Price", 300, tableTop);
    doc.text("Total", 400, tableTop);
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(500, tableTop + 15)
      .stroke();

    // Items
    let itemY = tableTop + 25;
    bill.items.forEach((item) => {
      doc.text(item.name, 50, itemY);
      doc.text(item.quantity.toString(), 250, itemY);
      doc.text(`₹${item.price}`, 300, itemY);
      doc.text(`₹${item.total}`, 400, itemY);
      itemY += 20;
    });

    // Totals
    doc.moveTo(50, itemY).lineTo(500, itemY).stroke();
    itemY += 10;
    doc.text(`Subtotal: ₹${bill.subtotal}`, 350, itemY);
    itemY += 15;
    if (bill.tax > 0) {
      doc.text(`Tax: ₹${bill.tax}`, 350, itemY);
      itemY += 15;
    }
    if (bill.discount > 0) {
      doc.text(`Discount: -₹${bill.discount}`, 350, itemY);
      itemY += 15;
    }
    doc.fontSize(12).text(`Total: ₹${bill.totalAmount}`, 350, itemY);

    // Footer
    doc
      .fontSize(10)
      .text(
        `Payment Method: ${bill.paymentMethod.toUpperCase()}`,
        50,
        itemY + 30
      );
    doc.text(
      `Payment Status: ${bill.paymentStatus.toUpperCase()}`,
      50,
      itemY + 45
    );
    if (bill.notes) {
      doc.text(`Notes: ${bill.notes}`, 50, itemY + 60);
    }

    doc.text("Thank you for your business!", { align: "center" }, itemY + 80);

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update bill
router.put("/:billId", auth, adminAuth, async (req, res) => {
  try {
    const { billId } = req.params;
    const restaurantId = req.user.restaurant;
    const updates = req.body;

    const bill = await Bill.findOneAndUpdate(
      { _id: billId, restaurant: restaurantId },
      updates,
      {
        new: true,
      }
    ).populate("issuedBy", "name email");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json({ message: "Bill updated successfully", bill });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete bill
router.delete("/:billId", auth, adminAuth, async (req, res) => {
  try {
    const { billId } = req.params;
    const restaurantId = req.user.restaurant;

    const bill = await Bill.findOneAndDelete({
      _id: billId,
      restaurant: restaurantId,
    });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
