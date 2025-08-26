import express from "express";
import Contact from "../models/Conatct.js";

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    res.status(201).json({ message: "Message saved successfully", contact });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// (Optional) GET all messages
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
