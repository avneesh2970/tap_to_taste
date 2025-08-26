import express from "express";
import Quote from "../models/Quote.js";

const router = express.Router();

// POST /api/quotes
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, business, message } = req.body;

    if (!name || !email || !phone || !business || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const quote = new Quote({ name, email, phone, business, message });
    await quote.save();

    res.status(201).json({ message: "Quote request submitted successfully", quote });
  } catch (error) {
    console.error("Error saving quote request:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Optional: GET all quotes
router.get("/", async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
